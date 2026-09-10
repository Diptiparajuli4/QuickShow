import React from "react";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";
import { Star, Clock } from "lucide-react";

// =====================================================
// FORMAT one show datetime -> "Sep 21 09:45 AM"
// =====================================================
const formatShowDateTime = (dt) => {
    if (!dt) return null;
    try {
        const d = new Date(dt);
        if (isNaN(d.getTime())) return null;

        const datePart = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
        const timePart = d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return `${datePart} ${timePart}`;
    } catch {
        return null;
    }
};

// =====================================================
// NORMALIZE any input shape into [{ label, ts }]
// =====================================================
const buildShowEntries = (showDateTimes, showDateTime) => {
    const entries = [];

    const pushRaw = (value) => {
        const d = new Date(value);
        const ts = isNaN(d.getTime()) ? Infinity : d.getTime();
        const label = formatShowDateTime(value);
        if (label) entries.push({ label, ts });
    };

    if (Array.isArray(showDateTimes) && showDateTimes.length > 0) {
        showDateTimes.forEach((item) => {
            if (typeof item === "string" || typeof item === "number") {
                pushRaw(item);
                return;
            }
            if (item && typeof item === "object") {
                if (item.raw) {
                    pushRaw(item.raw);
                    return;
                }
                if (item.date && item.time) {
                    const d = new Date(`${item.date} ${item.time}`);
                    const ts = isNaN(d.getTime())
                        ? Infinity
                        : d.getTime();
                    entries.push({
                        label: `${item.date} ${item.time}`,
                        ts,
                    });
                    return;
                }
                if (item.date) {
                    entries.push({ label: item.date, ts: Infinity });
                }
            }
        });
    } else if (showDateTime) {
        pushRaw(showDateTime);
    }

    return entries;
};

// =====================================================
// Pick ONLY the nearest (soonest) upcoming show
// =====================================================
const getNearestShow = (showDateTimes, showDateTime) => {
    const entries = buildShowEntries(showDateTimes, showDateTime);
    if (entries.length === 0) return null;

    const now = Date.now();

    const upcoming = entries.filter((e) => e.ts >= now);
    if (upcoming.length > 0) {
        upcoming.sort((a, b) => a.ts - b.ts);
        return upcoming[0];
    }

    const sorted = [...entries].sort((a, b) => a.ts - b.ts);
    return sorted[0];
};

// =====================================================
// NORMALIZE theaters into a unique array of { name, city, address }
// =====================================================
const buildTheaterList = (theaters, theater) => {
    const source = Array.isArray(theaters)
        ? theaters
        : theater
        ? [theater]
        : [];

    const seen = new Set();
    const list = [];

    source.forEach((t) => {
        if (!t) return;
        const name = t.name || t.theaterName || "";
        const city = t.city || t.theaterCity || "";
        const address = t.address || t.theaterAddress || "";

        if (!name) return;

        const key = `${name}|${city}`;
        if (seen.has(key)) return;
        seen.add(key);

        list.push({ name, city, address });
    });

    return list;
};

const MovieCard = ({
    movie,
    badge,
    theater,
    theaters,
    showDateTime,
    showDateTimes,
}) => {
    const navigate = useNavigate();

    const movieId = String(movie?._id || movie?.id || "");

    const nearestShow = getNearestShow(showDateTimes, showDateTime);
    const theaterList = buildTheaterList(theaters, theater);

    // =====================================================
    // VIEW MOVIE DETAILS
    // =====================================================
    const handleViewDetails = () => {
        if (!movieId) {
            console.error("Movie ID is missing:", movie);
            alert("Movie ID not found.");
            return;
        }

        navigate(`/movies/${movieId}`);
        window.scrollTo(0, 0);
    };

    return (
        <div
            className="
                relative
                flex
                flex-col
                bg-gray-800
                rounded-2xl
                overflow-hidden
                hover:-translate-y-1
                transition
                duration-300
                w-full
                shadow-lg
            "
            data-theaters={theaterList.length}
        >
            {/* BADGE */}
            {badge && (
                <div className="absolute top-3 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-r-md shadow-md z-10">
                    {badge}
                </div>
            )}

            {/* ================================================= */}
            {/* POSTER — FULLY VISIBLE (no cropping)               */}
            {/* ================================================= */}
            <div className="w-full h-80 bg-gray-950 relative overflow-hidden flex items-center justify-center">
                <img
                    src={
                        movie?.poster_path
                            ? movie.poster_path.startsWith("http")
                                ? movie.poster_path
                                : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "/fallback.jpg"
                    }
                    alt={movie?.title || "Movie"}
                    className="
                        max-w-full
                        max-h-full
                        w-auto
                        h-auto
                        object-contain
                        object-center
                    "
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/fallback.jpg";
                    }}
                />
            </div>

            {/* INFO */}
            <div className="p-4 flex flex-col flex-grow">

                {/* TITLE */}
                <h3 className="text-lg font-semibold text-white truncate">
                    {movie?.title || movie?.name || "Untitled Movie"}
                </h3>

                {/* META */}
                <p className="text-sm text-gray-400 mt-2">
                    {movie?.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "N/A"}
                    {" • "}
                    {movie?.genres
                        ?.slice(0, 2)
                        .map((genre) => genre?.name)
                        .filter(Boolean)
                        .join(" | ")}
                    {" • "}
                    {movie?.runtime ? timeFormat(movie.runtime) : "N/A"}
                </p>

                {/* NEAREST SHOW */}
                {nearestShow && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1.5">
                            Next Show Time
                        </p>
                        <div className="flex items-center gap-1.5 text-xs bg-gray-700 px-2.5 py-1.5 rounded w-fit">
                            <Clock size={12} className="text-primary" />
                            <span className="text-white font-medium">
                                {nearestShow.label}
                            </span>
                        </div>
                    </div>
                )}

                {/* BOTTOM */}
                <div className="flex items-center justify-between mt-4">
                    <button
                        type="button"
                        onClick={handleViewDetails}
                        disabled={!movieId}
                        className={`
                            px-4
                            py-2
                            text-xs
                            transition
                            rounded-full
                            font-medium
                            active:scale-95
                            ${
                                movieId
                                    ? `bg-primary hover:bg-primary-dull cursor-pointer`
                                    : `bg-gray-600 cursor-not-allowed`
                            }
                        `}
                    >
                        View Movies Details
                    </button>

                    <p className="flex items-center gap-1 text-sm text-gray-300">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        {movie?.vote_average
                            ? Number(movie.vote_average).toFixed(1)
                            : "N/A"}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default MovieCard;