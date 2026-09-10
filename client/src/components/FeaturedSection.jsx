import { ArrowRight, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";

// =====================================================
// HELPER: resolve theater info from a show
// =====================================================
const resolveTheater = (show) => {
  if (show.theaterId && typeof show.theaterId === "object") {
    return {
      name: show.theaterId.name || "",
      city: show.theaterId.city || "",
      address: show.theaterId.address || "",
    };
  }
  if (show.theaterName) {
    return {
      name: show.theaterName,
      city: show.theaterCity || "",
      address: show.theaterAddress || "",
    };
  }
  if (show.theater && typeof show.theater === "object") {
    return {
      name: show.theater.name || "",
      city: show.theater.city || "",
      address: show.theater.address || "",
    };
  }
  return null;
};

const NOW_SHOWING_LIMIT = 4;
const UPCOMING_LIMIT = 10;

const FeaturedSection = () => {
  const navigate = useNavigate();

  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("nowShowing");

  // ============================================
  // LOAD SHOWS FROM DATABASE
  // ============================================
  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/show/all");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch shows");
        }

        const currentTime = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const shows = Array.isArray(data.shows) ? data.shows : [];

        // ============================================
        // 1. NOW SHOWING — active shows only
        // ============================================
        const activeShows = shows.filter((show) => {
          const t = new Date(show.showDateTime || show.date);
          if (isNaN(t.getTime())) return false;
          return t >= startOfToday;
        });

        const nowShowingMap = new Map();

        activeShows.forEach((show) => {
          const movie = show.movie;
          if (!movie) return;

          if (typeof movie === "object" && movie._id) {
            const id = String(movie._id);
            const theater = resolveTheater(show);
            const t = new Date(show.showDateTime || show.date);

            if (!nowShowingMap.has(id)) {
              nowShowingMap.set(id, {
                ...movie,
                _theater: theater,
                _showDateTime: t.getTime(),
              });
            } else {
              const existing = nowShowingMap.get(id);
              if (t.getTime() < existing._showDateTime) {
                nowShowingMap.set(id, {
                  ...existing,
                  _theater: theater,
                  _showDateTime: t.getTime(),
                });
              }
            }
          }
        });

        const nowShowingList = Array.from(nowShowingMap.values());
        nowShowingList.reverse();
        setFeaturedMovies(nowShowingList.slice(0, NOW_SHOWING_LIMIT));

        // ============================================
        // 2. UPCOMING — future shows only
        // ============================================
        const upcomingShows = shows.filter((show) => {
          const t = new Date(show.showDateTime || show.date || currentTime);
          return t > currentTime;
        });

        const upcomingMapped = upcomingShows
          .map((show) => {
            const showTime = new Date(
              show.showDateTime || show.date || currentTime
            );
            const diffTime = showTime - currentTime;
            const daysLeft = Math.ceil(
              diffTime / (1000 * 60 * 60 * 24)
            );
            const theater = resolveTheater(show);

            const movieObj =
              typeof show.movie === "object" && show.movie
                ? show.movie
                : {
                    _id: show.movie,
                    title: show.movieTitle || "Movie",
                  };

            return {
              ...movieObj,
              showTime: showTime.getTime(),
              daysLeft: daysLeft > 0 ? daysLeft : 1,
              _theater: theater,
            };
          })
          .filter((movie) => movie && movie._id);

        upcomingMapped.sort((a, b) => a.showTime - b.showTime);

        const uniqueUpcoming = [];
        const seenIds = new Set();
        for (const movie of upcomingMapped) {
          if (!seenIds.has(String(movie._id))) {
            seenIds.add(String(movie._id));
            uniqueUpcoming.push(movie);
          }
        }

        setUpcomingMovies(uniqueUpcoming.slice(0, UPCOMING_LIMIT));
      } catch (error) {
        console.error("Error loading featured movies:", error);
        setFeaturedMovies([]);
        setUpcomingMovies([]);
      }
    };

    fetchFeaturedMovies();
  }, []);

  const displayedMovies =
    activeTab === "nowShowing" ? featuredMovies : upcomingMovies;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 pt-0 pb-12 overflow-hidden">

      {/* SECTION HEADER */}
      <div className="relative flex items-center justify-between pt-16 pb-6">
        <BlurCircle top="0" right="-80px" />

        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab("nowShowing")}
            className={`flex items-center gap-2 text-xl font-bold cursor-pointer transition ${
              activeTab === "nowShowing"
                ? "text-white opacity-100"
                : "text-gray-400 opacity-60 hover:opacity-100"
            }`}
          >
            🎬 Now Showing
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex items-center gap-2 text-xl font-bold cursor-pointer transition ${
              activeTab === "upcoming"
                ? "text-white opacity-100"
                : "text-gray-400 opacity-60 hover:opacity-100"
            }`}
          >
            <Clock className="w-5 h-5" /> Upcoming Movies
          </button>
        </div>

        {activeTab === "nowShowing" && (
          <button
            onClick={() => navigate("/movies")}
            className="group flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
          >
            View All
            <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* MOVIES */}
      {displayedMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {displayedMovies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              theater={movie._theater}
              showDateTime={
                activeTab === "nowShowing"
                  ? movie._showDateTime
                  : movie.showTime
              }
              badge={
                activeTab === "upcoming" && movie.daysLeft
                  ? `${movie.daysLeft} days left`
                  : null
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500">
            {activeTab === "nowShowing"
              ? "No shows available"
              : "No upcoming movies available"}
          </p>
        </div>
      )}

      {/* SHOW MORE */}
      {displayedMovies.length > 0 && (
        <div className="flex justify-center mt-8 mb-0">
          <button
            onClick={() => {
              navigate(
                activeTab === "nowShowing"
                  ? "/movies"
                  : "/movies"
              );
              window.scrollTo(0, 0);
            }}
            className="px-10 py-3 text-sm bg-primary 
            hover:bg-primary-dull transition rounded-md 
            font-medium cursor-pointer"
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedSection;