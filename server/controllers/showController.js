import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import Theater from "../models/Theater.js";

// =====================================================
// GET ALL MOVIES
// =====================================================
export const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            movies,
        });
    } catch (error) {
        console.error("Get Movies Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// ADD MOVIE
// =====================================================
export const addMovie = async (req, res) => {
    try {
        const movieData = req.body;
        const movieId = String(movieData._id || movieData.id || "");
        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "Movie ID is required",
            });
        }
        const title = movieData.title || movieData.name || "";
        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Movie title is required",
            });
        }

        const existingMovie = await Movie.findById(movieId);
        if (existingMovie) {
            return res.status(200).json({
                success: true,
                message: "Movie already exists",
                movie: existingMovie,
            });
        }

        const movie = await Movie.create({
            _id: movieId,
            title: title,
            overview: movieData.overview || "",
            poster_path: movieData.poster_path || movieData.poster || movieData.image || "",
            backdrop_path: movieData.backdrop_path || movieData.backdrop || "",
            release_date: movieData.release_date || movieData.releaseDate || "",
            original_language: movieData.original_language || "",
            tagline: movieData.tagline || "",
            genres: movieData.genres || movieData.genre_ids || [],
            casts: movieData.casts || movieData.cast || [],
            vote_average: Number(movieData.vote_average) || 0,
            runtime: Number(movieData.runtime) || 0,
        });

        return res.status(201).json({
            success: true,
            message: "Movie added successfully",
            movie,
        });
    } catch (error) {
        console.error("Add Movie Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// ADD SHOW
// UPDATED: no longer creates a movie — only validates that it exists
// UPDATED: now saves theaterCity and theaterAddress
// =====================================================
export const addShow = async (req, res) => {
    try {
        const { 
            movie, 
            price, 
            dateTimes, 
            theaterId, 
            theaterName, 
            theaterLat, 
            theaterLng,
            theaterCity,
            theaterAddress 
        } = req.body;

        console.log("======================================");
        console.log("ADD SHOW REQUEST RECEIVED");
        console.log("Movie:", movie);
        console.log("Price:", price);
        console.log("Date Times:", dateTimes);
        console.log("Theater ID:", theaterId);
        console.log("Theater Name:", theaterName);
        console.log("Theater Lat:", theaterLat);
        console.log("Theater Lng:", theaterLng);
        console.log("Theater City:", theaterCity);
        console.log("Theater Address:", theaterAddress);
        console.log("======================================");

        if (!movie || typeof movie !== "object") {
            return res.status(400).json({
                success: false,
                message: "Movie data is required",
            });
        }

        const movieId = String(movie._id || movie.id || "");
        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "Selected movie does not contain an ID",
            });
        }

        console.log("Movie ID:", movieId);

        const movieTitle = movie.title || movie.name || "";
        if (!movieTitle) {
            return res.status(400).json({
                success: false,
                message: "Movie title is required",
            });
        }

        const showPrice = Number(price);
        if (!Number.isFinite(showPrice) || showPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid show price",
            });
        }

        if (!dateTimes || typeof dateTimes !== "object" || Array.isArray(dateTimes) || Object.keys(dateTimes).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please add at least one show date and time",
            });
        }

        // =====================================================
        // -------- VALIDATE MOVIE EXISTS (do NOT create it) --------
        // =====================================================
        const movieDocument = await Movie.findById(movieId);

        if (!movieDocument) {
            console.log("Movie not found in movies collection:", movieId);
            return res.status(400).json({
                success: false,
                message:
                    "Movie not found. Please add the movie first from the Add Movie page.",
            });
        }

        console.log("Movie already exists:", movieDocument._id);

        const savedMovieId = String(movieDocument._id);

        // =====================================================
        // -------- ENSURE THEATER EXISTS --------
        // =====================================================
        let theaterDoc = null;
        if (theaterId) {
            theaterDoc = await Theater.findById(theaterId);
            if (!theaterDoc) {
                console.log("Theater not found. Creating theater from show data...");
                try {
                    theaterDoc = await Theater.create({
                        _id: theaterId,
                        name: theaterName || "Unknown Theater",
                        city: theaterCity || "",
                        address: theaterAddress || "",
                        latitude: theaterLat || 0,
                        longitude: theaterLng || 0,
                        location: {
                            type: "Point",
                            coordinates: [theaterLng || 0, theaterLat || 0],
                        },
                        isActive: true,
                    });
                    console.log("Theater created:", theaterDoc);
                } catch (createError) {
                    console.error("Failed to create theater:", createError);
                    // Continue anyway, but log the error
                }
            } else {
                console.log("Theater already exists:", theaterDoc._id);
            }
        }

        // -------- Build show documents (one per date/time) --------
        const showsToCreate = [];

        for (const [date, times] of Object.entries(dateTimes)) {
            if (!Array.isArray(times)) continue;
            for (const time of times) {
                const showDateTime = new Date(`${date}T${time}`);
                if (isNaN(showDateTime.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid date/time: ${date} ${time}`,
                    });
                }

                const existingShow = await Show.findOne({
                    movie: savedMovieId,
                    showDateTime: showDateTime,
                });
                if (existingShow) {
                    return res.status(400).json({
                        success: false,
                        message: `Show already exists for ${date} at ${time}`,
                    });
                }

                // -------- Include theater fields --------
                showsToCreate.push({
                    movie: savedMovieId,
                    showDateTime: showDateTime,
                    showPrice: showPrice,
                    occupiedSeats: {},
                    theaterId: theaterId || "",
                    theaterName: theaterName || "",
                    theaterLat: theaterLat || 0,
                    theaterLng: theaterLng || 0,
                    theaterCity: theaterCity || "",
                    theaterAddress: theaterAddress || "",
                });
            }
        }

        if (showsToCreate.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid show date/time found",
            });
        }

        // -------- Insert all shows --------
        const createdShows = await Show.insertMany(showsToCreate);

        // =====================================================
        // -------- UPDATE THEATER'S MOVIES ARRAY --------
        // =====================================================
        if (theaterDoc) {
            // Add the movie ID to the theater's movies array if not already present
            const updateResult = await Theater.findByIdAndUpdate(
                theaterDoc._id,
                { $addToSet: { movies: savedMovieId } },
                { new: true }
            );
            console.log(`Updated theater ${theaterDoc._id} with movie ${savedMovieId}`);
            console.log("Theater after update:", updateResult);
        }

        console.log("======================================");
        console.log("SHOWS INSERTED SUCCESSFULLY");
        console.log(createdShows);
        console.log("======================================");

        return res.status(201).json({
            success: true,
            message: "Shows added successfully",
            movie: movieDocument,
            shows: createdShows,
        });
    } catch (error) {
        console.error("ADD SHOW ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET ALL SHOWS (populates theaterId)
// =====================================================
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find()
            .populate("movie")
            .populate("theaterId")   // ✅ Now works because schema has ref
            .sort({ showDateTime: 1 });
        return res.status(200).json({
            success: true,
            shows,
        });
    } catch (error) {
        console.error("Get All Shows Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET SHOWS FOR ONE MOVIE
// =====================================================
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;
        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "Movie ID is required",
            });
        }

        console.log("======================================");
        console.log("GET SHOWS FOR MOVIE");
        console.log("Movie ID:", movieId);

        const shows = await Show.find({ movie: String(movieId) })
            .populate("movie")
            .sort({ showDateTime: 1 });

        console.log("Shows found:", shows.length);
        console.log("Shows:", shows);

        return res.status(200).json({
            success: true,
            shows,
        });
    } catch (error) {
        console.error("Get Show Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// DELETE SHOW BY ID
// =====================================================
export const deleteShow = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Show ID is required",
            });
        }

        const deletedShow = await Show.findByIdAndDelete(id);

        if (!deletedShow) {
            return res.status(404).json({
                success: false,
                message: "Show not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Show deleted successfully",
            deletedShow,
        });
    } catch (error) {
        console.error("Delete Show Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET MOVIES HAVING SHOWS
// =====================================================
export const getUniqueShows = async (req, res) => {
    try {
        const shows = await Show.find();
        const movieIds = [...new Set(shows.map((show) => String(show.movie)))];
        return res.status(200).json({
            success: true,
            movieIds,
        });
    } catch (error) {
        console.error("Get Unique Shows Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET NOW SHOWING MOVIES
// =====================================================
export const getNowShowingMovies = async (req, res) => {
    try {
        console.log("======================================");
        console.log("GET NOW SHOWING MOVIES");

        const shows = await Show.find()
            .sort({ showDateTime: -1 })
            .lean();

        console.log("Total shows:", shows.length);

        if (shows.length === 0) {
            return res.status(200).json({
                success: true,
                movies: [],
            });
        }

        const movieIds = [...new Set(shows.map((show) => String(show.movie)))];
        console.log("Movie IDs from Show collection:", movieIds);

        const movies = await Movie.find({ _id: { $in: movieIds } }).lean();
        console.log("Movies found in Movie collection:", movies.length);

        const movieMap = new Map();
        movies.forEach((movie) => {
            movieMap.set(String(movie._id), movie);
        });

        const orderedMovies = [];
        const alreadyAdded = new Set();

        for (const show of shows) {
            const movieId = String(show.movie);
            const movie = movieMap.get(movieId);
            if (movie && !alreadyAdded.has(movieId)) {
                alreadyAdded.add(movieId);
                orderedMovies.push(movie);
            }
        }

        console.log("Movies returned:", orderedMovies.length);
        console.log("======================================");

        return res.status(200).json({
            success: true,
            movies: orderedMovies,
        });
    } catch (error) {
        console.error("Get Now Showing Movies Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET SINGLE MOVIE BY ID (for favourites fallback)
// =====================================================
export const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Movie ID is required.",
            });
        }

        const movie = await Movie.findById(String(id)).lean();
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found.",
            });
        }

        return res.status(200).json({
            success: true,
            movie,
        });
    } catch (error) {
        console.error("Get movie by ID error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// SEARCH MOVIES (for navbar search)
// =====================================================
export const searchMovies = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search query is required.",
            });
        }

        const movies = await Movie.find({
            title: { $regex: query.trim(), $options: "i" }
        }).lean();

        return res.status(200).json({
            success: true,
            movies,
        });
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};