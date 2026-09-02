
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// =====================================================
// SIGNUP USER
// =====================================================

export const signupUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // =================================================
        // VALIDATE INPUT
        // =================================================

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill in all fields."

            });

        }


        // =================================================
        // CLEAN DATA
        // =================================================

        const cleanName =
            name.trim();

        const cleanEmail =
            email.trim().toLowerCase();


        // =================================================
        // CHECK EXISTING USER
        // =================================================

        const existingUser =
            await User.findOne({
                email: cleanEmail
            });


        if (existingUser) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is already registered."

            });

        }


        // =================================================
        // HASH PASSWORD
        // =================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // =================================================
        // CREATE USER
        // =================================================

        const user =
            await User.create({

                name: cleanName,

                email: cleanEmail,

                password: hashedPassword,

                image: "",

                // IMPORTANT:
                // Public signup can ONLY create users
                role: "user",

                favourites: []

            });


        // =================================================
        // CREATE TOKEN
        // =================================================

        const token =
            jwt.sign(

                {
                    id: user._id,

                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        // =================================================
        // SEND RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            token,

            user: {

                _id: user._id,

                name: user.name,

                email: user.email,

                image: user.image,

                role: user.role,

                favourites:
                    user.favourites

            }

        });

    } catch (error) {

        console.error(
            "Signup error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create account."

        });

    }

};


// =====================================================
// LOGIN USER / ADMIN
// =====================================================

export const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // =================================================
        // VALIDATE INPUT
        // =================================================

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter email and password."

            });

        }


        // =================================================
        // FIND ACCOUNT IN MONGODB
        // =================================================

        const cleanEmail =
            email.trim().toLowerCase();


        const user =
            await User.findOne({

                email: cleanEmail

            });


        // Account does not exist
        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // =================================================
        // CHECK PASSWORD
        // =================================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // =================================================
        // CREATE JWT TOKEN
        // =================================================

        const token =
            jwt.sign(

                {
                    id: user._id,

                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        // =================================================
        // RETURN USER DATA
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful.",

            token,

            user: {

                _id: user._id,

                name: user.name,

                email: user.email,

                image: user.image,

                role: user.role,

                favourites:
                    user.favourites

            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during login."

        });

    }

};
