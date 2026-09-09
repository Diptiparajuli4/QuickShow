import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema(
    {
        // -------- Basic Info --------
        name: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },

        // -------- GeoJSON location (for 2dsphere queries) --------
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
                validate: {
                    validator: function (coords) {
                        return coords.length === 2 &&
                            typeof coords[0] === "number" &&
                            typeof coords[1] === "number";
                    },
                    message: "Coordinates must be [longitude, latitude]",
                },
            },
        },

        // -------- Flat latitude/longitude (for easier frontend use) --------
        latitude: {
            type: Number,
            default: 0,
        },
        longitude: {
            type: Number,
            default: 0,
        },

        // -------- Extra fields (optional) --------
        phone: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

// -------- Create 2dsphere index for geospatial queries --------
theaterSchema.index({ location: "2dsphere" });

// -------- Pre-save hook: auto-fill location from lat/lng --------
theaterSchema.pre("save", function (next) {
    if (this.latitude && this.longitude) {
        this.location = {
            type: "Point",
            coordinates: [this.longitude, this.latitude],
        };
    }
    next();
});

const Theater = mongoose.model("Theater", theaterSchema);
export default Theater;