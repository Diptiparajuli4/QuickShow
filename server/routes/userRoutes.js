
import express from "express";

import {
    registerUser,
    loginUser,
    getUserBookings,
    updateFavourites,
    getFavourites
} from "../controllers/userController.js";

import { protect } from "../middleWare/auth.js";

const userRouter = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

// Create new user account
userRouter.post(
    "/signup",
    registerUser
);

// Login existing user
userRouter.post(
    "/login",
    loginUser
);


// ==========================================
// USER BOOKINGS
// ==========================================

// Get logged-in user's bookings
userRouter.get(
    "/bookings",
    protect,
    getUserBookings
);


// ==========================================
// FAVOURITE MOVIES
// ==========================================

// Add/remove favourite movie
userRouter.post(
    "/update-favourite",
    protect,
    updateFavourites
);


// Get favourite movies
userRouter.get(
    "/favourites",
    protect,
    getFavourites
);

export default userRouter;
