
import React, { useEffect, useState } from "react";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";

const Movies = () => {

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);


    // =====================================================
    // FETCH ADMIN-ADDED MOVIES FROM MONGODB
    // =====================================================

    const fetchMovies = async () => {

        try {

            setLoading(true);

            console.log(
                "Fetching admin-added movies from MongoDB..."
            );


            // =================================================
            // GET ALL SHOWS
            // =================================================
            //
            // The backend returns:
            //
            // Show.find()
            //     .populate("movie")
            //
            // Therefore each show contains its movie data.
            //
            // =================================================

            const response = await fetch(
                "http://localhost:5000/show/all"
            );


            // =================================================
            // CHECK HTTP RESPONSE
            // =================================================

            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );

            }


            // =================================================
            // READ JSON
            // =================================================

            const data = await response.json();


            console.log(
                "Shows received from MongoDB:",
                data
            );


            // =================================================
            // CHECK BACKEND RESPONSE
            // =================================================

            if (
                !data.success ||
                !Array.isArray(data.shows)
            ) {

                console.error(
                    "Invalid response from server:",
                    data
                );

                setMovies([]);

                return;
            }


            // =================================================
            // GET MOVIES FROM SHOWS
            // =================================================

            const adminMovies = data.shows

                .map((show) => {

                    // Because backend uses:
                    //
                    // .populate("movie")
                    //
                    // show.movie should contain
                    // the complete movie document.

                    if (!show.movie) {

                        console.warn(
                            "Show does not contain movie:",
                            show
                        );

                        return null;
                    }


                    return show.movie;

                })

                .filter(Boolean);


            console.log(
                "Movies from admin shows:",
                adminMovies
            );


            // =================================================
            // REMOVE DUPLICATE MOVIES
            // =================================================
            //
            // Example:
            //
            // Batman - 10:00
            // Batman - 14:00
            // Batman - 18:00
            //
            // Batman should appear only once.
            //
            // =================================================

            const uniqueMovies = [];

            const movieIds = new Set();


            adminMovies.forEach((movie) => {

                const movieId =
                    movie._id ||
                    movie.id;


                if (!movieId) {

                    console.warn(
                        "Movie does not have an ID:",
                        movie
                    );

                    return;
                }


                const id =
                    String(movieId);


                if (!movieIds.has(id)) {

                    movieIds.add(id);

                    uniqueMovies.push(movie);

                }

            });


            console.log(
                "Unique movies to display:",
                uniqueMovies
            );


            // =================================================
            // SET MOVIES
            // =================================================

            setMovies(uniqueMovies);


        } catch (error) {

            console.error(
                "Error fetching movies from MongoDB:",
                error
            );

            setMovies([]);


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // FETCH WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {

        fetchMovies();

    }, []);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="flex items-center justify-center h-screen">

                <h1 className="text-xl text-gray-300">
                    Loading movies...
                </h1>

            </div>

        );

    }


    // =====================================================
    // NO MOVIES
    // =====================================================

    if (movies.length === 0) {

        return (

            <div className="flex flex-col items-center justify-center h-screen">

                <h1 className="text-3xl font-bold text-center text-white">
                    No movies available
                </h1>

                <p className="text-gray-500 mt-2">
                    No movies have been added to a show yet.
                </p>

            </div>

        );

    }


    // =====================================================
    // MOVIES PAGE
    // =====================================================

    return (

        <div
            className="
                relative
                my-40
                mb-60
                px-6
                md:px-16
                lg:px-40
                xl:px-44
                overflow-hidden
                min-h-[480vh]
            "
        >


            {/* ================================================= */}
            {/* BACKGROUND BLUR CIRCLES */}
            {/* ================================================= */}

            <BlurCircle
                top="150px"
                left="0px"
            />


            <BlurCircle
                bottom="50px"
                right="50px"
            />


            {/* ================================================= */}
            {/* TITLE */}
            {/* ================================================= */}

            <h1 className="text-lg font-medium my-4 text-white">

                Now Showing

            </h1>


            {/* ================================================= */}
            {/* MOVIE GRID */}
            {/* ================================================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-4
                    gap-8
                    mt-8
                "
            >

                {movies.map((movie) => {

                    const movieId =
                        movie._id ||
                        movie.id;


                    return (

                        <MovieCard
                            key={String(movieId)}
                            movie={movie}
                        />

                    );

                })}

            </div>

        </div>

    );

};


export default Movies;
