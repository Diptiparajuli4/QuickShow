import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import MovieCard from "../components/MovieCard";

import { MapPin, Star, Trophy } from "lucide-react";

// =====================================================
// CONFIG
// =====================================================
const BACKEND_URL = "http://localhost:5000";

// =====================================================
// HELPERS
// =====================================================
const resolveTheaterFromShow = (show) => {
    if (show.theaterId && typeof show.theaterId === "object") {
        return String(show.theaterId._id || show.theaterId.id || "");
    }
    if (show.theaterId) return String(show.theaterId);
    if (show.theater && typeof show.theater === "object") {
        return String(show.theater._id || show.theater.id || "");
    }
    return "";
};

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

const Theaters = () => {
    const navigate = useNavigate();

    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // FETCH THEATERS + SHOWS + MOVIES (for ratings)
    // =====================================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                // 1. Get all theaters
                let theatersList = [];
                try {
                    const tRes = await axios.get(
                        `${BACKEND_URL}/theater/all`
                    );
                    theatersList =
                        tRes.data?.theaters ||
                        tRes.data?.data ||
                        (Array.isArray(tRes.data) ? tRes.data : []);
                } catch (tErr) {
                    console.warn(
                        "Could not fetch /theater/all:",
                        tErr?.message
                    );
                }

                // 2. Get all shows
                let shows = [];
                try {
                    const sRes = await axios.get(`${BACKEND_URL}/show/all`);
                    shows = Array.isArray(sRes.data?.shows)
                        ? sRes.data.shows
                        : [];
                } catch (sErr) {
                    console.warn(
                        "Could not fetch /show/all:",
                        sErr?.message
                    );
                }

                // 3. Get all movies (for rating data)
                let moviesFromDb = [];
                try {
                    const mRes = await axios.get(`${BACKEND_URL}/movie/all`);
                    moviesFromDb = Array.isArray(mRes.data?.movies)
                        ? mRes.data.movies
                        : [];
                } catch (mErr) {
                    console.warn(
                        "Could not fetch /movie/all:",
                        mErr?.message
                    );
                }

                // Map: movieId → full movie doc (with ratings)
                const movieDocMap = new Map();
                moviesFromDb.forEach((m) => {
                    if (m && (m._id || m.id)) {
                        movieDocMap.set(String(m._id || m.id), m);
                    }
                });

                // 4. Keep only active shows (today onwards)
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                const activeShows = shows.filter((s) => {
                    const t = new Date(s.showDateTime || s.date);
                    return !isNaN(t.getTime()) && t >= startOfToday;
                });

                // 5. Group active shows by theaterId
                const showsByTheater = new Map();

                activeShows.forEach((show) => {
                    const tid = resolveTheaterFromShow(show);
                    if (!tid) return;

                    if (!showsByTheater.has(tid)) {
                        showsByTheater.set(tid, []);
                    }
                    showsByTheater.get(tid).push(show);
                });

                // 6. Build final list — one object per theater
                const finalList = [];

                for (const theater of theatersList) {
                    const tid = String(theater._id);
                    const theaterShows = showsByTheater.get(tid) || [];

                    const movieMap = new Map();

                    theaterShows.forEach((show) => {
                        const m = show.movie;
                        const movieId =
                            m && typeof m === "object"
                                ? String(m._id)
                                : m
                                ? String(m)
                                : null;
                        if (!movieId) return;

                        if (!movieMap.has(movieId)) {
                            movieMap.set(movieId, {
                                movie:
                                    m && typeof m === "object"
                                        ? m
                                        : {
                                              _id: movieId,
                                              title:
                                                  show.movieTitle || "Movie",
                                          },
                                shows: [],
                            });
                        }
                        movieMap.get(movieId).shows.push(show);
                    });

                    const movies = [];
                    for (const [movieId, entry] of movieMap.entries()) {
                        // Prefer the full movie doc from /movie/all
                        // (it contains the ratings array)
                        let movie =
                            movieDocMap.get(movieId) || entry.movie;

                        // Fallback: fetch individually if not in map
                        if (!movie?.title || movie.title === "Movie") {
                            try {
                                const mRes = await axios.get(
                                    `${BACKEND_URL}/movie/${movieId}`
                                );
                                movie =
                                    mRes.data?.movie ||
                                    mRes.data?.data ||
                                    movie;
                            } catch (mErr) {
                                // keep fallback
                            }
                        }

                        // All active showtimes for this movie at this theater
                        const showTimes = entry.shows
                            .map((s) => new Date(s.showDateTime))
                            .filter((d) => !isNaN(d.getTime()))
                            .sort((a, b) => a - b);

                        // Get highest rating info
                        const { highest, count } =
                            getUserRatingInfo(movie);

                        movies.push({
                            ...movie,
                            _id: movieId,
                            _earliest: showTimes[0]?.getTime() || 0,
                            _showDateTimes: showTimes.map((d) =>
                                d.getTime()
                            ),
                            _highestRating: highest,
                            _ratingCount: count,
                            _theaters: [
                                {
                                    _id: theater._id,
                                    name: theater.name || "",
                                    city: theater.city || "",
                                    address: theater.address || "",
                                },
                            ],
                        });
                    }

                    movies.sort((a, b) => a._earliest - b._earliest);

                    finalList.push({
                        ...theater,
                        _movies: movies,
                        _activeShowCount: theaterShows.length,
                    });
                }

                // Only keep theaters that have at least one active movie
                const theatersWithMovies = finalList.filter(
                    (t) => t._movies.length > 0
                );

                // Sort alphabetically by name
                theatersWithMovies.sort((a, b) =>
                    (a.name || "").localeCompare(b.name || "")
                );

                setTheaters(theatersWithMovies);
            } catch (err) {
                console.error("Error loading theaters:", err);
                setError("Unable to load theaters. Please try again.");
                setTheaters([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // =====================================================
    // LOADING
    // =====================================================
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="relative overflow-hidden">
                <BlurCircle top="100px" left="0px" />
                <BlurCircle top="500px" right="0px" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-14">
                    {/* TITLE */}
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            Our <span className="text-primary">Theaters</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-2">
                            {theaters.length}{" "}
                            {theaters.length === 1 ? "theater" : "theaters"}{" "}
                            ·{" "}
                            {theaters.reduce(
                                (sum, t) => sum + t._movies.length,
                                0
                            )}{" "}
                            movies currently playing
                        </p>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* EMPTY */}
                    {theaters.length === 0 && !error && (
                        <div className="text-center py-20 text-gray-500">
                            No theaters are currently showing any movies.
                        </div>
                    )}

                    {/* THEATER LIST */}
                    <div className="space-y-12">
                        {theaters.map((theater) => {
                            // Highest rating across all movies at this theater
                            const theaterTopRating = (() => {
                                const rated = theater._movies.filter(
                                    (m) =>
                                        m._highestRating > 0 &&
                                        m._ratingCount > 0
                                );
                                return rated.length > 0
                                    ? Math.max(
                                          ...rated.map(
                                              (m) => m._highestRating
                                          )
                                      )
                                    : 0;
                            })();

                            return (
                                <div
                                    key={theater._id}
                                    className="border border-gray-800 rounded-2xl bg-gray-900/40 overflow-hidden"
                                >
                                    {/* THEATER HEADER */}
                                    <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="min-w-0">
                                            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                                                {theater.name}
                                            </h2>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin
                                                        size={14}
                                                        className="text-primary"
                                                    />
                                                    {theater.city}
                                                    {theater.address &&
                                                        `, ${theater.address}`}
                                                </span>

                                                {theater.phone && (
                                                    <>
                                                        <span className="text-gray-600">
                                                            •
                                                        </span>
                                                        <span>
                                                            {theater.phone}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                                                {theater._movies.length}{" "}
                                                {theater._movies.length === 1
                                                    ? "movie"
                                                    : "movies"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* MOVIES ROW (using shared MovieCard) */}
                                    <div className="overflow-x-auto no-scrollbar">
                                        <div className="flex gap-6 p-6">
                                            {theater._movies.map((movie) => {
                                                const hasRating =
                                                    movie._highestRating >
                                                        0 &&
                                                    movie._ratingCount >
                                                        0;

                                                const isTopRated =
                                                    hasRating &&
                                                    movie._highestRating ===
                                                        theaterTopRating;

                                                return (
                                                    <div
                                                        key={movie._id}
                                                        className="w-64 flex-shrink-0 relative"
                                                    >
                                                        {/* TOP RATED BADGE */}
                                                        {isTopRated && (
                                                            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                                                <Trophy
                                                                    size={
                                                                        12
                                                                    }
                                                                />
                                                                Top Rated
                                                            </div>
                                                        )}

                                                        <MovieCard
                                                            movie={movie}
                                                            theaters={
                                                                movie._theaters
                                                            }
                                                            showDateTimes={
                                                                movie._showDateTimes
                                                            }
                                                        />

                                                        {/* HIGHEST RATING LINE — only if rated */}
                                                        {hasRating && (
                                                            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                                                <Star
                                                                    size={
                                                                        12
                                                                    }
                                                                    className="text-yellow-400 fill-yellow-400"
                                                                />
                                                                <span className="text-white font-medium">
                                                                    {
                                                                        movie._highestRating
                                                                    }
                                                                    /5
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    (
                                                                    {
                                                                        movie._ratingCount
                                                                    }{" "}
                                                                    {movie._ratingCount ===
                                                                    1
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Theaters;