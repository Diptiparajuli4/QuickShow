import jwt from "jsonwebtoken";

// Middleware to verify user authentication
export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Store user information in request object
        req.user = decoded;

        next();

    } catch (error) {
        console.log(error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid token or token expired.",
        });
    }
};


// Middleware to verify admin access
export const protectAdmin = async (req, res, next) => {
    try {
        // Check if user exists and has admin role
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required.",
            });
        }

        next();

    } catch (error) {
        console.log(error.message);

        return res.status(403).json({
            success: false,
            message: "Admin authentication failed.",
        });
    }
};