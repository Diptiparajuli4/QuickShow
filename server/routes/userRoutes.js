import express from "express";

import {
    getUserBookings,
    updateFavourites,
    getFavourites
} from "../controllers/userController.js";

import { protect } from "../middleWare/auth.js";


const userRouter = express.Router();


// Get logged-in user's bookings
userRouter.get(
    "/bookings",
    protect,
    getUserBookings
);


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