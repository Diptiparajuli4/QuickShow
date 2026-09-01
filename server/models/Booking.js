import mongoose from "mongoose";

// =====================================================
// BOOKING SCHEMA
// =====================================================

const bookingSchema = new mongoose.Schema(
    {
        // USER
        user: {
            type: String,
            required: true,
            ref: "User",
        },

        // SHOW
        show: {
            type: String,
            required: true,
            ref: "Show",
        },

        // TOTAL BOOKING AMOUNT
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        // BOOKED SEATS
        bookedSeats: {
            type: [String],
            required: true,
        },

        // PAYMENT STATUS
        isPaid: {
            type: Boolean,
            default: false,
        },

        // PAYMENT LINK
        paymentLink: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model(
    "Booking",
    bookingSchema
);

export default Booking;