import Show from "../models/Show.js";
import Movie from "../models/Movie.js";


// =====================================================
// GET ALL MOVIES
// =====================================================

export const getMovies = async (req, res) => {
    try {

        const movies = await Movie.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            movies,
        });

    } catch (error) {

        console.error(
            "Get Movies Error:",
            error
        );

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

        const movieId = String(
            movieData._id ||
            movieData.id ||
            ""
        );


        if (!movieId) {

            return res.status(400).json({
                success: false,
                message: "Movie ID is required",
            });
        }


        const title =
            movieData.title ||
            movieData.name ||
            "";


        if (!title) {

            return res.status(400).json({
                success: false,
                message: "Movie title is required",
            });
        }


        // =================================================
        // CHECK EXISTING MOVIE
        // =================================================

        const existingMovie =
            await Movie.findById(movieId);


        if (existingMovie) {

            return res.status(200).json({
                success: true,
                message: "Movie already exists",
                movie: existingMovie,
            });
        }


        // =================================================
        // CREATE MOVIE
        // =================================================

        const movie =
            await Movie.create({

                _id: movieId,

                title: title,

                overview:
                    movieData.overview || "",

                poster_path:
                    movieData.poster_path ||
                    movieData.poster ||
                    movieData.image ||
                    "",

                backdrop_path:
                    movieData.backdrop_path ||
                    movieData.backdrop ||
                    "",

                release_date:
                    movieData.release_date ||
                    movieData.releaseDate ||
                    "",

                original_language:
                    movieData.original_language ||
                    "",

                tagline:
                    movieData.tagline ||
                    "",

                genres:
                    movieData.genres ||
                    movieData.genre_ids ||
                    [],

                casts:
                    movieData.casts ||
                    movieData.cast ||
                    [],

                vote_average:
                    Number(
                        movieData.vote_average
                    ) || 0,

                runtime:
                    Number(
                        movieData.runtime
                    ) || 0,
            });


        return res.status(201).json({

            success: true,

            message:
                "Movie added successfully",

            movie,
        });


    } catch (error) {

        console.error(
            "Add Movie Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message,
        });
    }
};


// =====================================================
// ADD SHOW
// =====================================================

export const addShow = async (req, res) => {

    try {

        const {
            movie,
            price,
            dateTimes,
        } = req.body;


        console.log(
            "======================================"
        );

        console.log(
            "ADD SHOW REQUEST RECEIVED"
        );

        console.log(
            "Movie:",
            movie
        );

        console.log(
            "Price:",
            price
        );

        console.log(
            "Date Times:",
            dateTimes
        );

        console.log(
            "======================================"
        );


        // =================================================
        // CHECK MOVIE
        // =================================================

        if (
            !movie ||
            typeof movie !== "object"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Movie data is required",
            });
        }


        // =================================================
        // GET MOVIE ID
        // =================================================

        const movieId = String(
            movie._id ||
            movie.id ||
            ""
        );


        if (!movieId) {

            return res.status(400).json({

                success: false,

                message:
                    "Selected movie does not contain an ID",
            });
        }


        console.log(
            "Movie ID:",
            movieId
        );


        // =================================================
        // GET MOVIE TITLE
        // =================================================

        const movieTitle =
            movie.title ||
            movie.name ||
            "";


        if (!movieTitle) {

            return res.status(400).json({

                success: false,

                message:
                    "Movie title is required",
            });
        }


        // =================================================
        // CHECK PRICE
        // =================================================

        const showPrice =
            Number(price);


        if (
            !Number.isFinite(showPrice) ||
            showPrice <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid show price",
            });
        }


        // =================================================
        // CHECK DATE/TIME
        // =================================================

        if (
            !dateTimes ||
            typeof dateTimes !== "object" ||
            Array.isArray(dateTimes) ||
            Object.keys(dateTimes).length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please add at least one show date and time",
            });
        }


        // =================================================
        // FIND MOVIE
        // =================================================

        let movieDocument =
            await Movie.findById(movieId);


        // =================================================
        // CREATE MOVIE IF NOT EXISTS
        // =================================================

        if (!movieDocument) {

            console.log(
                "Movie not found."
            );

            console.log(
                "Creating movie in MongoDB..."
            );


            movieDocument =
                await Movie.create({

                    _id: movieId,

                    title: movieTitle,

                    overview:
                        movie.overview ||
                        "",

                    poster_path:
                        movie.poster_path ||
                        movie.poster ||
                        movie.image ||
                        "",

                    backdrop_path:
                        movie.backdrop_path ||
                        movie.backdrop ||
                        "",

                    release_date:
                        movie.release_date ||
                        movie.releaseDate ||
                        "",

                    original_language:
                        movie.original_language ||
                        "",

                    tagline:
                        movie.tagline ||
                        "",

                    genres:
                        movie.genres ||
                        movie.genre_ids ||
                        [],

                    casts:
                        movie.casts ||
                        movie.cast ||
                        [],

                    vote_average:
                        Number(
                            movie.vote_average
                        ) || 0,

                    runtime:
                        Number(
                            movie.runtime
                        ) || 0,
                });


            console.log(
                "Movie created:",
                movieDocument
            );

        } else {

            console.log(
                "Movie already exists:",
                movieDocument._id
            );
        }


        // =================================================
        // MOVIE ID SAVED IN DATABASE
        // =================================================

        const savedMovieId =
            String(movieDocument._id);


        // =================================================
        // PREPARE SHOWS
        // =================================================

        const showsToCreate = [];


        for (
            const [date, times]
            of Object.entries(dateTimes)
        ) {

            if (!Array.isArray(times)) {
                continue;
            }


            for (const time of times) {

                // =========================================
                // CREATE DATETIME
                // =========================================

                const showDateTime =
                    new Date(
                        `${date}T${time}`
                    );


                // =========================================
                // VALID DATE
                // =========================================

                if (
                    isNaN(
                        showDateTime.getTime()
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            `Invalid date/time: ${date} ${time}`,
                    });
                }


                // =========================================
                // CHECK DUPLICATE
                // =========================================

                const existingShow =
                    await Show.findOne({

                        movie:
                            savedMovieId,

                        showDateTime:
                            showDateTime,
                    });


                if (existingShow) {

                    return res.status(400).json({

                        success: false,

                        message:
                            `Show already exists for ${date} at ${time}`,
                    });
                }


                // =========================================
                // CREATE SHOW OBJECT
                // =========================================

                showsToCreate.push({

                    movie:
                        savedMovieId,

                    showDateTime:
                        showDateTime,

                    showPrice:
                        showPrice,

                    occupiedSeats:
                        {},
                });
            }
        }


        // =================================================
        // CHECK SHOWS
        // =================================================

        if (
            showsToCreate.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No valid show date/time found",
            });
        }


        // =================================================
        // INSERT SHOWS
        // =================================================

        const createdShows =
            await Show.insertMany(
                showsToCreate
            );


        console.log(
            "======================================"
        );

        console.log(
            "SHOWS INSERTED SUCCESSFULLY"
        );

        console.log(
            createdShows
        );

        console.log(
            "======================================"
        );


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Movie and shows added successfully",

            movie:
                movieDocument,

            shows:
                createdShows,
        });


    } catch (error) {

        console.error(
            "ADD SHOW ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,
        });
    }
};


// =====================================================
// GET ALL SHOWS
// =====================================================

export const getAllShows = async (
    req,
    res
) => {

    try {

        const shows =
            await Show.find()
                .populate("movie")
                .sort({
                    showDateTime: 1,
                });


        return res.status(200).json({

            success: true,

            shows,
        });


    } catch (error) {

        console.error(
            "Get All Shows Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,
        });
    }
};


// =====================================================
// GET SHOWS FOR ONE MOVIE
// =====================================================

export const getShow = async (
    req,
    res
) => {

    try {

        const {
            movieId,
        } = req.params;


        if (!movieId) {

            return res.status(400).json({

                success: false,

                message:
                    "Movie ID is required",
            });
        }


        const shows =
            await Show.find({

                movie:
                    String(movieId),

            })
                .populate("movie")
                .sort({

                    showDateTime: 1,

                });


        return res.status(200).json({

            success: true,

            shows,
        });


    } catch (error) {

        console.error(
            "Get Show Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,
        });
    }
};


// =====================================================
// GET MOVIES HAVING SHOWS
// =====================================================

export const getUniqueShows = async (
    req,
    res
) => {

    try {

        const shows =
            await Show.find();


        const movieIds = [
            ...new Set(
                shows.map(
                    (show) =>
                        String(
                            show.movie
                        )
                )
            ),
        ];


        return res.status(200).json({

            success: true,

            movieIds,
        });


    } catch (error) {

        console.error(
            "Get Unique Shows Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,
        });
    }
};


// =====================================================
// GET NOW SHOWING MOVIES
// =====================================================
// This is the important function for FeaturedSection.
//
// It gets movie IDs from the Show collection,
// then gets the actual movie documents from Movie.
// =====================================================

export const getNowShowingMovies = async (
    req,
    res
) => {

    try {

        console.log(
            "======================================"
        );

        console.log(
            "GET NOW SHOWING MOVIES"
        );


        // =================================================
        // GET ALL SHOWS
        // =================================================

        const shows =
            await Show.find()
                .sort({
                    showDateTime: -1,
                })
                .lean();


        console.log(
            "Total shows:",
            shows.length
        );


        // =================================================
        // NO SHOWS
        // =================================================

        if (
            shows.length === 0
        ) {

            return res.status(200).json({

                success: true,

                movies: [],
            });
        }


        // =================================================
        // GET MOVIE IDS FROM SHOWS
        // =================================================

        const movieIds = [
            ...new Set(
                shows.map(
                    (show) =>
                        String(
                            show.movie
                        )
                )
            ),
        ];


        console.log(
            "Movie IDs from Show collection:",
            movieIds
        );


        // =================================================
        // FETCH MOVIES
        // =================================================

        const movies =
            await Movie.find({

                _id: {
                    $in: movieIds,
                },

            }).lean();


        console.log(
            "Movies found in Movie collection:",
            movies.length
        );


        // =================================================
        // CREATE MOVIE MAP
        // =================================================

        const movieMap =
            new Map();


        movies.forEach(
            (movie) => {

                movieMap.set(
                    String(
                        movie._id
                    ),
                    movie
                );

            }
        );


        // =================================================
        // KEEP SHOW ORDER
        // =================================================

        const orderedMovies = [];

        const alreadyAdded =
            new Set();


        for (
            const show
            of shows
        ) {

            const movieId =
                String(
                    show.movie
                );


            const movie =
                movieMap.get(
                    movieId
                );


            if (
                movie &&
                !alreadyAdded.has(
                    movieId
                )
            ) {

                alreadyAdded.add(
                    movieId
                );


                orderedMovies.push(
                    movie
                );
            }
        }


        console.log(
            "Movies returned:",
            orderedMovies.length
        );


        console.log(
            "======================================"
        );


        // =================================================
        // SEND RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            movies:
                orderedMovies,
        });


    } catch (error) {

        console.error(
            "Get Now Showing Movies Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,
        });
    }
};