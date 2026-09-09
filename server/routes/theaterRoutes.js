import express from "express";
import { getNearbyTheaters } from "../controllers/theaterController.js";

const router = express.Router();

router.get("/nearby", getNearbyTheaters);

export default router;