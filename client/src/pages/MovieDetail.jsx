import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  dummyDateTimeData,
  dummyShowsData,
  dummyTrailers,
} from "../assets/assets";

import BlurCircle from "../components/BlurCircle";
import { PlayCircleIcon, StarIcon, Heart } from "lucide-react";
import DateSelect from "../components/DateSelect";
import timeFormat from "../lib/timeFormat";
import MovieCard from "../components/MovieCard";

const MovieDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [show, setShow] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const getShow = async () => {
    const movie = dummyShowsData.find((m) => m._id === id);

    if (!movie) return;

    const trailer = dummyTrailers.find(
      (t) => t.movieId === movie._id
    );

    setShow({
      movie,
      dateTime: dummyDateTimeData,
      trailer,
    });
  };

  useEffect(() => {
    getShow();
  }, [id]);

  if (!show) return <div>Loading...</div>;

  const videoUrl = show.trailer?.videoUrl;

  const embedUrl = videoUrl
    ? videoUrl.includes("watch?v=")
      ? videoUrl.replace("watch?v=", "embed/")
      : videoUrl.includes("youtu.be/")
      ? videoUrl.replace("youtu.be/", "youtube.com/embed/")
      : videoUrl
    : null;

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">

      {/* TOP SECTION */}
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={show.movie.poster_path}
          alt={show.movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />

          <p className="text-primary">English</p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          <p>
            {timeFormat(show.movie.runtime)} •{" "}
            {show.movie.genres.map((g) => g.name).join(", ")} •{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            {show.trailer?.videoUrl && (
              <button
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95"
              >
                <PlayCircleIcon className="w-5 h-5" />
                Watch Trailer
              </button>
            )}

            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>

            <button className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* CAST */}
      <p className="text-lg font-medium mt-20">Your Favorite Cast</p>

      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              <img
                src={cast.profile_path}
                alt={cast.name}
                className="rounded-full h-20 w-20 object-cover"
              />
              <p className="font-medium text-xs mt-3">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DATE SELECT */}
      <DateSelect dateTime={show.dateTime} id={id} />

      {/* RECOMMENDATIONS (FIXED LAYOUT) */}
      <p className="text-lg font-medium mt-20 mb-8">
        You May Also Like
      </p>

      {/* ✅ FIX: GRID INSTEAD OF FLEX */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
        {dummyShowsData.slice(0, 4).map((movie, index) => (
          <div key={index} className="w-full max-w-[220px]">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {/* BUTTON */}
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

      {/* TRAILER MODAL */}
      {showTrailer && embedUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-[90%] md:w-[900px] aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
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