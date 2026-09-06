import React, { useState, useEffect } from "react";
import BlurCircle from "./BlurCircle";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const DateSelect = ({ id }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [selected, setSelected] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // FETCH SHOWS FROM DATABASE
  // =========================================
  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`http://localhost:5000/show/${id}`);
        if (response.data.success) {
          const shows = response.data.shows || [];
          // Extract unique dates from showDateTime
          const uniqueDates = [...new Set(
            shows.map((show) => {
              const dateObj = new Date(show.showDateTime);
              if (isNaN(dateObj.getTime())) return null;
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, "0");
              const day = String(dateObj.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }).filter(Boolean)
          )].sort((a, b) => new Date(a) - new Date(b));
          setDates(uniqueDates);
        } else {
          setError(response.data.message || "Unable to load shows.");
        }
      } catch (err) {
        console.error("Fetch shows error:", err);
        setError("Unable to load show dates.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchShows();
  }, [id]);

  // =========================================
  // BOOK NOW & USER AUTH CHECK
  // =========================================
  const onBookHandler = () => {
    if (!selected) {
      toast.warn("Please select a date");
      return;
    }

    // Strict check for logged-in user
    if (!user) {
      toast.error("Please log in to book tickets");
      navigate("/login", {
        state: { from: `/movies/${id}/${selected}` },
      });
      return;
    }

    console.log("Selected movie ID:", id);
    console.log("Selected date:", selected);

    navigate(`/movies/${id}/${selected}`, {
      state: {
        userId: user._id || user.id,
        userEmail: user.email,
        userName: user.name || user.username,
      },
    });

    window.scrollTo(0, 0);
  };

  // =========================================
  // LOADING / ERROR / EMPTY STATES
  // =========================================
  if (loading) {
    return (
      <div id="dateSelect" className="pt-30">
        <div className="relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
          <BlurCircle top="-100px" left="-100px" />
          <BlurCircle top="100px" right="0px" />
          <p className="text-lg font-semibold">Choose Date</p>
          <p className="text-gray-400 mt-4">Loading show dates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="dateSelect" className="pt-30">
        <div className="relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
          <BlurCircle top="-100px" left="-100px" />
          <BlurCircle top="100px" right="0px" />
          <p className="text-lg font-semibold">Choose Date</p>
          <p className="text-red-400 mt-4">{error}</p>
        </div>
      </div>
    );
  }

  if (dates.length === 0) {
    return (
      <div id="dateSelect" className="pt-30">
        <div className="relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
          <BlurCircle top="-100px" left="-100px" />
          <BlurCircle top="100px" right="0px" />
          <p className="text-lg font-semibold">Choose Date</p>
          <p className="text-gray-400 mt-4">
            No shows are available for this movie.
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE RENDER
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
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />

        <div>
          <p className="text-lg font-semibold">Choose Date</p>
          <div className="flex items-center gap-6 text-sm mt-5">
            <ChevronLeftIcon width={28} className="text-gray-400" />

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
                const dateObject = new Date(`${date}T00:00:00`);
                const day = dateObject.getDate();
                const month = dateObject.toLocaleDateString("en-US", {
                  month: "short",
                });
                const isSelected = selected === date;

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
                      ${isSelected
                        ? "bg-primary text-white"
                        : "border border-primary/70 hover:bg-primary/20"
                      }
                    `}
                  >
                    <span className="font-medium">{day}</span>
                    <span>{month}</span>
                  </button>
                );
              })}
            </div>

            <ChevronRightIcon width={28} className="text-gray-400" />
          </div>
        </div>

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