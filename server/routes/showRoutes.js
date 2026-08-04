import express from "express";
import { 
  getAllShows, 
  getMovies, 
  getShow, 
  getUniqueShows,
  addMovie
} from "../controllers/showController.js";

import { protect } from "../middleWare/auth.js";

const showRouter = express.Router();

showRouter.get("/now-playing", protect, getMovies);
showRouter.post("/movies", protect, addMovie);
showRouter.get("/all", getAllShows);
showRouter.get("/unique", getUniqueShows);
showRouter.get("/:movieId", getShow);

export default showRouter;