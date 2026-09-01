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
// CONNECT DATABASE
// ========================================

connectDB();

// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
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
    res.send("Backend server running with connection to MongoDB");
});

// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});