import express from "express";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";

import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";

// Uncomment these only if you are using Inngest
// import { serve } from "inngest/express";
// import { inngest, functions } from "./inngest/index.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/show", showRouter);
app.use("/booking", bookingRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);

// Uncomment if using Inngest
// app.use("/api/inngest", serve({ client: inngest, functions }));

// Test Route
app.get("/", (req, res) => {
  res.send("Backend server running with connection to MongoDB");
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import connectDB from './configs/db.js';
// import { clerkMiddleware } from '@clerk/express'
// import { inngest, functions } from './inngest/index.js';
// import { serve }from "inngest/express";

// const app = express();
// const port = 3000;

// await connectDB()

// // Middleware
// app.use(express.json())
// app.use(cors())
// app.use(clerkMiddleware())

// //API Routes
// app.get('/', (req, res)=> res.send('Server is Live!'))
// app.use('/api/inngest', serve({ client: inngest, functions }))


// app.listen(port, ()=> console.log(`Server listening at http://localhost:${port}`));