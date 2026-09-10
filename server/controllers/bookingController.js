import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import Theater from "../models/Theater.js";
import { sendEmail } from "../utils/sendEmail.js";
import stripe from "../services/stripeService.js";

// =====================================================
// REAL-TIME ANALYTICS EVENT
// =====================================================

const emitAnalyticsUpdated = (req, reason) => {
    try {
        const io = req.app.get("io");

        if (!io) {
            console.log(
                "Socket.IO instance not available"
            );
            return;
        }

        io.emit("analyticsUpdated", {
            reason,
            timestamp: new Date().toISOString(),
        });

        console.log(
            `📊 Analytics updated: ${reason}`
        );
    } catch (error) {
        console.error(
            "Analytics socket error:",
            error.message
        );
    }
};

// =====================================================
// GET USER ID
// =====================================================

const getUserId = (req) => {
    console.log(
        "USER FROM AUTH MIDDLEWARE:",
        req.user
    );

    if (!req.user) return null;

    if (!req.user.id) return null;

    return String(req.user.id);
};

// =====================================================
// CHECK SEAT AVAILABILITY
// =====================================================

const checkSeatsAvailability = async (
    showId,
    selectedSeats
) => {
    try {
        const showData =
            await Show.findById(showId);

        if (!showData) return false;

        const occupiedSeats =
            showData.occupiedSeats || {};

        const isAnySeatTaken =
            selectedSeats.some(
                (seat) =>
                    occupiedSeats[seat]
            );

        return !isAnySeatTaken;
    } catch (error) {
        console.error(
            "Seat availability error:",
            error.message
        );

        return false;
    }
};

// =====================================================
// DELETE BOOKING HELPER
//
// Removes booking from EVERY place:
//   1. show.occupiedSeats (frees the seats)
//   2. user.bookings array (pulls the ID)
//   3. bookings collection (deletes the document)
//
// Use this EVERY time you delete a booking.
// =====================================================

const deleteBookingAndCleanup = async (
    booking,
    userId
) => {
    // 1. Free seats in show

    const show =
        await Show.findById(
            booking.show
        );

    if (
        show &&
        show.occupiedSeats
    ) {
        booking.bookedSeats.forEach(
            (seat) => {
                if (
                    show.occupiedSeats[
                        seat
                    ] === userId
                ) {
                    delete show
                        .occupiedSeats[
                        seat
                    ];
                }
            }
        );

        show.markModified(
            "occupiedSeats"
        );

        await show.save();
    }

    // 2. Remove booking reference
    // from user

    if (userId) {
        await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    bookings:
                        booking._id,
                },
            }
        );
    }

    // 3. Delete booking

    await Booking.findByIdAndDelete(
        booking._id
    );

    console.log(
        `✅ Deleted booking ${booking._id} and cleaned up references.`
    );
};

// =====================================================
// CREATE BOOKING
// POST /booking/create
// =====================================================

export const createBooking = async (
    req,
    res
) => {
    try {
        console.log(
            "======================================"
        );

        console.log(
            "CREATE BOOKING REQUEST"
        );

        console.log(
            "Request body:",
            req.body
        );

        const userId =
            getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "User is not authenticated.",
            });
        }

        const {
            showId,
            selectedSeats,
            theaterId,
        } = req.body;

        if (!showId) {
            return res.status(400).json({
                success: false,
                message:
                    "Show ID is required.",
            });
        }

        if (
            !Array.isArray(
                selectedSeats
            ) ||
            selectedSeats.length ===
                0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please select at least one seat.",
            });
        }

        const uniqueSeats = [
            ...new Set(
                selectedSeats.map(
                    (seat) =>
                        String(seat)
                )
            ),
        ];

        if (
            uniqueSeats.length > 5
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You can book a maximum of 5 seats.",
            });
        }

        const showData =
            await Show.findById(
                showId
            ).populate("movie");

        if (!showData) {
            return res.status(404).json({
                success: false,
                message:
                    "Show not found.",
            });
        }

        if (!showData.movie) {
            return res.status(404).json({
                success: false,
                message:
                    "Movie for this show was not found.",
            });
        }

        const movie =
            showData.movie;

        const isAvailable =
            await checkSeatsAvailability(
                showId,
                uniqueSeats
            );

        if (!isAvailable) {
            return res.status(409).json({
                success: false,
                message:
                    "One or more selected seats are already booked.",
            });
        }

        const showPrice =
            Number(
                showData.showPrice
            );

        if (
            !Number.isFinite(
                showPrice
            ) ||
            showPrice <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid show price.",
            });
        }

        const showDateTime =
            showData.showDateTime;

        if (!showDateTime) {
            return res.status(400).json({
                success: false,
                message:
                    "Show date and time are not available.",
            });
        }

        const totalAmount =
            showPrice *
            uniqueSeats.length;

        const resolvedTheaterId =
            theaterId ||
            showData.theaterId ||
            null;

        if (!resolvedTheaterId) {
            console.log(
                "❌ Booking rejected: theaterId missing"
            );

            return res.status(400).json({
                success: false,
                message:
                    "Theater is required to book tickets. Please select a theater first.",
            });
        }

        const theaterDoc =
            await Theater.findById(
                resolvedTheaterId
            );

        if (!theaterDoc) {
            console.log(
                "❌ Booking rejected: theater not found —",
                resolvedTheaterId
            );

            return res.status(400).json({
                success: false,
                message:
                    "Selected theater was not found. Please select a valid theater.",
            });
        }

        console.log(
            "✅ Resolved theaterId for booking:",
            resolvedTheaterId,
            "→",
            theaterDoc.name
        );

        const booking =
            await Booking.create({
                user: userId,

                show: String(
                    showData._id
                ),

                theaterId: resolvedTheaterId,

                movieId: String(
                    movie._id
                ),

                movieName:
                    movie.title || "",

                poster:
                    movie.poster_path ||
                    "",

                showDateTime,

                showPrice,

                runtime:
                    Number(
                        movie.runtime
                    ) || 0,

                amount:
                    totalAmount,

                bookedSeats:
                    uniqueSeats,

                isPaid: false,

                paymentLink: "",

                pidx: "",

                transactionId: "",

                paymentMethod: null,
                paymentId: null,
            });

        console.log(
            "🔄 Updating user bookings with booking ID:",
            booking._id
        );

        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    bookings:
                        booking._id,
                },
            }
        );

        console.log(
            "✅ User bookings updated."
        );

        if (
            !showData.occupiedSeats
        ) {
            showData.occupiedSeats = {};
        }

        uniqueSeats.forEach(
            (seat) => {
                showData.occupiedSeats[
                    seat
                ] = userId;
            }
        );

        showData.markModified(
            "occupiedSeats"
        );

        await showData.save();

        emitAnalyticsUpdated(
            req,
            "booking_created"
        );

        console.log(
            "BOOKING CREATED SUCCESSFULLY"
        );

        console.log(
            "======================================"
        );

        return res.status(201).json({
            success: true,
            message:
                "Booking successful.",
            booking,
        });
    } catch (error) {
        console.error(
            "CREATE BOOKING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create booking.",
        });
    }
};

// =====================================================
// GET OCCUPIED SEATS
// GET /booking/occupied-seats/:showId
// =====================================================

export const getOccupiedSeats =
    async (req, res) => {
        try {
            const {
                showId,
            } = req.params;

            if (!showId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Show ID is required.",
                });
            }

            const showData =
                await Show.findById(
                    showId
                );

            if (!showData) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Show not found.",
                });
            }

            const occupiedSeats =
                Object.keys(
                    showData.occupiedSeats ||
                        {}
                );

            return res.status(200).json({
                success: true,
                occupiedSeats,
            });
        } catch (error) {
            console.error(
                "GET OCCUPIED SEATS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Failed to get occupied seats.",
            });
        }
    };

// =====================================================
// GET MY BOOKINGS
// GET /booking/my
// =====================================================

export const getMyBookings =
    async (req, res) => {
        try {
            const userId =
                getUserId(req);

            if (!userId) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "User is not authenticated.",
                    });
            }

            const allBookings =
                await Booking.find({
                    user: userId,
                })
                    .populate(
                        "theaterId",
                        "name city address latitude longitude"
                    )
                    .sort({ createdAt: -1 });

            const now =
                new Date();

            const tenMinutesAgo =
                new Date(
                    now.getTime() -
                        10 *
                            60 *
                            1000
                );

            const validBookings = [];

            for (
                const booking of allBookings
            ) {
                if (
                    booking.isPaid
                ) {
                    validBookings.push(
                        booking
                    );

                    continue;
                }

                if (
                    booking.createdAt <
                    tenMinutesAgo
                ) {
                    await deleteBookingAndCleanup(
                        booking,
                        userId
                    );
                } else {
                    validBookings.push(
                        booking
                    );
                }
            }

            validBookings.sort(
                (a, b) =>
                    b.createdAt -
                    a.createdAt
            );

            return res
                .status(200)
                .json({
                    success: true,
                    bookings:
                        validBookings,
                });
        } catch (error) {
            console.error(
                "GET MY BOOKINGS ERROR:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        error.message ||
                        "Unable to get bookings.",
                });
        }
    };

// =====================================================
// GET ALL BOOKINGS (admin)
// GET /booking/all
// =====================================================

export const getAllBookings = async (req, res) => {
    try {
        await cleanupExpiredBookings();

        const bookings = await Booking.find()
            .populate("user", "name email")
            .populate(
                "theaterId",
                "name city address latitude longitude"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("GET ALL BOOKINGS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Unable to get all bookings.",
        });
    }
};

// =====================================================
// GET ONE BOOKING
// GET /booking/:bookingId
// =====================================================

export const getBookingById =
    async (req, res) => {
        try {
            const {
                bookingId,
            } = req.params;

            if (!bookingId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Booking ID is required.",
                });
            }

            const booking =
                await Booking.findById(
                    bookingId
                )
                    .populate(
                        "user",
                        "name email"
                    )
                    .populate(
                        "theaterId",
                        "name city address latitude longitude"
                    );

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Booking not found.",
                });
            }

            return res.status(200).json({
                success: true,
                booking,
            });
        } catch (error) {
            console.error(
                "GET BOOKING ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to get booking.",
            });
        }
    };

// =====================================================
// PAY BOOKING (Manual payment)
// PUT /booking/pay/:bookingId
// =====================================================

export const payBooking = async (
    req,
    res
) => {
    try {
        const userId =
            getUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "User is not authenticated.",
            });
        }

        const {
            bookingId,
        } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message:
                    "Booking ID is required.",
            });
        }

        const booking =
            await Booking.findById(
                bookingId
            ).populate(
                "user",
                "name email"
            );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message:
                    "Booking not found.",
            });
        }

        if (
            String(
                booking.user._id ||
                    booking.user
            ) !==
            String(userId)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You cannot pay for this booking.",
            });
        }

        if (booking.isPaid) {
            return res.status(400).json({
                success: false,
                message:
                    "Booking is already paid.",
            });
        }

        booking.isPaid =
            true;

        booking.paymentLink =
            "";

        await booking.save();

        emitAnalyticsUpdated(
            req,
            "booking_paid"
        );

        res.status(200).json({
            success: true,
            message:
                "Payment successful.",
            booking,
        });

        const userEmail =
            booking.user?.email;

        const userName =
            booking.user?.name ||
            "Movie Goer";

        if (userEmail) {
            const subject =
                "🎟️ Payment Confirmed - QuickShow Ticket";

            const populatedBooking =
                await Booking.findById(
                    booking._id
                )
                    .populate(
                        "theaterId",
                        "name city address"
                    )
                    .lean();

            const theaterDoc =
                populatedBooking?.theaterId;

            const theaterLine =
                theaterDoc?.name
                    ? `
                        <p><strong>Theater:</strong> ${theaterDoc.name}</p>
                        ${
                            theaterDoc.city ||
                            theaterDoc.address
                                ? `<p><strong>Location:</strong> ${[
                                      theaterDoc.city,
                                      theaterDoc.address,
                                  ]
                                      .filter(Boolean)
                                      .join(", ")}</p>`
                                : ""
                        }
                    `
                    : "";

            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #e50914; text-align: center;">Payment Successful! 🎬</h2>
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>Thank you for your payment. Your movie tickets have been fully confirmed and secured.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p><strong>Movie:</strong> ${booking.movieName}</p>
                    ${theaterLine}
                    <p><strong>Show Time:</strong> ${new Date(
                        booking.showDateTime
                    ).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}</p>
                    <p><strong>Seats:</strong> ${booking.bookedSeats.join(", ")}</p>
                    <p><strong>Total Amount Paid:</strong> Rs. ${booking.amount}</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p style="text-align: center; color: #666; font-size: 14px;">Enjoy your movie experience with QuickShow! 🍿</p>
                </div>
            `;

            sendEmail(
                userEmail,
                subject,
                htmlMessage
            );
        }
    } catch (error) {
        console.error(
            "PAY BOOKING ERROR:",
            error
        );

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Payment failed.",
            });
        }
    }
};

// =====================================================
// STRIPE: CREATE CHECKOUT SESSION
// POST /booking/stripe/create-checkout-session/:bookingId
// =====================================================

export const createStripeCheckoutSession = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
        }

        const { bookingId } = req.params;
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required.",
            });
        }

        const booking = await Booking.findById(bookingId).populate("user", "name email");
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (String(booking.user._id || booking.user) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to pay for this booking.",
            });
        }

        if (booking.isPaid) {
            return res.status(400).json({
                success: false,
                message: "This booking has already been paid.",
            });
        }

        const nprAmount = Number(booking.amount);
        if (!Number.isFinite(nprAmount) || nprAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking amount.",
            });
        }

        const amountInPaisa = Math.round(nprAmount * 100);
        if (amountInPaisa < 50) {
            return res.status(400).json({
                success: false,
                message: "Minimum payment amount is 0.50 NPR.",
            });
        }

        const movieName = booking.movieName || "Movie Ticket";
        const seats = booking.bookedSeats?.join(", ") || "Selected seats";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: booking.user?.email || undefined,
            line_items: [
                {
                    price_data: {
                        currency: "npr",
                        product_data: {
                            name: movieName,
                            description: `Seats: ${seats}`,
                        },
                        unit_amount: amountInPaisa,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                bookingId: booking._id.toString(),
                amountNPR: nprAmount.toString(),
            },
            success_url: `${process.env.CLIENT_URL}/my-booking?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/my-booking?payment=cancelled`,
        });

        return res.status(200).json({
            success: true,
            sessionId: session.id,
            payment_url: session.url,
            amount: nprAmount,
            currency: "NPR",
        });
    } catch (error) {
        console.error("STRIPE CREATE SESSION ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create Stripe checkout session.",
            error: error.message,
        });
    }
};

// =====================================================
// STRIPE: VERIFY PAYMENT (for Checkout redirect)
// POST /booking/stripe/verify
// =====================================================

export const verifyStripePayment = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
        }

        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Stripe session ID is required.",
            });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Stripe session not found.",
            });
        }

        const bookingId = session.metadata?.bookingId;
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID missing from Stripe session.",
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (String(booking.user) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to verify this payment.",
            });
        }

        if (booking.isPaid) {
            return res.status(200).json({
                success: true,
                message: "Booking is already marked as paid.",
                booking,
            });
        }

        if (session.payment_status !== "paid") {
            return res.status(400).json({
                success: false,
                message: "Payment has not been completed.",
                payment_status: session.payment_status,
            });
        }

        if (session.currency?.toLowerCase() !== "npr") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment currency.",
                expected: "npr",
                received: session.currency,
            });
        }

        const expectedAmountInPaisa = Math.round(Number(booking.amount) * 100);
        const paidAmountInPaisa = Number(session.amount_total);
        if (paidAmountInPaisa !== expectedAmountInPaisa) {
            return res.status(400).json({
                success: false,
                message: "Payment amount does not match booking amount.",
                expected: expectedAmountInPaisa,
                received: paidAmountInPaisa,
            });
        }

        booking.isPaid = true;
        booking.paymentMethod = "Stripe";
        booking.paymentId = session.payment_intent || session.id;
        await booking.save();

        emitAnalyticsUpdated(req, "stripe_payment_completed");

        const user = await User.findById(userId);
        if (user?.email) {
            const subject = "🎟️ Payment Confirmed - QuickShow Ticket";

            const populatedBooking = await Booking.findById(booking._id)
                .populate("theaterId", "name city address")
                .lean();

            const theaterDoc = populatedBooking?.theaterId;

            const theaterLine = theaterDoc?.name
                ? `
                    <p><strong>Theater:</strong> ${theaterDoc.name}</p>
                    ${
                        theaterDoc.city || theaterDoc.address
                            ? `<p><strong>Location:</strong> ${[
                                  theaterDoc.city,
                                  theaterDoc.address,
                              ]
                                  .filter(Boolean)
                                  .join(", ")}</p>`
                            : ""
                    }
                `
                : "";

            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #e50914; text-align: center;">Payment Successful! 🎬</h2>
                    <p>Hi <strong>${user.name || "Movie Goer"}</strong>,</p>
                    <p>Thank you for your payment. Your movie tickets have been fully confirmed and secured.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p><strong>Movie:</strong> ${booking.movieName}</p>
                    ${theaterLine}
                    <p><strong>Show Time:</strong> ${new Date(
                        booking.showDateTime
                    ).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}</p>
                    <p><strong>Seats:</strong> ${booking.bookedSeats.join(", ")}</p>
                    <p><strong>Total Amount Paid:</strong> Rs. ${booking.amount}</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p style="text-align: center; color: #666; font-size: 14px;">Enjoy your movie experience with QuickShow! 🍿</p>
                </div>
            `;

            sendEmail(user.email, subject, htmlMessage);
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            booking,
            amount: booking.amount,
            currency: "NPR",
        });
    } catch (error) {
        console.error("STRIPE VERIFY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed.",
            error: error.message,
        });
    }
};

// =====================================================
// STRIPE: CREATE PAYMENT INTENT (embedded Elements)
// POST /booking/stripe/create-payment-intent/:bookingId
// =====================================================

export const createStripePaymentIntent = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
        }

        const { bookingId } = req.params;
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required.",
            });
        }

        const booking = await Booking.findById(bookingId).populate("user", "name email");
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (String(booking.user._id || booking.user) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to pay for this booking.",
            });
        }

        if (booking.isPaid) {
            return res.status(400).json({
                success: false,
                message: "Booking is already paid.",
            });
        }

        const nprAmount = Number(booking.amount);
        if (!Number.isFinite(nprAmount) || nprAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking amount.",
            });
        }

        const amountInPaisa = Math.round(nprAmount * 100);
        if (amountInPaisa < 50) {
            return res.status(400).json({
                success: false,
                message: "Minimum amount is 0.50 NPR.",
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaisa,
            currency: "npr",
            metadata: {
                bookingId: booking._id.toString(),
                userId: userId,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error("STRIPE PAYMENT INTENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create payment intent.",
            error: error.message,
        });
    }
};

// =====================================================
// STRIPE: VERIFY PAYMENT INTENT (embedded Elements)
// POST /booking/stripe/verify-payment-intent
// =====================================================

export const verifyStripePaymentIntent = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User is not authenticated.",
            });
        }

        const { paymentIntentId, bookingId } = req.body;
        if (!paymentIntentId || !bookingId) {
            return res.status(400).json({
                success: false,
                message: "PaymentIntent ID and Booking ID are required.",
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (!paymentIntent) {
            return res.status(404).json({
                success: false,
                message: "PaymentIntent not found.",
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }
        if (String(booking.user) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to verify this payment.",
            });
        }

        if (booking.isPaid) {
            return res.status(200).json({
                success: true,
                message: "Booking is already marked as paid.",
                booking,
            });
        }

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({
                success: false,
                message: "Payment not successful.",
                status: paymentIntent.status,
            });
        }

        if (paymentIntent.currency?.toLowerCase() !== "npr") {
            return res.status(400).json({
                success: false,
                message: "Invalid currency.",
            });
        }
        const expectedAmount = Math.round(Number(booking.amount) * 100);
        if (paymentIntent.amount !== expectedAmount) {
            return res.status(400).json({
                success: false,
                message: "Amount mismatch.",
            });
        }

        booking.isPaid = true;
        booking.paymentMethod = "Stripe (Elements)";
        booking.paymentId = paymentIntent.id;
        await booking.save();

        emitAnalyticsUpdated(req, "stripe_payment_completed");

        const user = await User.findById(userId);
        if (user?.email) {
            const subject = "🎟️ Payment Confirmed - QuickShow Ticket";

            const populatedBooking = await Booking.findById(booking._id)
                .populate("theaterId", "name city address")
                .lean();

            const theaterDoc = populatedBooking?.theaterId;

            const theaterLine = theaterDoc?.name
                ? `
                    <p><strong>Theater:</strong> ${theaterDoc.name}</p>
                    ${
                        theaterDoc.city || theaterDoc.address
                            ? `<p><strong>Location:</strong> ${[
                                  theaterDoc.city,
                                  theaterDoc.address,
                              ]
                                  .filter(Boolean)
                                  .join(", ")}</p>`
                            : ""
                    }
                `
                : "";

            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #e50914; text-align: center;">Payment Successful! 🎬</h2>
                    <p>Hi <strong>${user.name || "Movie Goer"}</strong>,</p>
                    <p>Thank you for your payment. Your movie tickets have been fully confirmed and secured.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p><strong>Movie:</strong> ${booking.movieName}</p>
                    ${theaterLine}
                    <p><strong>Show Time:</strong> ${new Date(
                        booking.showDateTime
                    ).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}</p>
                    <p><strong>Seats:</strong> ${booking.bookedSeats.join(", ")}</p>
                    <p><strong>Total Amount Paid:</strong> Rs. ${booking.amount}</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p style="text-align: center; color: #666; font-size: 14px;">Enjoy your movie experience with QuickShow! 🍿</p>
                </div>
            `;

            sendEmail(user.email, subject, htmlMessage);
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and booking updated.",
            booking,
        });
    } catch (error) {
        console.error("VERIFY PAYMENT INTENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed.",
            error: error.message,
        });
    }
};

// =====================================================
// GLOBAL CLEANUP (removes unpaid bookings older than 15 min)
// =====================================================

export const cleanupExpiredBookings =
    async () => {
        try {
            const now =
                new Date();

            const tenMinutesAgo =
                new Date(
                    now.getTime() -
                        15 * 60 * 1000
                );

            const expiredBookings =
                await Booking.find({
                    isPaid: false,

                    createdAt: {
                        $lt: tenMinutesAgo,
                    },
                });

            if (
                expiredBookings.length ===
                0
            ) {
                return;
            }

            console.log(
                `🔄 Found ${expiredBookings.length} expired booking(s). Cleaning up...`
            );

            for (
                const booking of expiredBookings
            ) {
                await deleteBookingAndCleanup(
                    booking,
                    booking.user
                );
            }

            console.log(
                "✅ Global cleanup complete."
            );
        } catch (error) {
            console.error(
                "❌ Cleanup error:",
                error
            );
        }
    };

// =====================================================
// NEW: CLEANUP ORPHANED BOOKINGS
//
// Finds bookings in `bookings` collection where:
//   - user does not exist, OR
//   - user's `bookings` array does not include the booking ID
//
// Then removes each one via deleteBookingAndCleanup()
// (which also frees seats and pulls from user array).
//
// Call this:
//   - Once now (to fix existing orphans)
//   - Periodically via a cron / endpoint
// =====================================================

export const cleanupOrphanedBookings = async () => {
    try {
        console.log(
            "🧹 Starting orphaned booking cleanup..."
        );

        // 1. Fetch all bookings
        const allBookings = await Booking.find().lean();

        console.log(
            `   Total bookings in DB: ${allBookings.length}`
        );

        // 2. Fetch all users (with only their bookings array + email)
        const allUsers = await User.find(
            {},
            "bookings email name"
        ).lean();

        // 3. Build a Set of booking IDs referenced by ANY user
        const referencedBookingIds = new Set();
        allUsers.forEach((user) => {
            (user.bookings || []).forEach((id) => {
                referencedBookingIds.add(String(id));
            });
        });

        // 4. Build a Set of existing user IDs
        const userIds = new Set(
            allUsers.map((u) => String(u._id))
        );

        // 5. Find orphans
        const orphans = allBookings.filter((booking) => {
            const bookingIdStr = String(booking._id);
            const userIdStr = String(booking.user);

            // Orphan if the user no longer exists
            if (!userIds.has(userIdStr)) {
                return true;
            }

            // Orphan if no user references this booking
            if (!referencedBookingIds.has(bookingIdStr)) {
                return true;
            }

            return false;
        });

        console.log(
            `   Found ${orphans.length} orphaned booking(s)`
        );

        if (orphans.length === 0) {
            console.log("   ✅ No orphans. Done.");
            return { deleted: 0 };
        }

        // 6. Delete each orphan with full cleanup
        let deleted = 0;
        for (const booking of orphans) {
            try {
                await deleteBookingAndCleanup(
                    booking,
                    booking.user
                );
                deleted++;
            } catch (err) {
                console.error(
                    `   ❌ Failed to delete orphan ${booking._id}:`,
                    err.message
                );
            }
        }

        console.log(
            `✅ Orphan cleanup complete. Deleted ${deleted} booking(s).`
        );

        return { deleted };
    } catch (error) {
        console.error(
            "❌ Orphan cleanup error:",
            error
        );

        return { deleted: 0, error: error.message };
    }
};

// =====================================================
// DELETE ONE BOOKING (with full cascade)
// DELETE /booking/:bookingId
//
// Admin / owner can delete a booking. It will be
// removed from:
//   - show.occupiedSeats
//   - user.bookings array
//   - bookings collection
// =====================================================

export const deleteBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required.",
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        await deleteBookingAndCleanup(booking, booking.user);

        emitAnalyticsUpdated(req, "booking_deleted");

        return res.status(200).json({
            success: true,
            message: "Booking deleted and references cleaned up.",
            deletedBookingId: bookingId,
        });
    } catch (error) {
        console.error("DELETE BOOKING ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete booking.",
        });
    }
};