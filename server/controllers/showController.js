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


        // Check if movie already exists

        const existingMovie =
            await Movie.findById(movieId);


        if (existingMovie) {

            return res.status(200).json({
                success: true,
                message: "Movie already exists",
                movie: existingMovie,
            });
        }


        // Create movie

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
                    Number(movieData.vote_average) || 0,

                runtime:
                    Number(movieData.runtime) || 0,
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
//
// Frontend sends:
//
// {
//     movie: selectedMovie,
//     price: 500,
//     dateTimes: {
//         "2026-09-05": ["10:00", "14:00"],
//         "2026-09-06": ["18:00"]
//     }
// }
//
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
        // 1. CHECK MOVIE DATA
        // =================================================

        if (!movie || typeof movie !== "object") {

            return res.status(400).json({
                success: false,
                message: "Movie data is required",
            });
        }


        // =================================================
        // 2. GET MOVIE ID
        // =================================================

        const movieId = String(
            movie._id ||
            movie.id ||
            ""
        );


        if (!movieId) {

            return res.status(400).json({
                success: false,
                message: "Selected movie does not contain an ID",
            });
        }


        console.log(
            "Movie ID:",
            movieId
        );


        // =================================================
        // 3. GET MOVIE TITLE
        // =================================================

        const movieTitle =
            movie.title ||
            movie.name ||
            "";


        if (!movieTitle) {

            return res.status(400).json({
                success: false,
                message: "Movie title is required",
            });
        }


        // =================================================
        // 4. CHECK PRICE
        // =================================================

        const showPrice = Number(price);


        if (
            !Number.isFinite(showPrice) ||
            showPrice <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Please enter a valid show price",
            });
        }


        // =================================================
        // 5. CHECK DATE/TIME
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
        // 6. FIND MOVIE IN DATABASE
        // =================================================

        let movieDocument =
            await Movie.findById(movieId);


        // =================================================
        // 7. IF MOVIE DOES NOT EXIST,
        //    INSERT IT INTO MOVIE COLLECTION
        // =================================================

        if (!movieDocument) {

            console.log(
                "Movie not found in database."
            );

            console.log(
                "Inserting selected movie into database..."
            );


            movieDocument =
                await Movie.create({

                    _id: movieId,

                    title:
                        movieTitle,

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
                "Movie inserted successfully:"
            );

            console.log(
                movieDocument
            );

        } else {

            console.log(
                "Movie already exists in database:"
            );

            console.log(
                movieDocument._id
            );
        }


        // =================================================
        // 8. GET ID FROM DATABASE MOVIE
        // =================================================

        const savedMovieId =
            String(movieDocument._id);


        // =================================================
        // 9. PREPARE SHOWS
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
                // CREATE DATE
                // =========================================

                const showDateTime =
                    new Date(
                        `${date}T${time}`
                    );


                // =========================================
                // CHECK DATE
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
                // CHECK DUPLICATE SHOW
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
        // 10. CHECK SHOWS
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
        // 11. INSERT SHOWS
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
        // 12. RESPONSE
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