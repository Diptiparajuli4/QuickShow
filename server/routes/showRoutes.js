import express from "express";

import {
    addShow,
    getAllShows,
    getShow,
    getUniqueShows,
    getNowShowingMovies,
} from "../controllers/showController.js";


const router =
    express.Router();


// =====================================================
// NOW SHOWING MOVIES
// =====================================================

router.get(
    "/now-playing",
    getNowShowingMovies
);


// =====================================================
// ALL SHOWS
// =====================================================

router.get(
    "/all",
    getAllShows
);


// =====================================================
// UNIQUE SHOW MOVIES
// =====================================================

router.get(
    "/unique",
    getUniqueShows
);


// =====================================================
// ADD SHOW
// =====================================================

router.post(
    "/add",
    addShow
);


// =====================================================
// GET SHOW FOR MOVIE
// =====================================================

router.get(
    "/:movieId",
    getShow
);


export default router;