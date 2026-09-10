import React, { useEffect, useState } from "react";
import axios from "axios";

import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import MovieCard from "../components/MovieCard";

import { Calendar, Clock } from "lucide-react";

// =====================================================
// CONFIG
// =====================================================
const BACKEND_URL = "http://localhost:5000";

// =====================================================
// HELPERS
// =====================================================
const resolveTheaterFromShow = (show) => {
    if (show.theaterId && typeof show.theaterId === "object") {
        return {
            _id: show.theaterId._id || show.theaterId.id,
            name: show.theaterId.name || "",
            city: show.theaterId.city || "",
            address: show.theaterId.address || "",
        };
    }
    if (show.theater && typeof show.theater === "object") {
        return {
            _id: show.theater._id || show.theater.id,
            name: show.theater.name || "",
            city: show.theater.city || "",
            address: show.theater.address || "",
        };
    }
    if (show.theaterName) {
        return {
            _id: show.theaterId || "",
            name: show.theaterName,
            city: show.theaterCity || "",
            address: show.theaterAddress || "",
        };
    }
    return null;
};

// =====================================================
// PAGE
// =====================================================
const Releases = () => {
    const [newReleases, setNewReleases] = useState([]);
    const [comingSoon, setComingSoon] = useState([]);
    const [activeTab, setActiveTab] = useState("new"); // "new" | "soon"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // FETCH SHOWS → GROUP BY MOVIE → SPLIT BY SHOW DATE
    // (Same logic as FeaturedSection)
    // =====================================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await axios.get(`${BACKEND_URL}/show/all`);
                const shows = Array.isArray(res.data?.shows)
                    ? res.data.shows
                    : [];

                const now = new Date();
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                // =========================================
                // Group all shows by movie
                // =========================================
                const movieMap = new Map();

                shows.forEach((show) => {
                    const m = show.movie;
                    if (!m) return;

                    const movieId =
                        typeof m === "object" && m._id
                            ? String(m._id)
                            : typeof m === "string"
                            ? m
                            : null;
                    if (!movieId) return;

                    const movieObj =
                        typeof m === "object"
                            ? m
                            : {
                                  _id: movieId,
                                  title: show.movieTitle || "Movie",
                              };

                    const theater = resolveTheaterFromShow(show);
                    const showTs = new Date(show.showDateTime).getTime();
                    if (isNaN(showTs)) return;

                    if (!movieMap.has(movieId)) {
                        movieMap.set(movieId, {
                            ...movieObj,
                            _id: movieId,
                            _theaters: [],
                            _theaterKeys: new Set(),
                            _showDateTimes: [],
                            _earliest: showTs,
                        });
                    }

                    const entry = movieMap.get(movieId);

                    if (theater?.name) {
                        const key = `${theater.name}|${theater.city || ""}`;
                        if (!entry._theaterKeys.has(key)) {
                            entry._theaterKeys.add(key);
                            entry._theaters.push(theater);
                        }
                    }

                    entry._showDateTimes.push(showTs);
                    if (showTs < entry._earliest) entry._earliest = showTs;
                });

                const allMovies = Array.from(movieMap.values()).map((m) => ({
                    ...m,
                    _theaters: m._theaters.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    ),
                    _showDateTimes: m._showDateTimes.sort((a, b) => a - b),
                }));

                // =========================================
                // NEW RELEASES
                //   = movies with at least one show today onwards
                //   = sorted by soonest show
                // =========================================
                const newList = allMovies
                    .filter((movie) => {
                        const hasUpcoming = movie._showDateTimes.some(
                            (ts) => ts >= startOfToday.getTime()
                        );
                        return hasUpcoming;
                    })
                    .sort((a, b) => a._earliest - b._earliest);

                // =========================================
                // COMING SOON
                //   = movies whose earliest upcoming show is at least 1 day away
                //   = OR movies with strictly future shows (not yet started today)
                //   = with days-left badge
                // =========================================
                const soonList = allMovies
                    .filter((movie) => {
                        // Only consider movies with upcoming shows
                        const futureShows = movie._showDateTimes.filter(
                            (ts) => ts > now.getTime()
                        );
                        if (futureShows.length === 0) return false;

                        // Earliest future show
                        const earliestFuture = futureShows[0];
                        // Days left = ceil of difference
                        const daysLeft = Math.ceil(
                            (earliestFuture - now.getTime()) /
                                (1000 * 60 * 60 * 24)
                        );
                        return daysLeft > 0;
                    })
                    .map((movie) => {
                        const futureShows = movie._showDateTimes.filter(
                            (ts) => ts > now.getTime()
                        );
                        const earliestFuture = futureShows[0];
                        const daysLeft = Math.ceil(
                            (earliestFuture - now.getTime()) /
                                (1000 * 60 * 60 * 24)
                        );
                        return {
                            ...movie,
                            _earliest: earliestFuture,
                            _daysLeft: daysLeft > 0 ? daysLeft : 1,
                        };
                    })
                    .sort((a, b) => a._earliest - b._earliest);

                setNewReleases(newList);
                setComingSoon(soonList);
            } catch (err) {
                console.error("Error loading releases:", err);
                setError("Unable to load releases. Please try again.");
                setNewReleases([]);
                setComingSoon([]);
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

    const displayedMovies =
        activeTab === "new" ? newReleases : comingSoon;

    // =====================================================
    // RENDER
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
                            Movie <span className="text-primary">Releases</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-2">
                            Currently playing and coming soon to cinemas
                        </p>
                    </div>

                    {/* TABS */}
                    <div className="flex items-center gap-8 mb-8 border-b border-gray-800 pb-3">
                        <button
                            onClick={() => setActiveTab("new")}
                            className={`flex items-center gap-2 text-lg font-bold pb-2 transition relative cursor-pointer ${
                                activeTab === "new"
                                    ? "text-white"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <Calendar className="w-5 h-5" />
                            New Releases
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                                {newReleases.length}
                            </span>
                            {activeTab === "new" && (
                                <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("soon")}
                            className={`flex items-center gap-2 text-lg font-bold pb-2 transition relative cursor-pointer ${
                                activeTab === "soon"
                                    ? "text-white"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <Clock className="w-5 h-5" />
                            Coming Soon
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">
                                {comingSoon.length}
                            </span>
                            {activeTab === "soon" && (
                                <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* EMPTY */}
                    {displayedMovies.length === 0 && !error && (
                        <div className="text-center py-20 text-gray-500">
                            {activeTab === "new"
                                ? "No new releases right now."
                                : "No upcoming releases announced yet."}
                        </div>
                    )}

                    {/* MOVIES GRID */}
                    {displayedMovies.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {displayedMovies.map((movie) => (
                                <MovieCard
                                    key={movie._id}
                                    movie={movie}
                                    theaters={movie._theaters}
                                    showDateTimes={movie._showDateTimes}
                                    badge={
                                        activeTab === "soon" &&
                                        movie._daysLeft
                                            ? `${movie._daysLeft} ${
                                                  movie._daysLeft === 1
                                                      ? "day"
                                                      : "days"
                                              } left`
                                            : null
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Releases;