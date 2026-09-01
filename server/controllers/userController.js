
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ==========================================
// CREATE JWT TOKEN
// ==========================================

const createToken = (userId) => {

    return jwt.sign(
        {
            id: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

};


// ==========================================
// SIGNUP / REGISTER USER
// ==========================================

export const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Check required fields
        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill in all fields"
            });

        }


        // Check if email already exists
        const existingUser = await User.findOne({
            email
        });


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user
        const user = await User.create({

            name,

            email,

            password: hashedPassword,

            favourites: []

        });


        // Create login token
        const token =
            createToken(user._id);


        // Don't send password to frontend
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin === true || user.role === "admin"
        };


        return res.status(201).json({

            success: true,

            message: "Account created successfully",

            user: userResponse,

            token

        });


    } catch (error) {

        console.log(
            "Signup error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// ==========================================
// LOGIN USER
// ==========================================

export const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Check fields
        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        // Find user
        const user = await User.findOne({
            email
        });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // Compare password
        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isPasswordCorrect) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // Create token
        const token =
            createToken(user._id);


        // User information sent to frontend
        const userResponse = {

            id: user._id,

            name: user.name,

            email: user.email,

            role: user.role

        };


        return res.status(200).json({

            success: true,

            message: "Login successful",

            user: userResponse,

            token

        });


    } catch (error) {

        console.log(
            "Login error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// ==========================================
// GET USER BOOKINGS
// ==========================================

export const getUserBookings = async (req, res) => {

    try {

        // User id comes from JWT middleware
        const userId = req.user.id;


        const bookings = await Booking.find({
            user: userId
        })
            .populate({
                path: "show",
                populate: {
                    path: "movie"
                }
            })
            .sort({
                createdAt: -1
            });


        res.json({

            success: true,

            bookings

        });


    } catch (error) {

        console.log(error.message);


        res.json({

            success: false,

            message: error.message

        });

    }

};


// ==========================================
// ADD / REMOVE FAVOURITE MOVIE
// ==========================================

export const updateFavourites = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            movieId
        } = req.body;


        const user =
            await User.findById(userId);


        if (!user) {

            return res.json({

                success: false,

                message: "User not found"

            });

        }


        // Add movie if not already favourite
        if (!user.favourites.includes(movieId)) {

            user.favourites.push(movieId);

        }

        // Remove movie if already favourite
        else {

            user.favourites =
                user.favourites.filter(
                    (id) =>
                        id.toString() !== movieId
                );

        }


        await user.save();


        res.json({

            success: true,

            message:
                "Favourite movies updated successfully"

        });


    } catch (error) {

        console.log(error.message);


        res.json({

            success: false,

            message: error.message

        });

    }

};


// ==========================================
// GET FAVOURITE MOVIES
// ==========================================

export const getFavourites = async (req, res) => {

    try {

        const userId = req.user.id;


        const user =
            await User.findById(userId);


        if (!user) {

            return res.json({

                success: false,

                message: "User not found"

            });

        }


        const movies = await Movie.find({

            _id: {
                $in: user.favourites
            }

        });


        res.json({

            success: true,

            movies

        });


    } catch (error) {

        console.log(error.message);


        res.json({

            success: false,

            message: error.message

        });

    }

};
