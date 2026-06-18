import React, { useState } from "react";
import { dummyTrailers } from "../assets/assets";
import { PlayCircleIcon } from "lucide-react";
import BlurCircle from "./BlurCircle";

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  // Extract YouTube Video ID
  const videoId = currentTrailer.videoUrl.split("v=")[1];

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      
      <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
        Trailers
      </p>

      {/* Main Trailer */}
      <div className="relative mt-6">
        <BlurCircle top="-100px" right="-100px" />

        <div className="max-w-[960px] mx-auto overflow-hidden rounded-xl">
          <iframe
            width="100%"
            height="540"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allowFullScreen
          />
        </div>
      </div>

      {/* Trailer Thumbnails */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
        {dummyTrailers.map((trailer, index) => (
          <div
            key={index}
            onClick={() => setCurrentTrailer(trailer)}
            className={`relative cursor-pointer rounded-lg overflow-hidden ${
              currentTrailer.videoUrl === trailer.videoUrl
                ? "ring-2 ring-red-500"
                : ""
            }`}
          >
            <img
              src={trailer.image}
              alt="Trailer"
              className="w-full h-40 md:h-52 object-cover brightness-75"
            />

            <PlayCircleIcon
              className="absolute inset-0 m-auto w-12 h-12 text-white"
              strokeWidth={1.6}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;