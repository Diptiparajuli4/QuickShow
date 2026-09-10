import express from "express";
import {
    getMovies,
    addMovie,
    getMovieById,
    searchMovies,
} from "../controllers/showController.js";

const router = express.Router();

router.get("/movie/all", getMovies);
router.get("/movie/search", searchMovies);
router.get("/movie/:id", getMovieById);
router.post("/movie/add", addMovie);

export default router;