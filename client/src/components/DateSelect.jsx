import React, { useState } from "react";
import BlurCircle from "./BlurCircle";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DateSelect = ({ dateTime = {}, id }) => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);

  // =========================================
  // GET DATES FROM DATABASE DATA
  // =========================================

  const dates = Object.keys(dateTime || {}).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // =========================================
  // BOOK NOW
  // =========================================

  const onBookHandler = () => {
    // User must select a date
    if (!selected) {
      toast("Please select a date");
      return;
    }

    console.log("Selected movie ID:", id);
    console.log("Selected date:", selected);

    // =========================================
    // GO TO BOOKING / SEAT LAYOUT PAGE
    // =========================================

    navigate(`/movies/${id}/${selected}`);

    // Scroll to top of booking page
    window.scrollTo(0, 0);
  };

  // =========================================
  // NO DATES
  // =========================================

  if (dates.length === 0) {
    return (
      <div id="dateSelect" className="pt-30">
        <div className="relative p-8 bg-primary/10 border border-primary/20 rounded-lg">

          <BlurCircle
            top="-100px"
            left="-100px"
          />

          <BlurCircle
            top="100px"
            right="0px"
          />

          <p className="text-lg font-semibold">
            Choose Date
          </p>

          <p className="text-gray-400 mt-4">
            No shows are available for this movie.
          </p>

        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div id="dateSelect" className="pt-30">

      <div
        className="
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-10
          relative
          p-8
          bg-primary/10
          border
          border-primary/20
          rounded-lg
        "
      >

        <BlurCircle
          top="-100px"
          left="-100px"
        />

        <BlurCircle
          top="100px"
          right="0px"
        />

        {/* ================================= */}
        {/* DATE SECTION */}
        {/* ================================= */}

        <div>

          <p className="text-lg font-semibold">
            Choose Date
          </p>

          <div className="flex items-center gap-6 text-sm mt-5">

            {/* LEFT ARROW */}

            <ChevronLeftIcon
              width={28}
              className="text-gray-400"
            />

            {/* ================================= */}
            {/* DATABASE DATES */}
            {/* ================================= */}

            <div
              className="
                grid
                grid-cols-3
                md:flex
                flex-wrap
                md:max-w-lg
                gap-4
              "
            >

              {dates.map((date) => {

                const dateObject =
                  new Date(`${date}T00:00:00`);

                const day =
                  dateObject.getDate();

                const month =
                  dateObject.toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                    }
                  );

                const isSelected =
                  selected === date;

                return (
                  <button
                    type="button"
                    key={date}
                    onClick={() => setSelected(date)}
                    className={`
                      flex
                      flex-col
                      items-center
                      justify-center
                      h-14
                      w-14
                      aspect-square
                      rounded
                      cursor-pointer
                      transition-all

                      ${
                        isSelected
                          ? "bg-primary text-white"
                          : "border border-primary/70 hover:bg-primary/20"
                      }
                    `}
                  >

                    <span className="font-medium">
                      {day}
                    </span>

                    <span>
                      {month}
                    </span>

                  </button>
                );

              })}

            </div>

            {/* RIGHT ARROW */}

            <ChevronRightIcon
              width={28}
              className="text-gray-400"
            />

          </div>

        </div>

        {/* ================================= */}
        {/* BOOK NOW */}
        {/* ================================= */}

        <button
          type="button"
          onClick={onBookHandler}
          className="
            bg-primary
            text-white
            px-8
            py-2
            rounded
            hover:bg-primary/90
            transition-all
            cursor-pointer
          "
        >
          Book Now
        </button>

      </div>

    </div>
  );
};

export default DateSelect;