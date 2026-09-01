import express from "express";

import {
    getMovies,
    addMovie,
    addShow,
    getAllShows,
    getShow,
    getUniqueShows
} from "../controllers/showController.js";

const router = express.Router();


// Movies
router.get("/movies", getMovies);
router.post("/movie/add", addMovie);


// Shows
router.post("/add", addShow);
router.get("/all", getAllShows);
router.get("/:movieId", getShow);
router.get("/unique", getUniqueShows);


export default router;