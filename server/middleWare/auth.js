
import jwt from "jsonwebtoken";

// =====================================================
// PROTECT USER ROUTES
// =====================================================

export const protect = async (
  req,
  res,
  next
) => {
  try {
    // Authorization: Bearer TOKEN

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Access denied. No token provided.",
      });
    }

    const token =
      authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Access denied. Invalid authorization format.",
      });
    }

    // =================================================
    // VERIFY TOKEN
    // =================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =================================================
    // SAVE USER INFORMATION
    // =================================================

    req.user = decoded;

    console.log(
      "Authenticated user:",
      req.user
    );

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid token or token expired.",
    });
  }
};

// =====================================================
// PROTECT ADMIN ROUTES
// =====================================================

export const protectAdmin = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.user ||
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required.",
      });
    }

    next();
  } catch (error) {
    console.error(
      "Admin authentication error:",
      error.message
    );

    return res.status(403).json({
      success: false,
      message:
        "Admin authentication failed.",
    });
  }
};
