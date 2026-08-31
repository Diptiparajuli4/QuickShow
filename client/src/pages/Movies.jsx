
import React, { useEffect, useState } from "react";
import { dummyShowsData } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD MOVIES FROM ADMIN-ADDED SHOWS
  // ============================================

  const fetchMovies = () => {
    try {
      // Get shows added by admin
      const savedShows = JSON.parse(
        localStorage.getItem("quickshow_shows") || "[]"
      );

      console.log("Saved Shows:", savedShows);

      // ============================================
      // CREATE MOVIES LIST
      // ============================================

      const adminMovies = [];

      savedShows.forEach((show) => {
        // Find movie from dummyShowsData
        const movie = dummyShowsData.find(
          (movie) =>
            String(movie.id) === String(show.movieId) ||
            String(movie._id) === String(show.movieId)
        );

        // If movie is not found, don't add it
        if (!movie) {
          console.log(
            "Movie not found for movieId:",
            show.movieId
          );

          return;
        }

        adminMovies.push(movie);
      });

      // ============================================
      // REMOVE DUPLICATE MOVIES
      // ============================================

      const uniqueMovies = adminMovies.filter(
        (movie, index, self) =>
          index ===
          self.findIndex(
            (item) =>
              String(item.id || item._id) ===
              String(movie.id || movie._id)
          )
      );

      // ============================================
      // LATEST ADDED MOVIE FIRST
      // ============================================

      uniqueMovies.reverse();

      console.log("Movies to Display:", uniqueMovies);

      setMovies(uniqueMovies);
    } catch (error) {
      console.error(
        "Error loading movies:",
        error
      );

      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD DATA WHEN PAGE OPENS
  // ============================================

  useEffect(() => {
    fetchMovies();
  }, []);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-xl">
          Loading movies...
        </h1>
      </div>
    );
  }

  // ============================================
  // NO MOVIES
  // ============================================

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-center">
          No movies available
        </h1>
      </div>
    );
  }

  // ============================================
  // MOVIES PAGE
  // ============================================

  return (
    <div
      className="relative my-40 mb-60 px-6 md:px-16 lg:px-40
      xl:px-44 overflow-hidden min-h-[480vh]"
    >
      <BlurCircle
        top="150px"
        left="0px"
      />

      <BlurCircle
        bottom="50px"
        right="50px"
      />

      <h1 className="text-lg font-medium my-4">
        Now Showing
      </h1>

      {/* ========================================= */}
      {/* MOVIE GRID */}
      {/* ========================================= */}

      <div
        className="grid grid-cols-1 sm:grid-cols-2
        lg:grid-cols-4 gap-8 mt-8"
      >
        {movies.map((movie) => (
          <MovieCard
            movie={movie}
            key={movie._id || movie.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Movies;
