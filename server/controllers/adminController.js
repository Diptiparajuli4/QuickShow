import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

// =====================================================
// CHECK ADMIN
// =====================================================

export const isAdmin = async (req, res) => {
    res.json({
        success: true,
        isAdmin: true,
    });
};

// =====================================================
// DASHBOARD DATA
// =====================================================

export const getDashboardData = async (req, res) => {
    try {
        // =============================================
        // COUNT PAID BOOKINGS
        // =============================================

        const bookings = await Booking.find({
            isPaid: true,
        });

        // =============================================
        // ACTIVE SHOWS
        // KEEPING YOUR EXISTING LOGIC
        // =============================================

        const activeShows = await Show.find({
            showDateTime: {
                $gte: new Date(),
            },
        }).populate("movie");

        // =============================================
        // COUNT USERS FROM USER TABLE
        // role = "user"
        // =============================================

        const totalUser = await User.countDocuments({
            role: "user",
        });

        // =============================================
        // COUNT ADMINS FROM USER TABLE
        // role = "admin"
        // =============================================

        const totalAdmin = await User.countDocuments({
            role: "admin",
        });

        // =============================================
        // TOTAL REVENUE
        // ONLY FROM PAID BOOKINGS
        // =============================================

        const totalRevenue = bookings.reduce(
            (total, booking) =>
                total + Number(booking.amount || 0),
            0
        );

        // =============================================
        // DASHBOARD DATA
        // =============================================

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: totalRevenue,

            // Active shows remains unchanged
            activeShows: activeShows,

            // New role-based counts
            totalUser: totalUser,
            totalAdmin: totalAdmin,
        };

        res.json({
            success: true,
            dashboardData,
        });

    } catch (error) {
        console.error("Dashboard Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET ALL SHOWS
// =====================================================

export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({
            showDateTime: {
                $gte: new Date(),
            },
        })
            .populate("movie")
            .sort({
                showDateTime: 1,
            });

        res.json({
            success: true,
            shows,
        });

    } catch (error) {
        console.error("Get Shows Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET ALL BOOKINGS
// =====================================================

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate("user")
            .populate({
                path: "show",
                populate: {
                    path: "movie",
                },
            })
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            bookings,
        });

    } catch (error) {
        console.error("Get Bookings Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};