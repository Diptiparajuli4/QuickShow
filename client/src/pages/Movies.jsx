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

            const response = await fetch(
                "http://localhost:5000/show/all"
            );


            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );

            }


            const data = await response.json();


            console.log(
                "Shows received from MongoDB:",
                data
            );


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
            // GROUP MOVIES WITH THEATER INFO
            // =================================================

            // We'll create a map: movieId -> { movie, theaters: Set }
            const movieMap = new Map();

            data.shows.forEach((show) => {

                const movie = show.movie;
                if (!movie) return;

                const movieId = movie._id || movie.id;
                if (!movieId) return;

                const id = String(movieId);

                // Build theater object (if available)
                let theater = null;
                if (show.theaterId || show.theaterName) {
                    theater = {
                        _id: show.theaterId || null,
                        name: show.theaterName || "Unknown Theater",
                        address: show.theaterAddress || "",
                        city: show.theaterCity || "",
                        latitude: show.theaterLat || null,
                        longitude: show.theaterLng || null,
                    };
                } else if (show.theater) {
                    // If the show has a populated theater object
                    theater = show.theater;
                }

                if (!movieMap.has(id)) {
                    movieMap.set(id, {
                        movie: movie,
                        theaters: new Set(),
                    });
                }

                if (theater && theater.name) {
                    // Use a unique key for the set (e.g., theater._id or name)
                    const key = theater._id || theater.name;
                    movieMap.get(id).theaters.add(key);
                }
            });


            // =================================================
            // BUILD FINAL MOVIES LIST WITH THEATER INFO
            // =================================================

            const uniqueMovies = [];
            movieMap.forEach((value, key) => {
                const movie = value.movie;
                const theaterCount = value.theaters.size;

                // Determine theater display: if one theater, pass that; else pass null or a placeholder
                let theaterToPass = null;
                if (theaterCount === 1) {
                    // Find the actual theater object from the first show that has it (simplified)
                    // We'll just pass the first theater name from the set (but we need the name)
                    // Instead, we can store the first theater object during mapping.
                    // For simplicity, we'll just pass a string.
                    const theaterNames = Array.from(value.theaters);
                    theaterToPass = { name: theaterNames[0], city: "" };
                } else if (theaterCount > 1) {
                    theaterToPass = { name: `${theaterCount} theaters`, city: "" };
                }

                uniqueMovies.push({
                    ...movie,
                    theater: theaterToPass,
                });
            });


            console.log(
                "Unique movies with theater info:",
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

            <h1 className="text-lg font-medium my-4 text-white">

                Upcoming Movies

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
                            theater={movie.theater}   // <-- pass theater info
                        />

                    );

                })}

            </div>

        </div>

    );

};


export default Movies;