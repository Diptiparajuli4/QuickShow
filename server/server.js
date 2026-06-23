import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();
const port = process.env.PORT || 3000;

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Home Route
app.get("/", (req, res) => {
  res.send("Server is Live!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});