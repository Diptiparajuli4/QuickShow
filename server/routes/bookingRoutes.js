import express from "express";

import {
    createBooking,
    getOccupiedSeats,
    getAllBookings,
    getBookingById
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();


// =====================================================
// CREATE BOOKING
// POST /booking/create
// =====================================================

bookingRouter.post(
    "/create",
    createBooking
);


// =====================================================
// GET OCCUPIED SEATS FOR A SHOW
// GET /booking/seats/:showId
// =====================================================

bookingRouter.get(
    "/seats/:showId",
    getOccupiedSeats
);


// =====================================================
// GET ALL BOOKINGS
// GET /booking/all
// Used by Admin List Bookings
// =====================================================

bookingRouter.get(
    "/all",
    getAllBookings
);


// =====================================================
// GET ONE BOOKING
// GET /booking/:bookingId
// =====================================================

bookingRouter.get(
    "/:bookingId",
    getBookingById
);


export default bookingRouter;