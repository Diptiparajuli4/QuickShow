
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import BlurCircle from "../components/BlurCircle";

import {
    PlayCircleIcon,
    StarIcon,
    Heart,
} from "lucide-react";

import DateSelect from "../components/DateSelect";
import timeFormat from "../lib/timeFormat";
import MovieCard from "../components/MovieCard";

const MovieDetail = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    // =====================================================
    // STATE
    // =====================================================

    const [show, setShow] = useState(null);

    const [allMovies, setAllMovies] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showTrailer, setShowTrailer] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);

    const [favoriteLoading, setFavoriteLoading] = useState(false);


    // =====================================================
    // CHECK FAVOURITE
    // =====================================================

    const checkFavourite = async (movie) => {

        try {

            if (!movie) {
                return;
            }

            // =================================================
            // GET TOKEN
            // =================================================

            const token = localStorage.getItem("token");

            // User is not logged in
            if (!token) {

                setIsFavorite(false);

                return;
            }

            console.log(
                "Checking favourite from MongoDB..."
            );


            // =================================================
            // GET CURRENT USER
            // =================================================

            const response = await fetch(
                "http://localhost:5000/user/me",
                {
                    method: "GET",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );


            // =================================================
            // TOKEN EXPIRED
            // =================================================

            if (response.status === 401) {

                localStorage.removeItem("token");

                setIsFavorite(false);

                return;
            }


            // =================================================
            // OTHER ERROR
            // =================================================

            if (!response.ok) {

                setIsFavorite(false);

                return;
            }


            // =================================================
            // READ RESPONSE
            // =================================================

            const data = await response.json();

            console.log(
                "Current user:",
                data.user
            );

            console.log(
                "User favourites:",
                data.user?.favourites
            );


            // =================================================
            // GET FAVOURITES
            // =================================================

            const favourites =
                Array.isArray(data.user?.favourites)
                    ? data.user.favourites
                    : [];


            // =================================================
            // CURRENT MOVIE MONGODB ID
            // =================================================

            const movieId = movie._id;

            console.log(
                "Current movie MongoDB ID:",
                movieId
            );


            if (!movieId) {

                setIsFavorite(false);

                return;
            }


            // =================================================
            // CHECK FAVOURITE
            // =================================================

            const alreadyFavourite =
                favourites.some(
                    (favourite) => {

                        const favouriteId =
                            favourite?._id ||
                            favourite?.id ||
                            favourite;

                        return (
                            String(favouriteId) ===
                            String(movieId)
                        );

                    }
                );


            console.log(
                "Already favourite:",
                alreadyFavourite
            );


            setIsFavorite(
                alreadyFavourite
            );

        } catch (error) {

            console.error(
                "Error checking favourite:",
                error
            );

            setIsFavorite(false);
        }
    };


    // =====================================================
    // GET MOVIE DETAILS FROM MONGODB
    // =====================================================

    const getShow = async () => {

        try {

            setLoading(true);

            console.log(
                "================================="
            );

            console.log(
                "Fetching movie details from MongoDB..."
            );

            console.log(
                "Movie ID from URL:",
                id
            );

            console.log(
                "================================="
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


            // =================================================
            // READ JSON
            // =================================================

            const data = await response.json();

            console.log(
                "Shows received:",
                data
            );


            // =================================================
            // CHECK DATA
            // =================================================

            if (
                !data.success ||
                !Array.isArray(data.shows)
            ) {

                throw new Error(
                    "Invalid show data received from server."
                );
            }


            // =================================================
            // GET ALL POPULATED MOVIES
            // =================================================

            const movies = data.shows

                .map((showItem) => {

                    if (!showItem.movie) {
                        return null;
                    }

                    return showItem.movie;

                })

                .filter(Boolean);


            console.log(
                "Movies received from MongoDB:",
                movies
            );


            // =================================================
            // REMOVE DUPLICATE MOVIES
            // =================================================

            const uniqueMovies = [];

            const movieIds = new Set();


            movies.forEach((movie) => {

                const movieId =
                    movie._id ||
                    movie.id;


                if (!movieId) {
                    return;
                }


                const stringId =
                    String(movieId);


                if (!movieIds.has(stringId)) {

                    movieIds.add(stringId);

                    uniqueMovies.push(movie);
                }

            });


            setAllMovies(
                uniqueMovies
            );


            console.log(
                "Unique movies:",
                uniqueMovies
            );


            // =================================================
            // FIND MOVIE REQUESTED IN URL
            // =================================================

            const movieShows =
                data.shows.filter(
                    (showItem) => {

                        if (!showItem.movie) {
                            return false;
                        }


                        const movieId =
                            showItem.movie._id ||
                            showItem.movie.id;


                        return (
                            String(movieId) ===
                            String(id)
                        );

                    }
                );


            console.log(
                "Shows for this movie:",
                movieShows
            );


            // =================================================
            // MOVIE NOT FOUND
            // =================================================

            if (movieShows.length === 0) {

                console.log(
                    "Movie not found in MongoDB:",
                    id
                );

                setShow(null);

                return;
            }


            // =================================================
            // GET MOVIE
            // =================================================

            const movie =
                movieShows[0].movie;


            console.log(
                "Movie found:",
                movie
            );

            console.log(
                "MongoDB Movie _id:",
                movie._id
            );


            // =================================================
            // COMBINE ALL DATE/TIME DATA
            // =================================================

            const combinedDateTimes = {};


            movieShows.forEach(
                (showItem) => {

                    // -----------------------------------------
                    // CASE 1: dateTimes
                    // -----------------------------------------

                    if (
                        showItem.dateTimes &&
                        typeof showItem.dateTimes === "object"
                    ) {

                        Object.entries(
                            showItem.dateTimes
                        ).forEach(
                            ([date, times]) => {

                                if (
                                    !combinedDateTimes[date]
                                ) {

                                    combinedDateTimes[date] = [];
                                }


                                if (
                                    Array.isArray(times)
                                ) {

                                    combinedDateTimes[date].push(
                                        ...times
                                    );
                                }

                            }
                        );

                    }


                    // -----------------------------------------
                    // CASE 2: showDateTime
                    // -----------------------------------------

                    if (
                        showItem.showDateTime
                    ) {

                        const dateObject =
                            new Date(
                                showItem.showDateTime
                            );


                        if (
                            !isNaN(
                                dateObject.getTime()
                            )
                        ) {

                            const date =
                                dateObject
                                    .toISOString()
                                    .split("T")[0];


                            const time =
                                dateObject
                                    .toTimeString()
                                    .slice(0, 5);


                            if (
                                !combinedDateTimes[date]
                            ) {

                                combinedDateTimes[date] = [];
                            }


                            if (
                                !combinedDateTimes[date].includes(
                                    time
                                )
                            ) {

                                combinedDateTimes[date].push(
                                    time
                                );
                            }

                        }

                    }

                }
            );


            // =================================================
            // REMOVE DUPLICATE TIMES
            // =================================================

            Object.keys(
                combinedDateTimes
            ).forEach(
                (date) => {

                    combinedDateTimes[date] = [
                        ...new Set(
                            combinedDateTimes[date]
                        )
                    ].sort();

                }
            );


            console.log(
                "Combined Date/Time:",
                combinedDateTimes
            );


            // =================================================
            // GET TRAILER
            // =================================================

            let trailer = null;


            if (movie.trailer) {

                trailer = {
                    videoUrl: movie.trailer,
                };

            } else if (movie.trailer_url) {

                trailer = {
                    videoUrl: movie.trailer_url,
                };

            } else if (movie.videoUrl) {

                trailer = {
                    videoUrl: movie.videoUrl,
                };
            }


            // =================================================
            // SET SHOW
            // =================================================

            setShow({

                movie: movie,

                showData:
                    movieShows[0],

                allShows:
                    movieShows,

                dateTime:
                    combinedDateTimes,

                trailer:
                    trailer,
            });


            // =================================================
            // CHECK USER FAVOURITE
            // =================================================

            await checkFavourite(
                movie
            );

        } catch (error) {

            console.error(
                "Error loading movie from MongoDB:",
                error
            );

            setShow(null);

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOAD MOVIE WHEN ID CHANGES
    // =====================================================

    useEffect(() => {

        getShow();

    }, [id]);


    // =====================================================
    // TOGGLE FAVOURITE
    // =====================================================

    const toggleFavorite = async () => {

        try {

            // =================================================
            // CHECK MOVIE
            // =================================================

            if (!show?.movie) {

                alert(
                    "Movie information is not available."
                );

                return;
            }


            // =================================================
            // GET TOKEN
            // =================================================

            const token =
                localStorage.getItem("token");


            // =================================================
            // USER NOT LOGGED IN
            // =================================================

            if (!token) {

                alert(
                    "Please login first to add movies to your favourites."
                );

                navigate("/login");

                return;
            }


            // =================================================
            // GET MONGODB MOVIE ID
            // =================================================

            const movieId =
                show.movie._id;


            console.log(
                "================================="
            );

            console.log(
                "MOVIE FAVOURITE REQUEST"
            );

            console.log(
                "Movie:",
                show.movie.title
            );

            console.log(
                "MongoDB Movie ID:",
                movieId
            );

            console.log(
                "================================="
            );


            // =================================================
            // CHECK MOVIE ID
            // =================================================

            if (!movieId) {

                alert(
                    "MongoDB Movie ID not found."
                );

                return;
            }


            // =================================================
            // PREVENT DOUBLE CLICK
            // =================================================

            if (favoriteLoading) {
                return;
            }


            setFavoriteLoading(true);


            // =================================================
            // SEND REQUEST
            // =================================================

            const response = await fetch(
                `http://localhost:5000/user/favourite/${movieId}`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },
                }
            );


            // =================================================
            // READ RESPONSE
            // =================================================

            const data =
                await response.json();


            console.log(
                "Favourite status:",
                response.status
            );

            console.log(
                "Favourite response:",
                data
            );


            // =================================================
            // TOKEN EXPIRED
            // =================================================

            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                setIsFavorite(false);

                alert(
                    "Your session has expired. Please login again."
                );

                navigate("/login");

                return;
            }


            // =================================================
            // BACKEND ERROR
            // =================================================

            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to update favourite."
                );

                return;
            }


            // =================================================
            // UPDATE HEART FROM BACKEND
            // =================================================

            setIsFavorite(
                data.isFavourite === true
            );


            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            alert(
                data.message ||
                "Favourite updated successfully."
            );

        } catch (error) {

            console.error(
                "Favourite request error:",
                error
            );

            alert(
                "Unable to update favourite. Please try again."
            );

        } finally {

            setFavoriteLoading(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="flex items-center justify-center h-screen">

                <h1 className="text-xl text-gray-300">

                    Loading movie...

                </h1>

            </div>
        );
    }


    // =====================================================
    // MOVIE NOT FOUND
    // =====================================================

    if (!show) {

        return (

            <div className="flex flex-col items-center justify-center h-screen">

                <h1 className="text-xl text-white">

                    Movie not available

                </h1>


                <button

                    onClick={() => {

                        navigate("/movies");

                        window.scrollTo(
                            0,
                            0
                        );

                    }}

                    className="mt-5 px-6 py-2 bg-primary rounded-md"

                >

                    Back to Movies

                </button>

            </div>
        );
    }


    // =====================================================
    // MOVIE
    // =====================================================

    const movie =
        show.movie;


    // =====================================================
    // POSTER URL
    // =====================================================

    const posterUrl =
        movie.poster_path

            ? movie.poster_path.startsWith(
                "http"
            )

                ? movie.poster_path

                : `https://image.tmdb.org/t/p/w500${movie.poster_path}`

            : "/fallback.jpg";


    // =====================================================
    // TRAILER URL
    // =====================================================

    const videoUrl =
        show.trailer?.videoUrl;


    const embedUrl =
        videoUrl

            ? videoUrl.includes(
                "watch?v="
            )

                ? videoUrl.replace(
                    "watch?v=",
                    "embed/"
                )

                : videoUrl.includes(
                    "youtu.be/"
                )

                    ? videoUrl.replace(
                        "youtu.be/",
                        "youtube.com/embed/"
                    )

                    : videoUrl

            : null;


    // =====================================================
    // RUNTIME
    // =====================================================

    const runtime =
        movie.runtime
            ? timeFormat(
                movie.runtime
            )
            : "N/A";


    // =====================================================
    // GENRES
    // =====================================================

    const genres =
        Array.isArray(
            movie.genres
        )

            ? movie.genres
                .map(
                    (genre) =>
                        typeof genre === "string"
                            ? genre
                            : genre.name
                )
                .filter(Boolean)
                .join(", ")

            : "N/A";


    // =====================================================
    // RELEASE YEAR
    // =====================================================

    const releaseYear =
        movie.release_date
            ? movie.release_date.split("-")[0]

            : movie.releaseDate

                ? String(
                    movie.releaseDate
                ).split("-")[0]

                : "N/A";


    // =====================================================
    // RATING
    // =====================================================

    const rating =
        movie.vote_average !== undefined &&
        movie.vote_average !== null

            ? Number(
                movie.vote_average
            ).toFixed(1)

            : "N/A";


    // =====================================================
    // CAST
    // =====================================================

    const casts =
        Array.isArray(
            movie.casts
        )

            ? movie.casts

            : Array.isArray(
                movie.cast
            )

                ? movie.cast

                : [];


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">


            {/* ================================================= */}
            {/* TOP SECTION */}
            {/* ================================================= */}

            <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">


                {/* ================================================= */}
                {/* MOVIE POSTER */}
                {/* ================================================= */}

                <img

                    src={posterUrl}

                    alt={
                        movie.title ||
                        "Movie"
                    }

                    className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"

                />


                {/* ================================================= */}
                {/* MOVIE INFORMATION */}
                {/* ================================================= */}

                <div className="relative flex flex-col gap-3">


                    <BlurCircle
                        top="-100px"
                        left="-100px"
                    />


                    {/* LANGUAGE */}

                    <p className="text-primary">

                        {movie.language ||
                            "English"}

                    </p>


                    {/* TITLE */}

                    <h1 className="text-4xl font-semibold max-w-96 text-balance">

                        {movie.title ||
                            "Untitled Movie"}

                    </h1>


                    {/* RATING */}

                    <div className="flex items-center gap-2 text-gray-300">

                        <StarIcon
                            className="w-5 h-5 text-primary fill-primary"
                        />

                        {rating}

                        {" "}

                        User Rating

                    </div>


                    {/* OVERVIEW */}

                    <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">

                        {movie.overview ||
                            "No description available."}

                    </p>


                    {/* MOVIE DETAILS */}

                    <p>

                        {runtime}

                        {" • "}

                        {genres}

                        {" • "}

                        {releaseYear}

                    </p>


                    {/* ================================================= */}
                    {/* BUTTONS */}
                    {/* ================================================= */}

                    <div className="flex items-center flex-wrap gap-4 mt-4">


                        {/* ================================================= */}
                        {/* WATCH TRAILER */}
                        {/* ================================================= */}

                        {embedUrl && (

                            <button

                                onClick={() =>
                                    setShowTrailer(
                                        true
                                    )
                                }

                                className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95"

                            >

                                <PlayCircleIcon
                                    className="w-5 h-5"
                                />

                                Watch Trailer

                            </button>
                        )}


                        {/* ================================================= */}
                        {/* BUY TICKETS */}
                        {/* ================================================= */}

                        <a

                            href="#dateSelect"

                            className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"

                        >

                            Buy Tickets

                        </a>


                        {/* ================================================= */}
                        {/* FAVOURITE */}
                        {/* ================================================= */}

                        <button

                            type="button"

                            onClick={
                                toggleFavorite
                            }

                            disabled={
                                favoriteLoading
                            }

                            title={
                                isFavorite
                                    ? "Remove from favourites"
                                    : "Add to favourites"
                            }

                            className={`
                                p-2.5
                                rounded-full
                                transition
                                cursor-pointer
                                active:scale-95
                                ${
                                    isFavorite
                                        ? "bg-primary text-white"
                                        : "bg-gray-700 text-white"
                                }
                                ${
                                    favoriteLoading
                                        ? "opacity-60 cursor-not-allowed"
                                        : ""
                                }
                            `}

                        >

                            <Heart

                                className="w-5 h-5"

                                fill={
                                    isFavorite
                                        ? "currentColor"
                                        : "none"
                                }

                            />

                        </button>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* CAST */}
            {/* ================================================= */}

            {casts.length > 0 && (

                <>

                    <p className="text-lg font-medium mt-20">

                        Your Favorite Cast

                    </p>


                    <div className="overflow-x-auto no-scrollbar mt-8 pb-4">

                        <div className="flex items-center gap-4 w-max px-4">

                            {casts

                                .slice(
                                    0,
                                    12
                                )

                                .map(
                                    (
                                        cast,
                                        index
                                    ) => {

                                        const castImage =
                                            cast.profile_path

                                                ? cast.profile_path.startsWith(
                                                    "http"
                                                )

                                                    ? cast.profile_path

                                                    : `https://image.tmdb.org/t/p/w200${cast.profile_path}`

                                                : "/fallback.jpg";


                                        return (

                                            <div

                                                key={
                                                    cast.id ||
                                                    index
                                                }

                                                className="flex flex-col items-center text-center"

                                            >

                                                <img

                                                    src={
                                                        castImage
                                                    }

                                                    alt={
                                                        cast.name ||
                                                        "Cast"
                                                    }

                                                    className="rounded-full h-20 w-20 object-cover"

                                                />


                                                <p className="font-medium text-xs mt-3">

                                                    {cast.name}

                                                </p>

                                            </div>

                                        );

                                    }
                                )}

                        </div>

                    </div>

                </>

            )}


            {/* ================================================= */}
            {/* DATE SELECT */}
            {/* ================================================= */}

            <div id="dateSelect">

                <DateSelect

                    dateTime={
                        show.dateTime
                    }

                    id={id}

                />

            </div>


            {/* ================================================= */}
            {/* RECOMMENDATIONS */}
            {/* ================================================= */}

            {allMovies.length > 1 && (

                <>

                    <p className="text-lg font-medium mt-20 mb-8">

                        You May Also Like

                    </p>


                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">

                        {allMovies

                            .filter(
                                (otherMovie) =>
                                    String(
                                        otherMovie._id ||
                                        otherMovie.id
                                    ) !==
                                    String(
                                        movie._id ||
                                        movie.id
                                    )
                            )

                            .slice(
                                0,
                                4
                            )

                            .map(
                                (
                                    otherMovie
                                ) => (

                                    <div

                                        key={
                                            String(
                                                otherMovie._id ||
                                                otherMovie.id
                                            )
                                        }

                                        className="w-full max-w-[220px]"

                                    >

                                        <MovieCard

                                            movie={
                                                otherMovie
                                            }

                                        />

                                    </div>

                                )
                            )}

                    </div>

                </>

            )}


            {/* ================================================= */}
            {/* SHOW MORE */}
            {/* ================================================= */}

            <div className="flex justify-center mt-20">

                <button

                    onClick={() => {

                        navigate(
                            "/movies"
                        );

                        window.scrollTo(
                            0,
                            0
                        );

                    }}

                    className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"

                >

                    Show More

                </button>

            </div>


            {/* ================================================= */}
            {/* TRAILER MODAL */}
            {/* ================================================= */}

            {showTrailer &&
                embedUrl && (

                    <div

                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"

                        onClick={() =>
                            setShowTrailer(
                                false
                            )
                        }

                    >

                        <div

                            className="relative w-[90%] md:w-[900px] aspect-video"

                            onClick={(e) =>
                                e.stopPropagation()
                            }

                        >

                            <button

                                onClick={() =>
                                    setShowTrailer(
                                        false
                                    )
                                }

                                className="absolute -top-12 right-0 text-white text-3xl"

                            >

                                ×

                            </button>


                            <iframe

                                src={
                                    embedUrl
                                }

                                title={
                                    movie.title
                                }

                                className="w-full h-full rounded-lg"

                                allowFullScreen

                            />

                        </div>

                    </div>

                )}

        </div>
    );
};

export default MovieDetail;
