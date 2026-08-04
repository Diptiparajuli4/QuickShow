import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        favourites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Movie"
            }
        ]

    },
    {
        timestamps: true
    }
);


export default mongoose.model("User", userSchema);