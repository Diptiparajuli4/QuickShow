
import mongoose from "mongoose";

// =====================================================
// BOOKING SCHEMA
// =====================================================

const bookingSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      ref: "Movie",
      required: true,
    },

    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: false,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    seats: [
      {
        type: String,
        required: true,
      },
    ],

    bookingDate: {
      type: Date,
      default: Date.now,
    },
  }
);

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "user",
    },

    // =================================================
    // FAVOURITE MOVIES
    // Movie _id is String in your Movie model
    // =================================================

    favourites: [
      {
        type: String,
        ref: "Movie",
      },
    ],

    // =================================================
    // USER BOOKINGS
    // =================================================

    bookings: [bookingSchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
