
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./configs/db.js";

import userRouter from "./routes/userRoutes.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";


// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(
    express.json()
);


// =====================================================
// DATABASE
// =====================================================

connectDB()
    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);

    });


// =====================================================
// USER ROUTES
// =====================================================

// Signup
// POST /user/signup

// Login
// POST /user/login

app.use(
    "/user",
    userRouter
);


// =====================================================
// SHOW ROUTES
// =====================================================

// Add show
// POST /show/add

// Get shows
// GET /show/...

app.use(
    "/show",
    showRouter
);


// =====================================================
// BOOKING ROUTES
// =====================================================

// Get all bookings
// GET /booking/all

// Other booking operations
// /booking/...

app.use(
    "/booking",
    bookingRouter
);


// =====================================================
// TEST ROUTE
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "QuickShow server is running",

        });

    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        console.log(
            `404 - Route not found: ${req.method} ${req.originalUrl}`
        );


        res.status(404).json({

            success: false,

            message:
                `Route not found: ${req.method} ${req.originalUrl}`

        });

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server error:",
            err
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server started on port ${PORT}`
        );

        console.log(
            `Server URL: http://localhost:${PORT}`
        );

    }
);
