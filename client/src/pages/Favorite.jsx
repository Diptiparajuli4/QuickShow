import React, { useState, useCallback, useEffect } from "react";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { useAutoRefresh } from "../context/RefreshContext";
import { Star, Trophy } from "lucide-react";

// =====================================================
// HELPER: get HIGHEST user rating for a movie
//
// Returns { highest, count } — both 0 if there are no
// real user ratings. NEVER falls back to TMDB.
// =====================================================
const getUserRatingInfo = (movie) => {
    if (Array.isArray(movie?.ratings) && movie.ratings.length > 0) {
        const valid = movie.ratings
            .map((r) => Number(r?.rating))
            .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);

        if (valid.length > 0) {
            return {
                highest: Math.max(...valid),
                count: valid.length,
            };
        }
    }
    return { highest: 0, count: 0 };
};

const Favorite = () => {
    const { user, userToken } = useAuth();

    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // FETCH FAVORITE MOVIES
    // =====================================================
    const fetchFavoriteMovies = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            if (!userToken || !user) {
                setError("Please login.");
                setLoading(false);
                return;
            }

            // 1. Get user's favourite IDs
            const userRes = await fetch("http://localhost:5000/user/me", {
                headers: { Authorization: `Bearer ${userToken}` },
            });

            if (!userRes.ok) {
                throw new Error(`/user/me failed: ${userRes.status}`);
            }

            const userData = await userRes.json();
            const favouriteIds = Array.isArray(userData.user?.favourites)
                ? userData.user.favourites.map(String)
                : [];

            console.log("Favourite IDs:", favouriteIds);

            if (favouriteIds.length === 0) {
                setFavoriteMovies([]);
                setError("No favourites yet.");
                setLoading(false);

                window.dispatchEvent(new Event("favoritesUpdated"));
                return;
            }

            // 2. Fetch each movie directly by ID
            const moviePromises = favouriteIds.map(async (movieId) => {
                try {
                    const res = await fetch(
                        `http://localhost:5000/movie/${movieId}`
                    );

                    if (!res.ok) {
                        console.warn(
                            `Movie ${movieId} fetch failed: ${res.status}`
                        );
                        return null;
                    }

                    const data = await res.json();
                    return data.movie || data.data || null;
                } catch (err) {
                    console.warn(`Error fetching movie ${movieId}:`, err);
                    return null;
                }
            });

            const results = await Promise.all(moviePromises);
            const matched = results.filter(Boolean);

            console.log("Matched favourite movies:", matched);

            setFavoriteMovies(matched);

            if (matched.length === 0) {
                setError("Favourite movies not found in database.");
            } else {
                setError("");
            }

            window.dispatchEvent(new Event("favoritesUpdated"));
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [userToken, user]);

    // Auto-refresh on global refresh() call
    useAutoRefresh(fetchFavoriteMovies, [userToken, user]);

    // Listen for external favorites updates
    useEffect(() => {
        const handleUpdate = () => {
            console.log("🔄 Favorite page received favoritesUpdated event");
            fetchFavoriteMovies();
        };

        window.addEventListener("favoritesUpdated", handleUpdate);
        return () =>
            window.removeEventListener("favoritesUpdated", handleUpdate);
    }, [fetchFavoriteMovies]);

    // -------- Render --------
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loading />
                </main>
                <Footer />
            </div>
        );
    }

    if (!userToken || !user) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center px-6">
                    <h1 className="text-3xl font-bold text-center">
                        Please login
                    </h1>
                    <button
                        onClick={() => (window.location.href = "/login")}
                        className="mt-6 px-6 py-2 bg-primary rounded-lg"
                    >
                        Login
                    </button>
                </main>
                <Footer />
            </div>
        );
    }

    if (
        error &&
        error !== "No favourites yet." &&
        error !== "Favourite movies not found in database."
    ) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md w-full">
                        <h1 className="text-2xl font-bold text-red-400 text-center">
                            Error
                        </h1>
                        <p className="text-gray-300 mt-3 text-center">
                            {error}
                        </p>
                        <button
                            onClick={fetchFavoriteMovies}
                            className="mt-6 w-full px-6 py-2 bg-primary rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (favoriteMovies.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 relative overflow-hidden px-4 py-10 md:px-16 lg:px-40">
                    <BlurCircle top="150px" left="0px" />
                    <BlurCircle bottom="50px" right="50px" />
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                        <h1 className="text-3xl font-bold text-center">
                            No favourite movies
                        </h1>
                        <p className="text-gray-400 mt-3 text-center">
                            Movies you add to favourites will appear here.
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Find highest rating among all favourite movies
    const ratedMovies = favoriteMovies.filter(
        (m) => getUserRatingInfo(m).highest > 0
    );
    const topRating =
        ratedMovies.length > 0
            ? Math.max(
                  ...ratedMovies.map(
                      (m) => getUserRatingInfo(m).highest
                  )
              )
            : 0;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <main className="flex-1 relative overflow-hidden px-4 py-10 md:px-16 lg:px-40">
                <BlurCircle top="150px" left="0px" />
                <BlurCircle bottom="50px" right="50px" />

                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-medium">
                            My Favourite Movies
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {favoriteMovies.length}{" "}
                            {favoriteMovies.length === 1
                                ? "movie"
                                : "movies"}{" "}
                            saved
                        </p>
                    </div>
                </div>

                {/* ================================================= */}
                {/* GRID — Same layout as other pages                */}
                {/* ================================================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {favoriteMovies.map((movie) => {
                        const { highest, count } =
                            getUserRatingInfo(movie);
                        const hasRating = highest > 0 && count > 0;
                        const isTopRated =
                            hasRating && highest === topRating;

                        return (
                            <div
                                key={String(movie._id)}
                                className="relative"
                            >
                                {/* TOP RATED BADGE */}
                                {isTopRated && (
                                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                        <Trophy size={12} />
                                        Top Rated
                                    </div>
                                )}

                                {/* SAME MovieCard component — same button style */}
                                <MovieCard movie={movie} />

                                {/* HIGHEST RATING LINE — only if rated */}
                                {hasRating && (
                                    <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                        <Star
                                            size={12}
                                            className="text-yellow-400 fill-yellow-400"
                                        />
                                        <span className="text-white font-medium">
                                            {highest}/5
                                        </span>
                                        <span className="text-gray-500">
                                            ({count}{" "}
                                            {count === 1
                                                ? "vote"
                                                : "votes"}
                                            )
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Favorite;