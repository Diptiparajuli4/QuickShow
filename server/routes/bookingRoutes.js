import express from "express";

import {
    createBooking,
    getOccupiedSeats,
    getAllBookings,
    getBookingById,
    getMyBookings,
    payBooking,
    createStripeCheckoutSession,
    verifyStripePayment,
    createStripePaymentIntent,
    verifyStripePaymentIntent,   // <-- NEW
} from "../controllers/bookingController.js";

import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

// =====================================================
// BOOKING CRUD
// =====================================================

bookingRouter.post(
    "/create",
    protect,
    createBooking
);

bookingRouter.get(
    "/my",
    protect,
    getMyBookings
);

bookingRouter.get(
    "/occupied-seats/:showId",
    getOccupiedSeats
);

bookingRouter.get(
    "/all",
    getAllBookings
);

bookingRouter.put(
    "/pay/:bookingId",
    protect,
    payBooking
);

// =====================================================
// STRIPE PAYMENT ROUTES
// =====================================================

// Redirect Checkout (legacy – kept for backward compatibility)
bookingRouter.post(
    "/stripe/create-checkout-session/:bookingId",
    protect,
    createStripeCheckoutSession
);

// Embedded Elements – create PaymentIntent
bookingRouter.post(
    "/stripe/create-payment-intent/:bookingId",
    protect,
    createStripePaymentIntent
);

// Verify PaymentIntent (for embedded Elements)
bookingRouter.post(
    "/stripe/verify-payment-intent",
    protect,
    verifyStripePaymentIntent   // <-- NEW ROUTE
);

// Verify payment (works for both Checkout and Elements)
bookingRouter.post(
    "/stripe/verify",
    protect,
    verifyStripePayment
);

// =====================================================
// GET SINGLE BOOKING (must be last to avoid route conflicts)
// =====================================================

bookingRouter.get(
    "/:bookingId",
    getBookingById
);

export default bookingRouter;