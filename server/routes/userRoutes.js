import express from "express";

import {
    loginUser,
    signupUser,
    getCurrentUser,
    toggleFavourite,
    createBooking,
    getMyBookings,
} from "../controllers/userController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// =====================================================
// SIGNUP
// =====================================================

router.post("/signup", signupUser);

// =====================================================
// LOGIN
// =====================================================

router.post("/login", loginUser);

// =====================================================
// CURRENT LOGGED-IN USER
// =====================================================

router.get("/me", protect, getCurrentUser);

// =====================================================
// ADD / REMOVE FAVOURITE
// =====================================================

router.post(
    "/favourite/:movieId",
    protect,
    toggleFavourite
);

// =====================================================
// CREATE BOOKING
// =====================================================

router.post(
    "/booking",
    protect,
    createBooking
);

// =====================================================
// GET USER BOOKINGS
// =====================================================

router.get(
    "/bookings",
    protect,
    getMyBookings
);

export default router;