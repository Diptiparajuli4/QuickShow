
import User from "../models/User.js";
import Movie from "../models/Movie.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =====================================================
// SIGNUP USER
// =====================================================

export const signupUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    // =================================================
    // VALIDATE INPUT
    // =================================================

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    // =================================================
    // CLEAN DATA
    // =================================================

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // =================================================
    // CHECK EXISTING USER
    // =================================================

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // =================================================
    // CREATE USER
    // =================================================

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      image: "",
      role: "user",
      favourites: [],
      bookings: [],
    });

    // =================================================
    // CREATE JWT
    // =================================================

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        favourites: user.favourites,
        bookings: user.bookings,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
};

// =====================================================
// LOGIN USER / ADMIN
// =====================================================

export const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // =================================================
    // VALIDATE INPUT
    // =================================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    // =================================================
    // CLEAN EMAIL
    // =================================================

    const cleanEmail = email.trim().toLowerCase();

    // =================================================
    // FIND USER
    // =================================================

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // =================================================
    // CHECK PASSWORD
    // =================================================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // =================================================
    // CREATE JWT
    // =================================================

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        favourites: user.favourites || [],
        bookings: user.bookings || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// =====================================================
// GET CURRENT LOGGED-IN USER
// =====================================================

export const getCurrentUser = async (req, res) => {
  try {
    // ID comes from JWT
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("favourites")
      .populate("bookings.movie")
      .populate("bookings.show");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get user.",
    });
  }
};

// =====================================================
// ADD / REMOVE FAVOURITE
// =====================================================

export const toggleFavourite = async (req, res) => {
  try {
    // =================================================
    // GET LOGGED-IN USER ID FROM JWT
    // =================================================

    const userId = req.user.id;

    console.log("Logged-in User ID:", userId);

    // =================================================
    // GET MOVIE ID FROM URL
    // =================================================

    const { movieId } = req.params;

    console.log("Movie ID received:", movieId);

    // =================================================
    // VALIDATE MOVIE ID
    // IMPORTANT:
    // Movie _id is STRING, NOT ObjectId
    // =================================================

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Movie ID is required.",
      });
    }

    // =================================================
    // FIND MOVIE
    // =================================================

    const movie = await Movie.findById(String(movieId));

    console.log("Movie found:", movie);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    // =================================================
    // FIND LOGGED-IN USER
    // =================================================

    const user = await User.findById(userId);

    console.log("User found:", user?._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Make sure favourites exists
    if (!Array.isArray(user.favourites)) {
      user.favourites = [];
    }

    // =================================================
    // CONVERT MOVIE ID TO STRING
    // =================================================

    const movieIdString = String(movie._id);

    // =================================================
    // CHECK WHETHER ALREADY FAVOURITE
    // =================================================

    const alreadyFavourite = user.favourites.some(
      (favouriteId) =>
        String(favouriteId) === movieIdString
    );

    console.log(
      "Already Favourite:",
      alreadyFavourite
    );

    // =================================================
    // REMOVE FAVOURITE
    // =================================================

    if (alreadyFavourite) {
      user.favourites =
        user.favourites.filter(
          (favouriteId) =>
            String(favouriteId) !== movieIdString
        );

      await user.save();

      return res.status(200).json({
        success: true,
        isFavourite: false,
        message: "Movie removed from favourites.",
        favourites: user.favourites,
      });
    }

    // =================================================
    // ADD FAVOURITE
    // =================================================

    user.favourites.push(movieIdString);

    await user.save();

    console.log(
      "Updated favourites:",
      user.favourites
    );

    return res.status(200).json({
      success: true,
      isFavourite: true,
      message: "Movie added to favourites.",
      favourites: user.favourites,
    });
  } catch (error) {
    console.error(
      "Favourite error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update favourites.",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE BOOKING
// =====================================================

export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      movie,
      show,
      date,
      time,
      seats,
    } = req.body;

    // =================================================
    // VALIDATE
    // =================================================

    if (!movie || !date || !time || !seats) {
      return res.status(400).json({
        success: false,
        message:
          "Movie, date, time and seats are required.",
      });
    }

    if (
      !Array.isArray(seats) ||
      seats.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one seat.",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =================================================
    // CREATE BOOKING
    // =================================================

    user.bookings.push({
      movie: String(movie),
      show: show || undefined,
      date,
      time,
      seats,
    });

    await user.save();

    const booking =
      user.bookings[
        user.bookings.length - 1
      ];

    return res.status(201).json({
      success: true,
      message: "Booking saved successfully.",
      booking,
    });
  } catch (error) {
    console.error(
      "Booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create booking.",
      error: error.message,
    });
  }
};

// =====================================================
// GET USER BOOKINGS
// =====================================================

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate("bookings.movie")
      .populate("bookings.show");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      bookings: user.bookings,
    });
  } catch (error) {
    console.error(
      "Get bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get bookings.",
    });
  }
};
