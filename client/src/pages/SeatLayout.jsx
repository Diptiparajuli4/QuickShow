
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  ArrowRightIcon,
  ClockIcon,
} from "lucide-react";
import BlurCircle from "../components/BlurCircle";
import { toast } from "react-toastify";

const SeatLayout = () => {

  // =========================================
  // SEAT ROWS
  // =========================================

  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  // =========================================
  // URL PARAMETERS
  // =========================================

  const { id, date } = useParams();

  const navigate = useNavigate();

  // =========================================
  // STATES
  // =========================================

  const [selectedSeats, setSelectedSeats] = useState([]);

  const [selectedTime, setSelectedTime] = useState(null);

  const [show, setShow] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // GET TOKEN
  // =========================================

  const token = localStorage.getItem("token");

  // =========================================
  // FETCH SHOW FROM DATABASE
  // =========================================

  useEffect(() => {

    const fetchShow = async () => {

      try {

        setLoading(true);
        setError("");

        console.log(
          "Fetching show from MongoDB..."
        );

        console.log(
          "Movie ID:",
          id
        );

        console.log(
          "Selected Date:",
          date
        );

        // =====================================
        // GET ALL SHOWS FROM DATABASE
        // =====================================

        const response = await fetch(
          "http://localhost:3000/show/all"
        );

        if (!response.ok) {

          throw new Error(
            `Server error: ${response.status}`
          );

        }

        const data = await response.json();

        console.log(
          "Shows received:",
          data
        );

        // =====================================
        // CHECK RESPONSE
        // =====================================

        if (
          !data.success ||
          !Array.isArray(data.shows)
        ) {

          throw new Error(
            data.message ||
            "Invalid show data received"
          );

        }

        // =====================================
        // FIND SHOWS FOR THIS MOVIE
        // =====================================

        const movieShows = data.shows.filter(
          (item) => {

            if (!item.movie) {
              return false;
            }

            const movieId =
              item.movie._id ||
              item.movie.id;

            return (
              String(movieId) ===
              String(id)
            );

          }
        );

        console.log(
          "Shows for this movie:",
          movieShows
        );

        // =====================================
        // FIND SHOW FOR SELECTED DATE
        // =====================================

        const dateShows = movieShows.filter(
          (item) => {

            if (!item.showDateTime) {
              return false;
            }

            const showDate =
              new Date(
                item.showDateTime
              )
                .toISOString()
                .split("T")[0];

            return (
              showDate === date
            );

          }
        );

        console.log(
          "Shows for selected date:",
          dateShows
        );

        // =====================================
        // NO SHOW FOR DATE
        // =====================================

        if (dateShows.length === 0) {

          setShow(null);

          setError(
            "No show is available for this date."
          );

          return;

        }

        // =====================================
        // CREATE SHOW OBJECT
        // =====================================

        const movie =
          dateShows[0].movie;

        setShow({
          movie: movie,

          shows: dateShows,
        });

        // =====================================
        // AUTOMATICALLY SELECT FIRST TIME
        // =====================================

        setSelectedTime(
          dateShows[0]
        );

      } catch (err) {

        console.error(
          "Error fetching show:",
          err
        );

        setShow(null);

        setError(
          "Unable to load show details."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchShow();

  }, [id, date]);

  // =========================================
  // SEAT CLICK
  // =========================================

  const handleSeatClick = (seatId) => {

    // -----------------------------------------
    // NO TIME SELECTED
    // -----------------------------------------

    if (!selectedTime) {

      toast(
        "Please select a show time first"
      );

      return;

    }

    // -----------------------------------------
    // CHECK OCCUPIED SEATS
    // -----------------------------------------

    const occupiedSeats =
      selectedTime.occupiedSeats || {};

    if (
      occupiedSeats[seatId]
    ) {

      toast(
        "This seat is already occupied"
      );

      return;

    }

    // -----------------------------------------
    // MAXIMUM 5 SEATS
    // -----------------------------------------

    if (
      !selectedSeats.includes(
        seatId
      ) &&
      selectedSeats.length >= 5
    ) {

      toast(
        "You can only select 5 seats"
      );

      return;

    }

    // -----------------------------------------
    // SELECT / DESELECT
    // -----------------------------------------

    setSelectedSeats(
      (previousSeats) => {

        if (
          previousSeats.includes(
            seatId
          )
        ) {

          return previousSeats.filter(
            (seat) =>
              seat !== seatId
          );

        }

        return [
          ...previousSeats,
          seatId,
        ];

      }
    );

  };

  // =========================================
  // CHANGE SHOW TIME
  // =========================================

  const handleTimeChange = (showItem) => {

    setSelectedTime(
      showItem
    );

    // Clear seats when changing time
    setSelectedSeats([]);

  };

  // =========================================
  // BOOKING
  // =========================================

  const handleBooking = async () => {

    // -----------------------------------------
    // CHECK TIME
    // -----------------------------------------

    if (!selectedTime) {

      toast(
        "Please select a show time"
      );

      return;

    }

    // -----------------------------------------
    // CHECK SEATS
    // -----------------------------------------

    if (
      selectedSeats.length === 0
    ) {

      toast(
        "Please select at least one seat"
      );

      return;

    }

    // -----------------------------------------
    // CHECK LOGIN
    // -----------------------------------------

    if (!token) {

      toast(
        "Please login to continue"
      );

      navigate("/login");

      return;

    }

    try {

      // ---------------------------------------
      // DATABASE SHOW PRICE
      // ---------------------------------------

      const price =
        Number(
          selectedTime.showPrice
        ) || 0;

      // ---------------------------------------
      // TOTAL AMOUNT
      // ---------------------------------------

      const totalAmount =
        selectedSeats.length *
        price;

      console.log(
        "Booking information:",
        {
          showId:
            selectedTime._id,

          movieId:
            id,

          date,

          time:
            selectedTime.showDateTime,

          seats:
            selectedSeats,

          price,

          amount:
            totalAmount,
        }
      );

      // =======================================
      // SEND BOOKING TO BACKEND
      // =======================================

      const response = await fetch(
        "http://localhost:3000/booking/add",
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body: JSON.stringify({

            showId:
              selectedTime._id,

            bookedSeats:
              selectedSeats,

          }),

        }
      );

      const data =
        await response.json();

      console.log(
        "Booking response:",
        data
      );

      // =======================================
      // CHECK RESPONSE
      // =======================================

      if (!response.ok || !data.success) {

        toast(
          data.message ||
          "Booking failed"
        );

        return;

      }

      // =======================================
      // SUCCESS
      // =======================================

      toast.success(
        "Booking successful!"
      );

      // =======================================
      // GO TO MY BOOKINGS
      // =======================================

      navigate(
        "/my-booking"
      );

      window.scrollTo(
        0,
        0
      );

    } catch (err) {

      console.error(
        "Booking error:",
        err
      );

      toast(
        "Unable to complete booking"
      );

    }

  };

  // =========================================
  // RENDER SEATS
  // =========================================

  const renderSeats = (
    row,
    count = 9
  ) => {

    return (

      <div
        key={row}
        className="flex gap-2 mt-2"
      >

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
          "
        >

          {Array.from(
            {
              length: count,
            },
            (_, index) => {

              const seatId =
                `${row}${index + 1}`;

              const occupiedSeats =
                selectedTime?.occupiedSeats ||
                {};

              const isOccupied =
                Boolean(
                  occupiedSeats[
                    seatId
                  ]
                );

              const isSelected =
                selectedSeats.includes(
                  seatId
                );

              return (

                <button
                  key={seatId}
                  type="button"
                  disabled={isOccupied}
                  onClick={() =>
                    handleSeatClick(
                      seatId
                    )
                  }
                  className={`
                    h-8
                    w-8
                    rounded
                    border
                    text-xs
                    transition-all

                    ${
                      isOccupied
                        ? `
                          bg-gray-700
                          text-gray-500
                          border-gray-700
                          cursor-not-allowed
                        `
                        : isSelected
                        ? `
                          bg-primary
                          text-white
                          border-primary
                        `
                        : `
                          border-primary/60
                          cursor-pointer
                          hover:bg-primary/20
                        `
                    }
                  `}
                >

                  {seatId}

                </button>

              );

            }
          )}

        </div>

      </div>

    );

  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div
        className="
          flex
          items-center
          justify-center
          min-h-screen
          text-white
        "
      >

        <p className="text-xl">

          Loading show details...

        </p>

      </div>

    );

  }

  // =========================================
  // ERROR
  // =========================================

  if (!show) {

    return (

      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          min-h-screen
          text-white
          gap-4
        "
      >

        <h1 className="text-2xl font-semibold">

          Show Not Available

        </h1>

        <p className="text-gray-400">

          {error ||
            "No show found for this movie and date."}

        </p>

        <button
          onClick={() =>
            navigate("/movies")
          }
          className="
            bg-primary
            px-6
            py-2
            rounded
            cursor-pointer
          "
        >

          Back to Movies

        </button>

      </div>

    );

  }

  // =========================================
  // CURRENT PRICE
  // =========================================

  const ticketPrice =
    Number(
      selectedTime?.showPrice
    ) || 0;

  // =========================================
  // TOTAL PRICE
  // =========================================

  const totalPrice =
    selectedSeats.length *
    ticketPrice;

  // =========================================
  // PAGE
  // =========================================

  return (

    <div
      className="
        flex
        flex-col
        md:flex-row
        px-6
        md:px-16
        lg:px-40
        pt-40
        gap-10
      "
    >

      {/* ===================================== */}
      {/* MOVIE INFORMATION */}
      {/* ===================================== */}

      <div
        className="
          md:w-60
          bg-primary/10
          border
          border-primary/20
          rounded-lg
          p-5
          h-fit
        "
      >

        <img
          src={
            show.movie?.poster_path
              ? show.movie.poster_path.startsWith(
                  "http"
                )
                ? show.movie.poster_path
                : `https://image.tmdb.org/t/p/w500${show.movie.poster_path}`
              : "/fallback.jpg"
          }
          alt={
            show.movie?.title ||
            "Movie"
          }
          className="
            w-full
            rounded-lg
            object-cover
            mb-4
          "
        />

        <h2
          className="
            text-lg
            font-semibold
            text-white
          "
        >

          {show.movie?.title}

        </h2>

        {/* ================================= */}
        {/* SELECTED DATE */}
        {/* ================================= */}

        <p
          className="
            text-sm
            text-gray-400
            mt-2
          "
        >

          📅 {date}

        </p>

        {/* ================================= */}
        {/* SELECTED PRICE */}
        {/* ================================= */}

        <p
          className="
            text-sm
            text-gray-400
            mt-2
          "
        >

          💰 Rs. {ticketPrice}

          {" "}per ticket

        </p>

      </div>

      {/* ===================================== */}
      {/* MAIN SEAT SECTION */}
      {/* ===================================== */}

      <div
        className="
          relative
          flex-1
          flex
          flex-col
          items-center
          max-md:mt-5
        "
      >

        <BlurCircle
          top="-100px"
          left="-100px"
        />

        <BlurCircle
          right="0"
        />

        {/* ================================= */}
        {/* TITLE */}
        {/* ================================= */}

        <h1
          className="
            text-2xl
            font-semibold
            mb-6
          "
        >

          Select Your Seat

        </h1>

        {/* ================================= */}
        {/* AVAILABLE TIMINGS */}
        {/* ================================= */}

        <div
          className="
            w-full
            max-w-3xl
            mb-8
          "
        >

          <h2
            className="
              text-lg
              font-semibold
              mb-4
            "
          >

            Available Timings

          </h2>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >

            {show.shows.map(
              (showItem) => {

                const showTime =
                  new Date(
                    showItem.showDateTime
                  );

                const isSelected =
                  selectedTime?._id ===
                  showItem._id;

                return (

                  <button
                    key={
                      showItem._id
                    }
                    type="button"
                    onClick={() =>
                      handleTimeChange(
                        showItem
                      )
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      px-5
                      py-3
                      rounded-lg
                      border
                      transition-all
                      cursor-pointer

                      ${
                        isSelected
                          ? `
                            bg-primary
                            text-white
                            border-primary
                          `
                          : `
                            border-primary/30
                            hover:bg-primary/20
                          `
                      }
                    `}
                  >

                    <ClockIcon
                      className="w-4 h-4"
                    />

                    <span>

                      {showTime.toLocaleTimeString(
                        [],
                        {
                          hour:
                            "2-digit",

                          minute:
                            "2-digit",
                        }
                      )}

                    </span>

                    <span
                      className="
                        text-xs
                        opacity-80
                      "
                    >

                      Rs.{" "}
                      {
                        showItem.showPrice
                      }

                    </span>

                  </button>

                );

              }
            )}

          </div>

        </div>

        {/* ================================= */}
        {/* SCREEN */}
        {/* ================================= */}

        <img
          src={
            assets.screenImage
          }
          alt="screen"
          className="max-w-full"
        />

        <p
          className="
            text-gray-400
            text-sm
            mb-6
          "
        >

          SCREEN SIDE

        </p>

        {/* ================================= */}
        {/* SEATS */}
        {/* ================================= */}

        <div
          className="
            flex
            flex-col
            items-center
            mt-10
            text-xs
            text-gray-300
          "
        >

          {groupRows.map(
            (group, index) => (

              <div
                key={index}
                className="
                  grid
                  grid-cols-2
                  gap-8
                  mb-4
                "
              >

                {group.map(
                  (row) =>
                    renderSeats(row)
                )}

              </div>

            )
          )}

        </div>

        {/* ================================= */}
        {/* SEAT LEGEND */}
        {/* ================================= */}

        <div
          className="
            flex
            items-center
            gap-6
            mt-6
            text-sm
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                w-5
                h-5
                border
                border-primary/60
                rounded
              "
            />

            <span>
              Available
            </span>

          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                w-5
                h-5
                bg-primary
                rounded
              "
            />

            <span>
              Selected
            </span>

          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                w-5
                h-5
                bg-gray-700
                rounded
              "
            />

            <span>
              Occupied
            </span>

          </div>

        </div>

        {/* ================================= */}
        {/* BOOKING SUMMARY */}
        {/* ================================= */}

        <div
          className="
            mt-10
            mb-20
            w-full
            max-w-xl
            p-6
            bg-primary/10
            border
            border-primary/20
            rounded-lg
          "
        >

          <p
            className="
              text-white
              text-lg
              mb-2
            "
          >

            Selected Seats:

            {" "}

            {selectedSeats.length > 0
              ? selectedSeats.join(
                  ", "
                )
              : "None"}

          </p>

          <p
            className="
              text-gray-400
              mb-2
            "
          >

            Tickets:

            {" "}

            {selectedSeats.length}

          </p>

          <p
            className="
              text-gray-400
              mb-4
            "
          >

            Price per ticket:

            {" "}

            Rs. {ticketPrice}

          </p>

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <p
              className="
                text-xl
                font-semibold
                text-white
              "
            >

              Total:

              {" "}

              Rs. {totalPrice}

            </p>

            <button
              onClick={
                handleBooking
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                px-8
                py-3
                text-sm
                bg-primary
                hover:bg-primary-dull
                transition
                rounded-full
                font-medium
                cursor-pointer
                active:scale-95
              "
            >

              Proceed to CheckOut

              <ArrowRightIcon
                strokeWidth={3}
                className="w-4 h-4"
              />

            </button>

          </div>

        </div>

      </div>

    </div>

  );

};

export default SeatLayout;
