import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
});

theaterSchema.index({ location: "2dsphere" });

export default mongoose.model("Theater", theaterSchema);