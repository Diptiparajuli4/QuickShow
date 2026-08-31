
import React, { useEffect, useState } from "react";

import {
  dummyShowsData,
} from "../assets/assets";

import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";

const Favorite = () => {

  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH FAVORITE MOVIES
  // ==========================================

  const fetchFavoriteMovies = () => {

    try {

      // Get favorite movie IDs
      const savedFavorites = JSON.parse(
        localStorage.getItem(
          "quickshow_favorites"
        ) || "[]"
      );

      console.log(
        "Saved Favorite IDs:",
        savedFavorites
      );

      // ==========================================
      // FIND MOVIES USING SAVED IDS
      // ==========================================

      const movies = savedFavorites
        .map((favoriteId) => {

          return dummyShowsData.find(
            (movie) =>
              String(movie._id) ===
                String(favoriteId) ||
              String(movie.id) ===
                String(favoriteId)
          );

        })
        .filter(Boolean);

      console.log(
        "Favorite Movies:",
        movies
      );

      setFavoriteMovies(movies);

    } catch (error) {

      console.error(
        "Error loading favorite movies:",
        error
      );

      setFavoriteMovies([]);

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // LOAD FAVORITES WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    fetchFavoriteMovies();

  }, []);

  // ==========================================
  // LISTEN FOR FAVORITE CHANGES
  // ==========================================

  useEffect(() => {

    const handleFavoritesUpdated = () => {

      fetchFavoriteMovies();

    };

    window.addEventListener(
      "favoritesUpdated",
      handleFavoritesUpdated
    );

    return () => {

      window.removeEventListener(
        "favoritesUpdated",
        handleFavoritesUpdated
      );

    };

  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="flex items-center justify-center h-screen">

        <h1 className="text-xl">
          Loading favorites...
        </h1>

      </div>
    );

  }

  // ==========================================
  // NO FAVORITE MOVIES
  // ==========================================

  if (favoriteMovies.length === 0) {

    return (
      <div className="flex flex-col items-center justify-center h-screen">

        <h1 className="text-3xl font-bold text-center">
          No favorite movies
        </h1>

        <p className="text-gray-400 mt-2">
          Movies you favorite will appear here.
        </p>

      </div>
    );

  }

  // ==========================================
  // FAVORITE MOVIES
  // ==========================================

  return (

    <div
      className="relative my-40 mb-60 px-6 md:px-16 lg:px-40
      xl:px-44 overflow-hidden min-h-[480vh]"
    >

      {/* BACKGROUND CIRCLES */}

      <BlurCircle
        top="150px"
        left="0px"
      />

      <BlurCircle
        bottom="50px"
        right="50px"
      />

      {/* TITLE */}

      <h1 className="text-lg font-medium my-4">
        Your Favorite Movies
      </h1>

      {/* MOVIE GRID */}

      <div
        className="grid grid-cols-1 sm:grid-cols-2
        lg:grid-cols-4 gap-8 mt-8"
      >

        {favoriteMovies.map((movie) => (

          <MovieCard
            movie={movie}
            key={movie._id || movie.id}
          />

        ))}

      </div>

    </div>

  );
};

export default Favorite;
