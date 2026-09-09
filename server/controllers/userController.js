import User from "../models/User.js";
import Movie from "../models/Movie.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =====================================================
// HELPERS
// =====================================================
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateRandomPassword = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// ✅ Gmail format validation (must end with @gmail.com)
const isValidGmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return re.test(email);
};

// =====================================================
// AUTH – SIGNUP (OTP) – with Gmail check
// =====================================================
export const signup = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    if (!name || !email || !mobile) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ✅ Validate Gmail format
    if (!isValidGmail(trimmedEmail)) {
      return res.status(400).json({
        message: "Invalid email format. Only Gmail addresses are allowed (e.g., user@gmail.com).",
      });
    }

    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const otp = generateOtp();
    const otpExpires = Date.now() + 15 * 60 * 1000;

    const user = new User({
      name,
      email: trimmedEmail,
      mobile,
      password: hashedPassword,
      verified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });
    await user.save();

    await sendEmail(
      trimmedEmail,
      "Verify your email – QuickShow",
      `
        <h2>Hello ${name},</h2>
        <p>Thank you for signing up. Please use the code below to verify your email and set your password:</p>
        <h1 style="background: #f0f0f0; padding: 16px; text-align: center; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
        <p>Thank you,<br/>QuickShow Team</p>
      `
    );

    res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to set your password.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// VERIFY OTP AND SET PASSWORD (signup)
// =====================================================
export const verifyOtpAndSetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      verificationOtp: otp,
      verificationOtpExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.verified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified and password set. You can now log in.",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// RESEND VERIFICATION OTP
// =====================================================
export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.verified) return res.status(400).json({ message: "Already verified." });

    const otp = generateOtp();
    user.verificationOtp = otp;
    user.verificationOtpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendEmail(email, "Resend OTP – QuickShow", `Your new OTP is: ${otp}`);
    res.json({ success: true, message: "OTP resent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// =====================================================
// LOGIN – with Gmail check + clear existence message
// =====================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ✅ Validate Gmail format
    if (!isValidGmail(cleanEmail)) {
      return res.status(400).json({
        message: "Invalid email format. Only Gmail addresses are allowed (e.g., user@gmail.com).",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin accounts must log in via the admin portal." });
    }

    if (!user.verified) {
      return res.status(401).json({
        message: "Please verify your email before signing in. Check your inbox for the verification OTP.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: "user",
        favourites: user.favourites || [],
        bookings: user.bookings || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// =====================================================
// SEND RESET OTP (forgot password)
// =====================================================
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const cleanEmail = email.trim().toLowerCase();

    // ✅ Validate Gmail format (optional, but we do it for consistency)
    if (!isValidGmail(cleanEmail)) {
      return res.status(400).json({
        message: "Invalid email format. Only Gmail addresses are allowed.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const subject = "Password Reset OTP – QuickShow";
    const html = `
      <h2>Hello ${user.name},</h2>
      <p>Your password reset OTP is: <strong>${otp}</strong></p>
      <p>This code expires in 15 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    `;
    await sendEmail(cleanEmail, subject, html);

    res.status(200).json({ success: true, message: "Reset OTP sent to your email." });
  } catch (error) {
    console.error("Send reset OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// RESET PASSWORD WITH OTP
// =====================================================
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: cleanEmail,
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// GOOGLE AUTH (auto‑verified)
// =====================================================
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Google already verifies the email, so we don't need to validate format again

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = generateRandomPassword();
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = new User({
        name,
        email,
        password: hashed,
        image: picture || "",
        role: "user",
        verified: true,
      });
      await user.save();
    } else {
      if (!user.verified) {
        user.verified = true;
        await user.save();
      }
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: "user",
        favourites: user.favourites || [],
        bookings: user.bookings || [],
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed." });
  }
};

// =====================================================
// GET CURRENT USER (with favourite movies populated)
// =====================================================
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const favouriteIds = Array.isArray(user.favourites)
      ? user.favourites.map(id => String(id))
      : [];

    let favouriteMovies = [];
    if (favouriteIds.length > 0) {
      favouriteMovies = await Movie.find({ _id: { $in: favouriteIds } }).lean();
      favouriteMovies = favouriteIds
        .map(id => favouriteMovies.find(movie => String(movie._id) === id))
        .filter(Boolean);
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role || "user",
        favourites: favouriteIds,
        bookings: user.bookings || [],
      },
      favourites: favouriteMovies,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ success: false, message: "Unable to get user." });
  }
};

// =====================================================
// TOGGLE FAVOURITE
// =====================================================
export const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    if (!movieId) {
      return res.status(400).json({ success: false, message: "Movie ID is required." });
    }
    const movie = await Movie.findById(String(movieId));
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!Array.isArray(user.favourites)) user.favourites = [];

    const movieIdString = String(movie._id);
    const alreadyFavourite = user.favourites.some(fid => String(fid) === movieIdString);

    if (alreadyFavourite) {
      user.favourites = user.favourites.filter(fid => String(fid) !== movieIdString);
      await user.save();
      return res.status(200).json({
        success: true,
        isFavourite: false,
        message: "Movie removed from favourites.",
        favourites: user.favourites,
      });
    } else {
      user.favourites.push(movieIdString);
      await user.save();
      return res.status(200).json({
        success: true,
        isFavourite: true,
        message: "Movie added to favourites.",
        favourites: user.favourites,
      });
    }
  } catch (error) {
    console.error("Favourite error:", error);
    return res.status(500).json({ success: false, message: "Unable to update favourites." });
  }
};

// =====================================================
// CREATE BOOKING
// =====================================================
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movie, show, date, time, seats } = req.body;
    if (!movie || !date || !time || !seats) {
      return res.status(400).json({ success: false, message: "Movie, date, time and seats are required." });
    }
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one seat." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.bookings.push({ movie: String(movie), show: show || undefined, date, time, seats });
    await user.save();

    const booking = user.bookings[user.bookings.length - 1];
    return res.status(201).json({ success: true, message: "Booking saved successfully.", booking });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: "Unable to create booking." });
  }
};

// =====================================================
// GET MY BOOKINGS
// =====================================================
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate("bookings.movie")
      .populate("bookings.show");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, bookings: user.bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return res.status(500).json({ success: false, message: "Unable to get bookings." });
  }
};

// =====================================================
// UPDATE USER PROFILE
// =====================================================
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (name) user.name = name.trim();
    if (email) {
      const trimmedEmail = email.trim().toLowerCase();
      // ✅ Validate Gmail format when updating email
      if (!isValidGmail(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format. Only Gmail addresses are allowed.",
        });
      }
      // Check uniqueness (excluding self)
      const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Email already in use." });
      }
      user.email = trimmedEmail;
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect." });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    } else if (newPassword && !currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required to set a new password.",
      });
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({ success: true, message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: error.message || "Unable to update profile." });
  }
};