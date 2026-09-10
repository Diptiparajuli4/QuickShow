import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import BlurCircle from "../components/BlurCircle";
import {
    PlayCircleIcon,
    StarIcon,
    Heart,
} from "lucide-react";

import DateSelect from "../components/DateSelect";
import timeFormat from "../lib/timeFormat";
import MovieCard from "../components/MovieCard";

// =====================================================
// INTERACTIVE STAR RATING COMPONENT
// =====================================================
const StarRating = ({ value, onChange, disabled }) => {
    const [hover, setHover] = useState(0);
    const display = hover || value;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={disabled}
                    onMouseEnter={() => !disabled && setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => !disabled && onChange(n)}
                    className={`transition-all ${
                        disabled
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer hover:scale-110 active:scale-95"
                    }`}
                    aria-label={`Rate ${n} stars`}
                >
                    <StarIcon
                        size={26}
                        className={`transition ${
                            n <= display
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

const MovieDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, userToken } = useAuth();

    const [show, setShow] = useState(null);
    const [allMovies, setAllMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    // -------- RATING STATE --------
    const [userRating, setUserRating] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingMessage, setRatingMessage] = useState("");

    // =====================================================
    // CHECK FAVOURITE
    // =====================================================
    const checkFavourite = async (movie) => {
        try {
            if (!movie) return;
            if (!userToken || !user) {
                setIsFavorite(false);
                return;
            }

            const response = await fetch(
                "http://localhost:5000/user/me",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            if (!response.ok) {
                setIsFavorite(false);
                return;
            }

            const data = await response.json();

            const favouriteIds = Array.isArray(data.user?.favourites)
                ? data.user.favourites.map((fid) => String(fid))
                : [];

            setIsFavorite(favouriteIds.includes(String(movie._id)));
        } catch (error) {
            console.error("Error checking favourite:", error);
            setIsFavorite(false);
        }
    };

    // =====================================================
    // FETCH RATINGS FOR THIS MOVIE
    // =====================================================
    const fetchRatings = async (movieId) => {
        try {
            const headers = {};
            if (userToken) {
                headers.Authorization = `Bearer ${userToken}`;
            }

            const res = await fetch(
                `http://localhost:5000/movie/${movieId}/ratings`,
                { headers }
            );

            if (!res.ok) return;

            const data = await res.json();

            if (data.success) {
                setAvgRating(Number(data.averageRating) || 0);
                setTotalRatings(Number(data.totalRatings) || 0);
                setUserRating(Number(data.userRating) || 0);

                console.log("Ratings loaded:", {
                    averageRating: data.averageRating,
                    totalRatings: data.totalRatings,
                    userRating: data.userRating,
                });
            }
        } catch (err) {
            console.warn("Could not fetch ratings:", err.message);
        }
    };

    // =====================================================
    // SUBMIT USER RATING
    // =====================================================
    const submitRating = async (value) => {
        if (!userToken || !user) {
            alert("Please login to rate this movie.");
            navigate("/login");
            return;
        }

        if (!id) return;
        if (ratingLoading) return;

        setRatingLoading(true);
        setRatingMessage("");

        try {
            const res = await fetch(
                `http://localhost:5000/movie/${id}/rate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({ rating: value }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to submit rating.");
            }

            setUserRating(value);
            if (data.averageRating !== undefined) {
                setAvgRating(Number(data.averageRating));
            }
            if (data.totalRatings !== undefined) {
                setTotalRatings(Number(data.totalRatings));
            }

            setRatingMessage(
                `Thanks! You rated this ${value} star${value > 1 ? "s" : ""}.`
            );

            // Auto-clear message
            setTimeout(() => setRatingMessage(""), 3000);
        } catch (err) {
            console.error("Rating error:", err);
            alert(err.message || "Unable to submit rating.");
        } finally {
            setRatingLoading(false);
        }
    };

    // =====================================================
    // GET MOVIE DETAILS + ALL MOVIES
    // =====================================================
    const getShow = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/show/all"
            );

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !Array.isArray(data.shows)) {
                throw new Error("Invalid show data received from server.");
            }

            // Fetch ALL movies
            let allMoviesData = [];

            try {
                const moviesResponse = await fetch(
                    "http://localhost:5000/movie/all"
                );

                if (moviesResponse.ok) {
                    const moviesJson = await moviesResponse.json();
                    allMoviesData = Array.isArray(moviesJson.movies)
                        ? moviesJson.movies
                        : [];
                }
            } catch (err) {
                console.warn("Could not fetch /movie/all:", err.message);
            }

            const moviesFromShows = data.shows
                .map((s) => s.movie)
                .filter((m) => m && typeof m === "object");

            const movieMap = new Map();

            allMoviesData.forEach((m) => {
                if (m && (m._id || m.id)) {
                    movieMap.set(String(m._id || m.id), m);
                }
            });

            moviesFromShows.forEach((m) => {
                const key = String(m._id || m.id);
                if (!movieMap.has(key)) {
                    movieMap.set(key, m);
                }
            });

            setAllMovies(Array.from(movieMap.values()));

            // Find shows for this movie
            const movieShows = data.shows.filter((showItem) => {
                if (!showItem.movie) return false;
                const movieId = showItem.movie._id || showItem.movie.id;
                return String(movieId) === String(id);
            });

            if (movieShows.length === 0) {
                setShow(null);
                return;
            }

            const movie = movieShows[0].movie;

            const combinedDateTimes = {};

            movieShows.forEach((showItem) => {
                if (
                    showItem.dateTimes &&
                    typeof showItem.dateTimes === "object"
                ) {
                    Object.entries(showItem.dateTimes).forEach(
                        ([date, times]) => {
                            if (!combinedDateTimes[date])
                                combinedDateTimes[date] = [];
                            if (Array.isArray(times)) {
                                times.forEach((time) => {
                                    combinedDateTimes[date].push(time);
                                });
                            }
                        }
                    );
                }
                if (showItem.showDateTime) {
                    const dateObject = new Date(showItem.showDateTime);
                    if (!isNaN(dateObject.getTime())) {
                        const date = dateObject
                            .toISOString()
                            .split("T")[0];
                        const time = dateObject
                            .toTimeString()
                            .slice(0, 5);
                        if (!combinedDateTimes[date])
                            combinedDateTimes[date] = [];
                        if (!combinedDateTimes[date].includes(time)) {
                            combinedDateTimes[date].push(time);
                        }
                    }
                }
            });

            Object.keys(combinedDateTimes).forEach((date) => {
                combinedDateTimes[date] = [
                    ...new Set(combinedDateTimes[date]),
                ].sort();
            });

            let trailer = null;
            if (movie.trailer) {
                trailer = { videoUrl: movie.trailer };
            } else if (movie.trailer_url) {
                trailer = { videoUrl: movie.trailer_url };
            } else if (movie.videoUrl) {
                trailer = { videoUrl: movie.videoUrl };
            }

            setShow({
                movie: movie,
                showData: movieShows[0],
                allShows: movieShows,
                dateTime: combinedDateTimes,
                trailer: trailer,
            });

            // Init ratings
            setAvgRating(Number(movie.userRatingAvg) || 0);
            setTotalRatings(Number(movie.userRatingCount) || 0);

            await checkFavourite(movie);
            await fetchRatings(movie._id);
        } catch (error) {
            console.error("Error loading movie:", error);
            setShow(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getShow();
        // eslint-disable-next-line
    }, [id]);

    // =====================================================
    // TOGGLE FAVOURITE
    // =====================================================
    const toggleFavorite = async () => {
        try {
            if (!show?.movie) {
                alert("Movie information is not available.");
                return;
            }

            if (!userToken || !user) {
                alert("Please login first to add movies to your favourites.");
                navigate("/login");
                return;
            }

            const movieId = show.movie._id;

            if (!movieId) {
                alert("MongoDB Movie ID not found.");
                return;
            }

            if (favoriteLoading) return;
            setFavoriteLoading(true);

            const response = await fetch(
                `http://localhost:5000/user/favourite/${movieId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update favourite.");
                return;
            }

            setIsFavorite(data.isFavourite === true);

            window.dispatchEvent(new Event("favoritesUpdated"));

            alert(data.message || "Favourite updated successfully.");
        } catch (error) {
            console.error("Favourite request error:", error);
            alert("Unable to update favourite. Please try again.");
        } finally {
            setFavoriteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-xl text-gray-300">Loading movie...</h1>
            </div>
        );
    }

    if (!show) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-xl text-white">Movie not available</h1>
                <button
                    onClick={() => {
                        navigate("/movies");
                        window.scrollTo(0, 0);
                    }}
                    className="mt-5 px-6 py-2 bg-primary rounded-md"
                >
                    Back to Movies
                </button>
            </div>
        );
    }

    const movie = show.movie;

    const posterUrl = movie.poster_path
        ? movie.poster_path.startsWith("http")
            ? movie.poster_path
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "/fallback.jpg";

    const videoUrl = show.trailer?.videoUrl;
    const embedUrl = videoUrl
        ? videoUrl.includes("watch?v=")
            ? videoUrl.replace("watch?v=", "embed/")
            : videoUrl.includes("youtu.be/")
                ? videoUrl.replace("youtu.be/", "youtube.com/embed/")
                : videoUrl
        : null;

    const runtime = movie.runtime ? timeFormat(movie.runtime) : "N/A";
    const genres = Array.isArray(movie.genres)
        ? movie.genres
              .map((genre) =>
                  typeof genre === "string" ? genre : genre.name
              )
              .filter(Boolean)
              .join(", ")
        : "N/A";

    const releaseYear = movie.release_date
        ? movie.release_date.split("-")[0]
        : movie.releaseDate
            ? String(movie.releaseDate).split("-")[0]
            : "N/A";

    const casts = Array.isArray(movie.casts)
        ? movie.casts
        : Array.isArray(movie.cast)
            ? movie.cast
            : [];

    // =====================================================
    // RECOMMENDATIONS — 4 items (same as Home)
    // =====================================================
    const currentId = String(movie._id || movie.id || id);

    const recommendations = allMovies
        .filter((m) => {
            const mId = String(m._id || m.id);
            return mId && mId !== currentId;
        })
        .slice(0, 4);

    return (
        <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
            {/* TOP SECTION */}
            <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
                {/* POSTER — fully visible */}
                <div className="max-md:mx-auto w-60 md:w-70 shrink-0">
                    <div
                        className="
                            w-full
                            h-104
                            bg-gray-950
                            rounded-xl
                            overflow-hidden
                            shadow-2xl
                            border
                            border-white/10
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <img
                            src={posterUrl}
                            alt={movie.title || "Movie"}
                            className="
                                max-w-full
                                max-h-full
                                w-auto
                                h-auto
                                object-contain
                                object-center
                            "
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/fallback.jpg";
                            }}
                        />
                    </div>
                </div>

                {/* INFO */}
                <div className="relative flex flex-col gap-3">
                    <BlurCircle top="-100px" left="-100px" />

                    <p className="text-primary">
                        {movie.language || "Nepali"}
                    </p>
                    <h1 className="text-4xl font-semibold max-w-96 text-balance">
                        {movie.title || "Untitled Movie"}
                    </h1>

                    {/* ================================================= */}
                    {/* RATING SECTION */}
                    {/* ================================================= */}
                    <div className="flex flex-col gap-3 mt-1">
                        {/* Average rating display */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <StarIcon className="w-5 h-5 text-primary fill-primary" />
                                <span className="text-lg font-semibold text-white">
                                    {avgRating > 0
                                        ? Number(avgRating).toFixed(1)
                                        : "N/A"}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    User Rating
                                </span>
                            </div>

                            {totalRatings > 0 && (
                                <span className="text-xs text-gray-500 bg-gray-800/60 border border-gray-700 px-2.5 py-1 rounded-full">
                                    {totalRatings}{" "}
                                    {totalRatings === 1 ? "vote" : "votes"}
                                </span>
                            )}
                        </div>

                        {/* Interactive user rating */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm text-gray-400">
                                {userRating > 0
                                    ? "Your rating:"
                                    : "Rate this movie:"}
                            </span>

                            <StarRating
                                value={userRating}
                                onChange={submitRating}
                                disabled={ratingLoading}
                            />

                            {userRating > 0 && (
                                <span className="text-sm font-medium text-primary">
                                    {userRating}/5
                                </span>
                            )}

                            {ratingLoading && (
                                <span className="text-xs text-gray-500">
                                    Saving...
                                </span>
                            )}
                        </div>

                        {ratingMessage && (
                            <p className="text-xs text-emerald-400">
                                ✓ {ratingMessage}
                            </p>
                        )}
                    </div>

                    <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
                        {movie.overview || "No description available."}
                    </p>
                    <p>
                        {runtime} • {genres} • {releaseYear}
                    </p>

                    {/* BUTTONS */}
                    <div className="flex items-center flex-wrap gap-4 mt-4">
                        {embedUrl && (
                            <button
                                onClick={() => setShowTrailer(true)}
                                className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95"
                            >
                                <PlayCircleIcon className="w-5 h-5" />
                                Watch Trailer
                            </button>
                        )}
                        <a
                            href="#dateSelect"
                            className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
                        >
                            Buy Tickets
                        </a>

                        <button
                            type="button"
                            onClick={toggleFavorite}
                            disabled={favoriteLoading}
                            title={
                                isFavorite
                                    ? "Remove from favourites"
                                    : "Add to favourites"
                            }
                            className={`
                                p-2.5 rounded-full transition cursor-pointer active:scale-95
                                ${isFavorite ? "bg-primary text-white" : "bg-gray-700 text-white"}
                                ${favoriteLoading ? "opacity-60 cursor-not-allowed" : ""}
                            `}
                        >
                            <Heart
                                className="w-5 h-5"
                                fill={
                                    isFavorite ? "currentColor" : "none"
                                }
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* CAST */}
            {casts.length > 0 && (
                <>
                    <p className="text-lg font-medium mt-20">
                        Your Favorite Cast
                    </p>
                    <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
                        <div className="flex items-center gap-4 w-max px-4">
                            {casts.slice(0, 12).map((cast, index) => {
                                const castImage = cast.profile_path
                                    ? cast.profile_path.startsWith("http")
                                        ? cast.profile_path
                                        : `https://image.tmdb.org/t/p/w200${cast.profile_path}`
                                    : "/fallback.jpg";
                                return (
                                    <div
                                        key={cast.id || index}
                                        className="flex flex-col items-center text-center"
                                    >
                                        <img
                                            src={castImage}
                                            alt={cast.name || "Cast"}
                                            className="rounded-full h-20 w-20 object-cover"
                                        />
                                        <p className="font-medium text-xs mt-3">
                                            {cast.name}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* DATE SELECT */}
            <div id="dateSelect">
                <DateSelect dateTime={show.dateTime} id={id} />
            </div>

            {/* RECOMMENDATIONS */}
            {recommendations.length > 0 && (
                <div className="mt-20">
                    <p className="text-lg font-medium mb-8">
                        You May Also Like
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recommendations.map((otherMovie) => (
                            <MovieCard
                                key={String(
                                    otherMovie._id || otherMovie.id
                                )}
                                movie={otherMovie}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* TRAILER MODAL */}
            {showTrailer && embedUrl && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => setShowTrailer(false)}
                >
                    <div
                        className="relative w-[90%] md:w-[900px] aspect-video"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowTrailer(false)}
                            className="absolute -top-12 right-0 text-white text-3xl"
                        >
                            ×
                        </button>
                        <iframe
                            src={embedUrl}
                            title={movie.title}
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