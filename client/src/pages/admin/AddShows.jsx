import React, { useState, useEffect } from "react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { dummyShowsData } from "../../assets/assets";
import { StarIcon, CheckIcon } from "lucide-react";
import { kConverter } from "../../lib/kConverter";

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || "Rs.";

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData || []);
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      <p className="mt-10 text-lg font-medium">
        Now Playing Movies
      </p>

      {/* GRID WRAPPER */}
      <div className="overflow-x-auto pb-6">
        <div className="flex flex-wrap gap-5 mt-4">

          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id || movie._id}
              onClick={() => setSelectedMovie(movie.id || movie._id)}
              className="w-40 cursor-pointer group"
            >

              {/* IMAGE CONTAINER */}
              <div className="relative w-40 h-60 overflow-hidden rounded-lg shadow-md">

                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition duration-300"
                />

                {/* STAR OVERLAY ONLY ON IMAGE */}
                            <div className="absolute bottom-0 left-2 right-2 bg-black/70 px-2 py-1 rounded-md text-xs flex justify-between items-center">
                <p className="flex items-center gap-1 text-gray-200">
                    <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                    {movie.vote_average?.toFixed(1)}
                </p>

                <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Votes
                </p>
                </div>

                {/* SELECTED ICON */}
                {selectedMovie === (movie.id || movie._id) && (
                  <div className="absolute top-2 right-2 bg-primary h-6 w-6 flex items-center justify-center rounded">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}

              </div>

              {/* TITLE + DATE BELOW IMAGE (FIXED SPACE) */}
              <div className="mt-2 px-1">
                <p className="font-medium text-sm truncate">
                  {movie.title}
                </p>
                <p className="text-xs text-gray-400">
                  {movie.release_date}
                </p>
              </div>

            </div>
          ))}

        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;