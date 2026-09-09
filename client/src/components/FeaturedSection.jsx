import { ArrowRight, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";

const FeaturedSection = () => {
  const navigate = useNavigate();

  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("nowShowing"); // "nowShowing" | "upcoming"

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

        // 1. NOW SHOWING: Exactly like it used to work before
        const movies = data.shows
          .map((show) => show.movie)
          .filter(Boolean);

        const uniqueMovies = movies.filter(
          (movie, index, self) =>
            index ===
            self.findIndex(
              (item) =>
                String(item._id) ===
                String(movie._id)
            )
        );

        const nowShowingList = [...uniqueMovies];
        nowShowingList.reverse(); // Latest added first
        setFeaturedMovies(nowShowingList.slice(0, 4));

        // 2. UPCOMING MOVIES: Filter future shows, calculate days left, and sort ascending by date
        const upcomingShows = data.shows.filter((show) => {
          const showTime = new Date(show.showDateTime || show.date || currentTime);
          return showTime > currentTime;
        });

        const upcomingMapped = upcomingShows
          .map((show) => {
            const showTime = new Date(show.showDateTime || show.date || currentTime);
            const diffTime = showTime - currentTime;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return {
              ...show.movie,
              showTime: showTime.getTime(),
              daysLeft: daysLeft > 0 ? daysLeft : 1,
            };
          })
          .filter((movie) => movie && movie._id);

        // Sort ascending by date (soonest upcoming first)
        upcomingMapped.sort((a, b) => a.showTime - b.showTime);

        // Remove duplicate movies keeping the earliest upcoming date
        const uniqueUpcoming = [];
        const seenIds = new Set();
        for (const movie of upcomingMapped) {
          if (!seenIds.has(String(movie._id))) {
            seenIds.add(String(movie._id));
            uniqueUpcoming.push(movie);
          }
        }

        setUpcomingMovies(uniqueUpcoming.slice(0, 4));

      } catch (error) {
        console.error("Error loading featured movies:", error);
        setFeaturedMovies([]);
        setUpcomingMovies([]);
      }
    };

    fetchFeaturedMovies();
  }, []);

  // Determine which movies to display based on the active tab
  const displayedMovies = activeTab === "nowShowing" ? featuredMovies : upcomingMovies;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 pt-0 pb-12 overflow-hidden">

      {/* ========================================= */}
      {/* SECTION HEADER WITH TABS */}
      {/* ========================================= */}

      <div className="relative flex items-center justify-between pt-16 pb-6">

        <BlurCircle
          top="0"
          right="-80px"
        />

        {/* Tabs for Now Showing & Upcoming Movies */}
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

        {/* View All button only shows when Now Showing tab is active */}
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

      {/* ========================================= */}
      {/* MOVIES */}
      {/* ========================================= */}

      {displayedMovies.length > 0 ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">

          {displayedMovies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
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
            {activeTab === "nowShowing" ? "No shows available" : "No upcoming movies available"}
          </p>

        </div>

      )}

      {/* ========================================= */}
      {/* SHOW MORE */}
      {/* ========================================= */}

      {displayedMovies.length > 0 && (

        <div className="flex justify-center mt-8 mb-0">

          <button
            onClick={() => {
              navigate(activeTab === "nowShowing" ? "/movies" : "/upcoming-movies");
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