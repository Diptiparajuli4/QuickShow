import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./configs/db.js";

import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// ========================================
// DATABASE
// ========================================

connectDB();

// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

app.use(express.json());

// ========================================
// ROUTES
// ========================================

app.use("/show", showRouter);
app.use("/booking", bookingRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "QuickShow backend is running",
    });
});

// ========================================
// SERVER
// ========================================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});