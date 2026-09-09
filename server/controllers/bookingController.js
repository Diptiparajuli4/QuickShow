import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import stripe from "../services/stripeService.js";

// =====================================================
// NEW: REAL-TIME ANALYTICS EVENT
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

    await User.findByIdAndUpdate(
        userId,
        {
            $pull: {
                bookings:
                    booking._id,
            },
        }
    );

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

        const booking =
            await Booking.create({
                user: userId,

                show: String(
                    showData._id
                ),

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

                // Stripe fields (optional, will be set later)
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

        // =================================================
        // NEW: REAL-TIME ANALYTICS
        // =================================================

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
                });

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
// GET ALL BOOKINGS (UPDATED: cleans expired before return)
// GET /booking/all
// =====================================================

export const getAllBookings = async (req, res) => {
    try {
        // ✅ Clean up expired unpaid bookings before returning the list
        await cleanupExpiredBookings();

        const bookings = await Booking.find()
            .populate("user", "name email")
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
// PAY BOOKING (Manual payment – keep as is)
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

        // =================================================
        // NEW: REAL-TIME ANALYTICS
        // =================================================

        emitAnalyticsUpdated(
            req,
            "booking_paid"
        );

        // Send response

        res.status(200).json({
            success: true,
            message:
                "Payment successful.",
            booking,
        });

        // =================================================
        // EMAIL
        // =================================================

        const userEmail =
            booking.user?.email;

        const userName =
            booking.user?.name ||
            "Movie Goer";

        if (userEmail) {
            const subject =
                "🎟️ Payment Confirmed - QuickShow Ticket";

            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #e50914; text-align: center;">Payment Successful! 🎬</h2>
                    <p>Hi <strong>${userName}</strong>,</p>
                    <p>Thank you for your payment. Your movie tickets have been fully confirmed and secured.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p><strong>Movie:</strong> ${booking.movieName}</p>
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

        // Check ownership
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
// STRIPE: VERIFY PAYMENT (for Checkout)
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
            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #e50914; text-align: center;">Payment Successful! 🎬</h2>
                    <p>Hi <strong>${user.name || "Movie Goer"}</strong>,</p>
                    <p>Thank you for your payment. Your movie tickets have been fully confirmed and secured.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p><strong>Movie:</strong> ${booking.movieName}</p>
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
// STRIPE: CREATE PAYMENT INTENT (for embedded Elements)
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
// STRIPE: VERIFY PAYMENT INTENT (for embedded Elements)
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
            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #e50914; text-align: center;">Payment Successful! 🎬</h2>
                    <p>Hi <strong>${user.name || "Movie Goer"}</strong>,</p>
                    <p>Thank you for your payment. Your movie tickets have been fully confirmed and secured.</p>
                    <hr style="border: none; border-top: 1px solid #ddd;" />
                    <p><strong>Movie:</strong> ${booking.movieName}</p>
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
                        15 * 60 * 1000  // 15 minutes
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