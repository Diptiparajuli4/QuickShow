import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";

import userRouter from "./routes/userRoutes.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// =====================================================
// JSON
// =====================================================

app.use(express.json());

// =====================================================
// DATABASE
// =====================================================

connectDB()
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    });

// =====================================================
// ROUTES
// =====================================================

app.use("/user", userRouter);

app.use("/show", showRouter);

app.use("/booking", bookingRouter);

app.use("/admin", adminRouter);

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "QuickShow server is running",
    });
});

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
    console.log(
        `404 - Route not found: ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
    console.error("Server error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
});