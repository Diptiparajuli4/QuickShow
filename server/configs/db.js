import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Database connected");
  } catch (error) {
    console.log("Mongo Error:", error.message);
  }
};

export default connectDB;