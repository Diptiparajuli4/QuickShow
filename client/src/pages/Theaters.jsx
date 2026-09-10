import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import MovieCard from "../components/MovieCard";

import { MapPin } from "lucide-react";

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

const Theaters = () => {
    const navigate = useNavigate();

    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // FETCH THEATERS + SHOWS
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

                // 3. Keep only active shows (today onwards)
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                const activeShows = shows.filter((s) => {
                    const t = new Date(s.showDateTime || s.date);
                    return !isNaN(t.getTime()) && t >= startOfToday;
                });

                // 4. Group active shows by theaterId
                const showsByTheater = new Map();

                activeShows.forEach((show) => {
                    const tid = resolveTheaterFromShow(show);
                    if (!tid) return;

                    if (!showsByTheater.has(tid)) {
                        showsByTheater.set(tid, []);
                    }
                    showsByTheater.get(tid).push(show);
                });

                // 5. Build final list — one object per theater
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
                        let movie = entry.movie;

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

                        movies.push({
                            ...movie,
                            _id: movieId,
                            _earliest: showTimes[0]?.getTime() || 0,
                            // Passed to MovieCard so it can show "Next Show"
                            _showDateTimes: showTimes.map((d) =>
                                d.getTime()
                            ),
                            // Theater info for this movie (for the card's
                            // internal theater resolver — hidden by design)
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
                        {theaters.map((theater) => (
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
                                                    <span>{theater.phone}</span>
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
                                        {theater._movies.map((movie) => (
                                            <div
                                                key={movie._id}
                                                className="w-64 flex-shrink-0"
                                            >
                                                <MovieCard
                                                    movie={movie}
                                                    theaters={movie._theaters}
                                                    showDateTimes={
                                                        movie._showDateTimes
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Theaters;