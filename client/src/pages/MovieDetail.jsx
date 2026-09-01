
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  dummyDateTimeData,
  dummyShowsData,
  dummyTrailers,
} from "../assets/assets";

import BlurCircle from "../components/BlurCircle";
import {
  PlayCircleIcon,
  StarIcon,
  Heart,
} from "lucide-react";

import DateSelect from "../components/DateSelect";
import timeFormat from "../lib/timeFormat";
import MovieCard from "../components/MovieCard";

const MovieDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [show, setShow] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // ============================================
  // FAVORITE STATE
  // ============================================

  const [isFavorite, setIsFavorite] = useState(false);

  // ============================================
  // GET SHOW
  // ============================================

  const getShow = () => {
    try {
      // Get shows added by admin
      const savedShows = JSON.parse(
        localStorage.getItem("quickshow_shows") || "[]"
      );

      console.log("Admin Added Shows:", savedShows);

      // ============================================
      // FIND ADMIN SHOW USING URL ID
      // ============================================

      const adminShow = savedShows.find(
        (savedShow) =>
          String(savedShow.movieId) === String(id)
      );

      if (!adminShow) {
        console.log(
          "Admin show not found for movie ID:",
          id
        );

        setShow(null);
        return;
      }

      // ============================================
      // FIND MOVIE FROM DUMMY DATA
      // ============================================

      const movie = dummyShowsData.find(
        (movie) =>
          String(movie.id) === String(adminShow.movieId) ||
          String(movie._id) === String(adminShow.movieId)
      );

      if (!movie) {
        console.log(
          "Movie not found:",
          adminShow.movieId
        );

        setShow(null);
        return;
      }

      // ============================================
      // FIND TRAILER
      // ============================================

      const trailer = dummyTrailers.find(
        (trailer) =>
          String(trailer.movieId) ===
          String(movie._id)
      );

      // ============================================
      // SET SHOW
      // ============================================

      setShow({
        movie: movie,
        showData: adminShow,
        dateTime: adminShow.dateTimes || dummyDateTimeData,
        trailer: trailer,
      });

      // ============================================
      // CHECK FAVORITE
      // ============================================

      const favorites = JSON.parse(
        localStorage.getItem(
          "quickshow_favorites"
        ) || "[]"
      );

      const movieId = String(
        movie._id || movie.id
      );

      setIsFavorite(
        favorites.some(
          (favoriteId) =>
            String(favoriteId) === movieId
        )
      );

    } catch (error) {
      console.error(
        "Error loading movie:",
        error
      );

      setShow(null);
    }
  };

  // ============================================
  // LOAD SHOW
  // ============================================

  useEffect(() => {
    getShow();
  }, [id]);

  // ============================================
  // TOGGLE FAVORITE
  // ============================================

  const toggleFavorite = () => {
    if (!show?.movie) return;

    const movieId = String(
      show.movie._id || show.movie.id
    );

    const favorites = JSON.parse(
      localStorage.getItem(
        "quickshow_favorites"
      ) || "[]"
    );

    const alreadyFavorite = favorites.some(
      (favoriteId) =>
        String(favoriteId) === movieId
    );

    let updatedFavorites;

    if (alreadyFavorite) {
      // Remove favorite
      updatedFavorites = favorites.filter(
        (favoriteId) =>
          String(favoriteId) !== movieId
      );

      setIsFavorite(false);
    } else {
      // Add favorite
      updatedFavorites = [
        ...favorites,
        movieId,
      ];

      setIsFavorite(true);
    }

    localStorage.setItem(
      "quickshow_favorites",
      JSON.stringify(updatedFavorites)
    );

    // Tell Navbar that favorites changed
    window.dispatchEvent(
      new Event("favoritesUpdated")
    );
  };

  // ============================================
  // LOADING
  // ============================================

  if (!show) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-xl">
          Movie not available
        </h1>
      </div>
    );
  }

  // ============================================
  // TRAILER URL
  // ============================================

  const videoUrl = show.trailer?.videoUrl;

  const embedUrl = videoUrl
    ? videoUrl.includes("watch?v=")
      ? videoUrl.replace(
          "watch?v=",
          "embed/"
        )
      : videoUrl.includes("youtu.be/")
      ? videoUrl.replace(
          "youtu.be/",
          "youtube.com/embed/"
        )
      : videoUrl
    : null;

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">

      {/* ========================================= */}
      {/* TOP SECTION */}
      {/* ========================================= */}

      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

        {/* MOVIE POSTER */}

        <img
          src={show.movie.poster_path}
          alt={show.movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        {/* MOVIE INFORMATION */}

        <div className="relative flex flex-col gap-3">

          <BlurCircle
            top="-100px"
            left="-100px"
          />

          <p className="text-primary">
            English
          </p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          {/* RATING */}

          <div className="flex items-center gap-2 text-gray-300">

            <StarIcon className="w-5 h-5 text-primary fill-primary" />

            {show.movie.vote_average
              ? show.movie.vote_average.toFixed(1)
              : "N/A"}

            {" "}User Rating
          </div>

          {/* OVERVIEW */}

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          {/* MOVIE DETAILS */}

          <p>
            {timeFormat(show.movie.runtime)} •{" "}
            {show.movie.genres
              ?.map((g) => g.name)
              .join(", ")}{" "}
            •{" "}
            {show.movie.release_date
              ?.split("-")[0]}
          </p>

          {/* ================================= */}
          {/* BUTTONS */}
          {/* ================================= */}

          <div className="flex items-center flex-wrap gap-4 mt-4">

            {/* WATCH TRAILER */}

            {show.trailer?.videoUrl && (
              <button
                onClick={() =>
                  setShowTrailer(true)
                }
                className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95"
              >
                <PlayCircleIcon className="w-5 h-5" />

                Watch Trailer
              </button>
            )}

            {/* BUY TICKETS */}

            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>

            {/* FAVORITE */}

            <button
              onClick={toggleFavorite}
              className={`p-2.5 rounded-full transition cursor-pointer active:scale-95 ${
                isFavorite
                  ? "bg-primary text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              <Heart
                className="w-5 h-5"
                fill={
                  isFavorite
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* CAST */}
      {/* ========================================= */}

      <p className="text-lg font-medium mt-20">
        Your Favorite Cast
      </p>

      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">

        <div className="flex items-center gap-4 w-max px-4">

          {show.movie.casts
            ?.slice(0, 12)
            .map((cast, index) => (

              <div
                key={index}
                className="flex flex-col items-center text-center"
              >

                <img
                  src={cast.profile_path}
                  alt={cast.name}
                  className="rounded-full h-20 w-20 object-cover"
                />

                <p className="font-medium text-xs mt-3">
                  {cast.name}
                </p>

              </div>

            ))}

        </div>
      </div>

      {/* ========================================= */}
      {/* DATE SELECT */}
      {/* ========================================= */}

      <div id="dateSelect">

        <DateSelect
          dateTime={show.dateTime}
          id={id}
        />

      </div>

      {/* ========================================= */}
      {/* RECOMMENDATIONS */}
      {/* ========================================= */}

      <p className="text-lg font-medium mt-20 mb-8">
        You May Also Like
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">

        {dummyShowsData
          .filter(
            (movie) =>
              String(movie._id) !==
              String(show.movie._id)
          )
          .slice(0, 4)
          .map((movie) => (

            <div
              key={movie._id}
              className="w-full max-w-[220px]"
            >

              <MovieCard
                movie={movie}
              />

            </div>

          ))}

      </div>

      {/* ========================================= */}
      {/* SHOW MORE */}
      {/* ========================================= */}

      <div className="flex justify-center mt-20">

        <button
          onClick={() => {
            navigate("/movies");
            window.scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show More
        </button>

      </div>

      {/* ========================================= */}
      {/* TRAILER MODAL */}
      {/* ========================================= */}

      {showTrailer && embedUrl && (

        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() =>
            setShowTrailer(false)
          }
        >

          <div
            className="relative w-[90%] md:w-[900px] aspect-video"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              onClick={() =>
                setShowTrailer(false)
              }
              className="absolute -top-12 right-0 text-white text-3xl"
            >
              ×
            </button>

            <iframe
              src={embedUrl}
              title={show.movie.title}
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
