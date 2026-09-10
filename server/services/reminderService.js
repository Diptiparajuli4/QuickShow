import cron from "node-cron";
import Booking from "../models/Booking.js";
import { sendEmail } from "../utils/sendEmail.js";

// =====================================================
// CONFIG — समय सीमा
// =====================================================
const MIN_HOURS = 2;   // Show भन्दा कम्तीमा 2 घण्टा अगाडि
const MAX_HOURS = 3;   // Show भन्दा बढीमा 3 घण्टा अगाडि

// =====================================================
// Theater info
// =====================================================
const buildTheaterLine = (theater) => {
    if (!theater?.name) return "";

    const location = [theater.city, theater.address]
        .filter(Boolean)
        .join(", ");

    return `
        <p><strong>Theater:</strong> ${theater.name}</p>
        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
    `;
};

// =====================================================
// Show time format
// =====================================================
const formatShowTime = (date) =>
    new Date(date).toLocaleString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

// =====================================================
// कति समय बाँकी छ — "in 2h 30m"
// =====================================================
const getTimeUntilShow = (showDateTime) => {
    const now = new Date();
    const diffMs = new Date(showDateTime) - now;
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 60) {
        return `in ${diffMins} minutes`;
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (mins === 0) return `in ${hours} hour${hours > 1 ? "s" : ""}`;
    return `in ${hours}h ${mins}m`;
};

// =====================================================
// MAIN — Reminder पठाउने
// =====================================================
export const sendUpcomingReminders = async () => {
    try {
        const now = new Date();

        // कति देखि कति समय भित्र show हुने bookings खोज्ने
        const from = new Date(now.getTime() + MIN_HOURS * 60 * 60 * 1000);
        const to = new Date(now.getTime() + MAX_HOURS * 60 * 60 * 1000);

        console.log(
            `⏰ Checking reminders — show between ${MIN_HOURS}h and ${MAX_HOURS}h from now`
        );
        console.log(
            `   Time range: ${from.toLocaleTimeString()} → ${to.toLocaleTimeString()}`
        );

        // =====================================================
        // Database query
        // -----------------------------------------------------
        // 1. isPaid: true              → payment भएको
        // 2. reminderSent: false       → reminder नपठाएको
        // 3. showDateTime in window    → 2-3h भित्रको show
        // 4. NEW: booking गरेको समय र show बीचको gap
        //    कम्तीमा MIN_HOURS छ → नभए skip
        // =====================================================
        const bookings = await Booking.find({
            isPaid: true,
            reminderSent: false,
            showDateTime: {
                $gte: from,
                $lt: to,
            },
            // NEW: gap check at database level
            $expr: {
                $gte: [
                    { $subtract: ["$showDateTime", "$createdAt"] },
                    MIN_HOURS * 60 * 60 * 1000, // milliseconds
                ],
            },
        })
            .populate("user", "name email")
            .populate("theaterId", "name city address")
            .lean();

        console.log(`   Found ${bookings.length} bookings`);

        // Debug: किन skip भयो भनेर हेर्न
        // (यो log optional — production मा हटाउन सकिन्छ)
        const skipped = await Booking.find({
            isPaid: true,
            reminderSent: false,
            showDateTime: {
                $gte: from,
                $lt: to,
            },
            $expr: {
                $lt: [
                    { $subtract: ["$showDateTime", "$createdAt"] },
                    MIN_HOURS * 60 * 60 * 1000,
                ],
            },
        }).lean();

        if (skipped.length > 0) {
            console.log(
                `   ⏭️ Skipped ${skipped.length} booking(s) — booked too close to show time`
            );

            // ती booking हरू कहिल्यै reminder नपाओस् भनेर mark गर्ने
            for (const s of skipped) {
                await Booking.updateOne(
                    { _id: s._id },
                    {
                        $set: {
                            reminderSent: true,
                            reminderSentAt: null, // "no reminder sent" marker
                        },
                    }
                );
            }
        }

        if (bookings.length === 0) {
            return;
        }

        // प्रत्येक booking को reminder पठाउने
        for (const booking of bookings) {
            try {
                const email = booking.user?.email;
                const name = booking.user?.name || "Movie Goer";

                if (!email) {
                    console.log(`   ⚠️ No email for booking ${booking._id}`);
                    continue;
                }

                const theaterLine = buildTheaterLine(booking.theaterId);
                const timeUntil = getTimeUntilShow(booking.showDateTime);

                const subject = `⏰ Reminder: "${booking.movieName}" starts ${timeUntil}`;

                const htmlMessage = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                        <h2 style="color: #e50914; text-align: center;">Your Show Starts Soon! ⏰</h2>
                        <p>Hi <strong>${name}</strong>,</p>
                        <p>
                            तपाईंको movie <strong>${booking.movieName}</strong>
                            <strong>${timeUntil}</strong> सुरु हुँदैछ।
                        </p>
                        <hr style="border: none; border-top: 1px solid #ddd;" />
                        <p><strong>Movie:</strong> ${booking.movieName}</p>
                        ${theaterLine}
                        <p><strong>Show Time:</strong> ${formatShowTime(booking.showDateTime)}</p>
                        <p><strong>Seats:</strong> ${booking.bookedSeats.join(", ")}</p>
                        <hr style="border: none; border-top: 1px solid #ddd;" />
                        <p style="text-align: center; color: #666; font-size: 14px;">
                            Please arrive at least 15 minutes early. 🍿<br/>
                            Enjoy the show with QuickShow!
                        </p>
                    </div>
                `;

                await sendEmail(email, subject, htmlMessage);

                await Booking.updateOne(
                    { _id: booking._id },
                    {
                        $set: {
                            reminderSent: true,
                            reminderSentAt: new Date(),
                        },
                    }
                );

                console.log(
                    `   ✅ Sent to ${email} — "${booking.movieName}" ${timeUntil}`
                );
            } catch (err) {
                console.error(
                    `   ❌ Failed for booking ${booking._id}:`,
                    err.message
                );
            }
        }
    } catch (error) {
        console.error("REMINDER ERROR:", error);
    }
};

// =====================================================
// हरेक 30 मिनेटमा check
// =====================================================
export const startReminderScheduler = () => {
    console.log(
        `📅 Reminder scheduler started — checks every 30 min`
    );
    console.log(
        `📬 Sends reminder ${MIN_HOURS}-${MAX_HOURS}h before show`
    );
    console.log(
        `⏭️ Skips bookings made less than ${MIN_HOURS}h before show`
    );

    cron.schedule("*/30 * * * *", async () => {
        await sendUpcomingReminders();
    });
};