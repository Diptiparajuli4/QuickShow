import express from "express";
import {
    getNearbyTheaters,
    getAllTheaters,
    getTheaterById,
    addTheater,
    updateTheater,
    deleteTheater,
} from "../controllers/theaterController.js";

const router = express.Router();

// =====================================================
// PUBLIC ROUTES (no authentication required)
// =====================================================
router.get("/nearby", getNearbyTheaters);
router.get("/all", getAllTheaters);
router.get("/:id", getTheaterById);

// =====================================================
// ADMIN ROUTES (should be protected with auth middleware)
// =====================================================
router.post("/add", addTheater);
router.put("/:id", updateTheater);
router.delete("/:id", deleteTheater);

export default router;