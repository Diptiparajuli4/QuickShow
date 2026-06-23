import React, { useState, useEffect } from "react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { dummyShowsData } from "../../assets/assets";
import { StarIcon, CheckIcon, Trash2 } from "lucide-react";
import { kConverter } from "../../lib/kConverter";

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || "Rs.";

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showPrice, setShowPrice] = useState("");
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [dateTimeSelection, setDateTimeSelection] = useState({});

  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData || []);
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;

    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      return {
        ...prev,
        [date]: [...times, time],
      };
    });

    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = (prev[date] || []).filter((t) => t !== time);

      if (filteredTimes.length === 0) {
        const { [date]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>

      {/* MOVIES GRID */}
      <div className="overflow-x-auto pb-6">
        <div className="flex flex-wrap gap-5 mt-4">

          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id || movie._id}
              onClick={() => setSelectedMovie(movie.id || movie._id)}
              className="w-40 cursor-pointer group"
            >
              <div className="relative w-40 h-60 overflow-hidden rounded-lg shadow-md">

                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition duration-300"
                />

                {/* Rating */}
                <div className="absolute bottom-0 left-2 right-2 bg-black/70 px-2 py-1 rounded-md text-xs flex justify-between items-center">
                  <p className="flex items-center gap-1 text-gray-200">
                    <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                    {movie.vote_average?.toFixed(1)}
                  </p>

                  <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Votes
                  </p>
                </div>

                {/* Selected */}
                {selectedMovie === (movie.id || movie._id) && (
                  <div className="absolute top-2 right-2 bg-primary h-6 w-6 flex items-center justify-center rounded">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="mt-2 px-1">
                <p className="font-medium text-sm truncate">{movie.title}</p>
                <p className="text-xs text-gray-400">{movie.release_date}</p>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* PRICE */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">
          Show Price
        </label>

        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>

          <input
            type="number"
            min={0}
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            className="outline-none"
            placeholder="Enter price"
          />
        </div>
      </div>

      {/* DATE TIME */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Select Show Date & Time
        </label>

        <input
          type="datetime-local"
          value={dateTimeInput}
          onChange={(e) => setDateTimeInput(e.target.value)}
          className="outline-none border p-2 rounded-md"
        />

        <button
          onClick={handleDateTimeAdd}
          className="ml-3 bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary"
        >
          Add Time
        </button>
      </div>

      {/* SELECTED TIMES */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="font-medium mb-2">Selected Date-Time</h2>

          <div className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <div key={date}>
                <p className="font-medium">{date}</p>

                <div className="flex flex-wrap gap-2 mt-1">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded text-sm"
                    >
                      <span>{time}</span>

                      <Trash2
                        onClick={() => handleRemoveTime(date, time)}
                        size={14}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer">
        Add Show
      </button>
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;