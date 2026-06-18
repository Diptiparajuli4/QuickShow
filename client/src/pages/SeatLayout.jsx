import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyShowsData, dummyDateTimeData, assets } from "../assets/assets";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import BlurCircle from "../components/BlurCircle";
import { toast } from "react-toastify";

const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const { id, date } = useParams();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);

  useEffect(() => {
    const movie = dummyShowsData.find(
      (item) => item._id.toString() === id.toString()
    );

    if (movie) {
      setShow({
        movie,
        dateTime: dummyDateTimeData,
      });
    }
  }, [id, date]);

  // 🔥 Seat selection
  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please select time first");
    }

    if (
      !selectedSeats.includes(seatId) &&
      selectedSeats.length >= 5
    ) {
      return toast("You can only select 5 seats");
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };

  // 🔥 BOOKING SAVE FUNCTION (MAIN FIX)
  const handleBooking = () => {
    if (!selectedTime) {
      return toast("Please select time first");
    }

    if (selectedSeats.length === 0) {
      return toast("Please select seats");
    }

    const movie = dummyShowsData.find(
      (item) => item._id.toString() === id.toString()
    );

    const newBooking = {
  id: Date.now(),
  movie: movie?.title || "Unknown Movie",
  date,
  time: selectedTime.time,

  // ✔ seat count
  seats: selectedSeats.length,

  // ✔ seat numbers (IMPORTANT for MyBooking)
  bookedSeats: selectedSeats,

  // ✔ amount (example: 200 per seat)
  amount: selectedSeats.length * 200,

  // ✔ payment status
  isPaid: false
};

    // get old bookings
    const existingBookings =
      JSON.parse(localStorage.getItem("bookings")) || [];

    // add new booking
    existingBookings.push(newBooking);

    // save back
    localStorage.setItem(
      "bookings",
      JSON.stringify(existingBookings)
    );

    toast.success("Booking successful!");

    // redirect
    navigate("/my-booking");
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;

          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer transition-all ${
                selectedSeats.includes(seatId)
                  ? "bg-primary text-white"
                  : ""
              }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!show) {
    return (
      <div className="text-center pt-40 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 pt-40">

      {/* TIMING SECTION */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10">
        <p className="text-lg font-semibold px-6">
          Available Timings
        </p>

        <div className="mt-5 space-y-2">
          {show?.dateTime?.[date]?.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 cursor-pointer transition-all ${
                selectedTime?.showId === item.showId
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
              }`}
            >
              <ClockIcon className="w-4 h-4" />

              <p className="text-sm">
                {new Date(item.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SEAT LAYOUT */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">

        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle right="0" />

        <h1 className="text-2xl font-semibold mb-4">
          Select Your Seat
        </h1>

        <img
          src={assets.screenImage}
          alt="screen"
          className="max-w-full"
        />

        <p className="text-gray-400 text-sm mb-6">
          SCREEN SIDE
        </p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          {groupRows.map((group, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-8 mb-4"
            >
              {group.map((row) => renderSeats(row))}
            </div>
          ))}
        </div>

        {/* SUMMARY + BUTTON */}
        <div className="mt-8 flex flex-col items-center">

          <p className="text-white text-lg mb-4">
            Selected Seats: {selectedSeats.join(", ")}
          </p>

          <button
            onClick={handleBooking}
            className="flex items-center justify-center gap-2 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
          >
            Proceed to CheckOut
            <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default SeatLayout;