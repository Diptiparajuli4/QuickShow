import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

import {
    ArrowRightIcon,
    ClockIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";

import { useAuth } from "../context/AuthContext";      // ✅ only this context
import { toast } from "react-hot-toast";

// =====================================================
// ROWS
// =====================================================
const rows = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
];

// =====================================================
// GET DATE ONLY
// =====================================================
const getDateOnly = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// =====================================================
// FORMAT TIME
// =====================================================
const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

// =====================================================
// SEAT BUTTON
// =====================================================
const SeatButton = ({ seat, occupied, selected, onClick }) => {
    return (
        <button
            type="button"
            disabled={occupied}
            onClick={() => onClick(seat)}
            title={occupied ? `${seat} - Occupied` : seat}
            className={`
                w-9 h-9 sm:w-10 sm:h-10 rounded-md border text-xs font-medium
                transition-all duration-200 flex items-center justify-center
                ${occupied
                    ? `bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed`
                    : selected
                        ? `bg-primary border-primary text-white shadow-lg shadow-primary/20`
                        : `bg-transparent border-gray-700 text-gray-300 hover:bg-primary/20 hover:border-primary hover:text-white`
                }
            `}
        >
            {seat}
        </button>
    );
};

// =====================================================
// SEAT LAYOUT
// =====================================================
const SeatLayout = () => {
    const { id, date } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, admin } = useAuth();   // ✅ user from AuthContext

    // =====================================================
    // STATES
    // =====================================================
    const [shows, setShows] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    // =====================================================
    // GET SHOWS
    // =====================================================
    const getShows = async () => {
        try {
            setLoading(true);
            console.log("=================================");
            console.log("SEAT LAYOUT");
            console.log("Movie ID:", id);
            console.log("Selected Date:", date);
            console.log("=================================");

            if (!id) {
                toast.error("Movie ID is missing.");
                return;
            }

            const response = await axios.get(`http://localhost:5000/show/${id}`);
            console.log("SHOW RESPONSE:", response.data);

            if (!response.data?.success) {
                toast.error(response.data?.message || "Unable to load shows.");
                return;
            }

            const allShows = response.data.shows || [];
            console.log("ALL SHOWS:", allShows);

            const filteredShows = allShows.filter((show) => {
                if (!show?.showDateTime) return false;
                const showDate = getDateOnly(show.showDateTime);
                return showDate === date;
            });

            console.log("SHOWS FOR SELECTED DATE:", filteredShows);
            setShows(filteredShows);

            if (filteredShows.length > 0) {
                const firstShow = filteredShows[0];
                if (firstShow.movie && typeof firstShow.movie === "object") {
                    setMovie(firstShow.movie);
                }
            } else if (allShows.length > 0) {
                const firstShow = allShows[0];
                if (firstShow.movie && typeof firstShow.movie === "object") {
                    setMovie(firstShow.movie);
                }
            }
        } catch (error) {
            console.error("GET SHOWS ERROR:", error);
            console.error("ERROR RESPONSE:", error?.response?.data);
            toast.error(error?.response?.data?.message || "Unable to load show timings.");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // GET OCCUPIED SEATS
    // =====================================================
    const getOccupiedSeats = async (showId) => {
        try {
            if (!showId) return;
            console.log("Getting occupied seats for show:", showId);
            const response = await axios.get(
                `http://localhost:5000/booking/occupied-seats/${showId}`
            );
            console.log("OCCUPIED SEATS RESPONSE:", response.data);
            if (response.data?.success) {
                const seats = response.data.occupiedSeats || response.data.seats || [];
                setOccupiedSeats(Array.isArray(seats) ? seats : []);
            } else {
                setOccupiedSeats([]);
            }
        } catch (error) {
            console.error("GET OCCUPIED SEATS ERROR:", error);
            setOccupiedSeats([]);
        }
    };

    // =====================================================
    // LOAD SHOWS
    // =====================================================
    useEffect(() => {
        getShows();
    }, [id, date]);

    // =====================================================
    // SELECT SHOW TIME
    // =====================================================
    const handleTimeSelect = async (show) => {
        console.log("SELECTED SHOW:", show);
        setSelectedTime(show);
        setSelectedSeats([]);
        setOccupiedSeats([]);
        await getOccupiedSeats(show._id);
    };

    // =====================================================
    // CHECK OCCUPIED
    // =====================================================
    const isSeatOccupied = (seat) => {
        return occupiedSeats.includes(seat);
    };

    // =====================================================
    // SELECT SEAT
    // =====================================================
    const handleSeatClick = (seat) => {
        if (isSeatOccupied(seat)) {
            toast.error("This seat is already booked.");
            return;
        }
        setSelectedSeats((previousSeats) => {
            if (previousSeats.includes(seat)) {
                return previousSeats.filter((item) => item !== seat);
            }
            if (previousSeats.length >= 5) {
                toast.error("You can select a maximum of 5 seats.");
                return previousSeats;
            }
            return [...previousSeats, seat];
        });
    };

    // =====================================================
    // GET MOVIE
    // =====================================================
    const getMovie = () => {
        if (movie) return movie;
        if (selectedTime?.movie && typeof selectedTime.movie === "object") {
            return selectedTime.movie;
        }
        return null;
    };

    // =====================================================
    // CHECKOUT – GET TOKEN FROM LOCALSTORAGE
    // =====================================================
    const handleCheckout = async () => {
        try {
            // ✅ Get userId from AuthContext
            const userId = user?._id || user?.id || location.state?.userId || null;
            if (!userId) {
                toast.error("User information is unavailable. Please refresh the page.");
                return;
            }

            if (!selectedTime) {
                toast.error("Please select a show time.");
                return;
            }

            if (selectedSeats.length === 0) {
                toast.error("Please select at least one seat.");
                return;
            }

            if (selectedSeats.length > 5) {
                toast.error("You can select a maximum of 5 seats.");
                return;
            }

            const showId = selectedTime._id;
            if (!showId) {
                toast.error("Show ID is missing.");
                console.error("Selected show:", selectedTime);
                return;
            }

            // ✅ Get token from localStorage (set by AuthContext during login)
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication token not found. Please log in again.");
                return;
            }

            setBookingLoading(true);

            const payload = {
                showId: showId,
                selectedSeats: selectedSeats,
            };

            console.log("=================================");
            console.log("CHECKOUT PAYLOAD:", payload);
            console.log("User ID:", userId);
            console.log("Token:", token);
            console.log("=================================");

            const response = await axios.post(
                "http://localhost:5000/booking/create",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("CREATE BOOKING RESPONSE:", response.data);

            if (response.data?.success) {
                toast.success("Booking created successfully!");
                navigate("/my-booking", { replace: true });
            } else {
                toast.error(response.data?.message || "Unable to create booking.");
            }
        } catch (error) {
            console.error("CHECKOUT ERROR:", error);
            console.error("CHECKOUT RESPONSE:", error?.response?.data);
            toast.error(error?.response?.data?.message || error?.message || "Unable to create booking.");
        } finally {
            setBookingLoading(false);
        }
    };

    // =====================================================
    // LOADING SCREEN
    // =====================================================
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loading />
                </main>
                <Footer />
            </div>
        );
    }

    // =====================================================
    // NO SHOWS
    // =====================================================
    if (shows.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 relative overflow-hidden">
                    <BlurCircle top="100px" left="0px" />
                    <BlurCircle top="500px" right="0px" />
                    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                        <h2 className="text-2xl font-semibold mb-4">No Show Timings Available</h2>
                        <p className="text-gray-400 mb-6 text-center">
                            There are no shows available for {date}.
                        </p>
                        <button
                            onClick={() => navigate(`/movies/${id}`)}
                            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dull transition"
                        >
                            Go Back
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const currentMovie = getMovie();
    const totalAmount = selectedTime
        ? Number(selectedTime.showPrice || 0) * selectedSeats.length
        : 0;

    // =====================================================
    // RENDER
    // =====================================================
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <main className="flex-1 relative overflow-hidden">
                <BlurCircle top="100px" left="0px" />
                <BlurCircle top="500px" right="0px" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10">
                    <button
                        onClick={() => navigate(`/movies/${id}`)}
                        className="text-gray-400 hover:text-white transition mb-8"
                    >
                        ← Back to movie
                    </button>

                    <div className="mb-10">
                        <h1 className="text-2xl sm:text-3xl font-bold">
                            {currentMovie?.title || currentMovie?.movieName || "Select your seat"}
                        </h1>
                        <p className="text-gray-400 mt-2">{date}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12">
                        {/* LEFT - Available Timings */}
                        <aside>
                            <div className="border border-gray-800 rounded-xl bg-gray-900/60 p-5 lg:sticky lg:top-24">
                                <h2 className="text-lg font-semibold mb-6">Available Timings</h2>
                                <div className="space-y-3">
                                    {shows.map((show) => {
                                        const isSelected = selectedTime?._id === show._id;
                                        return (
                                            <button
                                                key={show._id}
                                                type="button"
                                                onClick={() => handleTimeSelect(show)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition
                                                    ${isSelected
                                                        ? `border-primary bg-primary/20 text-primary`
                                                        : `border-gray-700 bg-black/40 hover:border-primary hover:bg-primary/10`
                                                    }`}
                                            >
                                                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium">{formatTime(show.showDateTime)}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Rs. {show.showPrice}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* RIGHT - Seat Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-center mb-8">Select your seat</h2>

                            <div className="max-w-2xl mx-auto mb-12 px-6">
                                <div className="h-5 border-t-8 border-primary rounded-[50%] opacity-70" />
                                <p className="text-center text-gray-500 text-sm mt-3">SCREEN SIDE</p>
                            </div>

                            {!selectedTime ? (
                                <div className="border border-gray-800 rounded-xl p-10 text-center bg-gray-900/30">
                                    <ClockIcon className="w-8 h-8 mx-auto mb-4 text-gray-500" />
                                    <p className="text-gray-400">Please select a show time from the left.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-full overflow-x-auto pb-3">
                                        <div className="min-w-[650px] flex flex-col items-center gap-4">
                                            {/* A - B : 9 seats each */}
                                            {["A", "B"].map((row) => (
                                                <div key={row} className="flex items-center justify-center">
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: 9 }, (_, index) => {
                                                            const seat = `${row}${index + 1}`;
                                                            return (
                                                                <SeatButton
                                                                    key={seat}
                                                                    seat={seat}
                                                                    occupied={isSeatOccupied(seat)}
                                                                    selected={selectedSeats.includes(seat)}
                                                                    onClick={handleSeatClick}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="h-3" />

                                            {/* C/D + E/F */}
                                            {[
                                                ["C", "E"],
                                                ["D", "F"],
                                            ].map(([leftRow, rightRow]) => (
                                                <div key={`${leftRow}-${rightRow}`} className="flex items-center justify-center">
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: 4 }, (_, index) => {
                                                            const seat = `${leftRow}${index + 1}`;
                                                            return (
                                                                <SeatButton
                                                                    key={seat}
                                                                    seat={seat}
                                                                    occupied={isSeatOccupied(seat)}
                                                                    selected={selectedSeats.includes(seat)}
                                                                    onClick={handleSeatClick}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="w-12 sm:w-16" />
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: 5 }, (_, index) => {
                                                            const seatNumber = index + 5;
                                                            const seat = `${rightRow}${seatNumber}`;
                                                            return (
                                                                <SeatButton
                                                                    key={seat}
                                                                    seat={seat}
                                                                    occupied={isSeatOccupied(seat)}
                                                                    selected={selectedSeats.includes(seat)}
                                                                    onClick={handleSeatClick}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="h-3" />

                                            {/* G/H + I/J */}
                                            {[
                                                ["G", "I"],
                                                ["H", "J"],
                                            ].map(([leftRow, rightRow]) => (
                                                <div key={`${leftRow}-${rightRow}`} className="flex items-center justify-center">
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: 4 }, (_, index) => {
                                                            const seat = `${leftRow}${index + 1}`;
                                                            return (
                                                                <SeatButton
                                                                    key={seat}
                                                                    seat={seat}
                                                                    occupied={isSeatOccupied(seat)}
                                                                    selected={selectedSeats.includes(seat)}
                                                                    onClick={handleSeatClick}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="w-12 sm:w-16" />
                                                    <div className="flex gap-2">
                                                        {Array.from({ length: 5 }, (_, index) => {
                                                            const seatNumber = index + 5;
                                                            const seat = `${rightRow}${seatNumber}`;
                                                            return (
                                                                <SeatButton
                                                                    key={seat}
                                                                    seat={seat}
                                                                    occupied={isSeatOccupied(seat)}
                                                                    selected={selectedSeats.includes(seat)}
                                                                    onClick={handleSeatClick}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-center flex-wrap gap-6 mt-12 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded border border-gray-700" />
                                            Available
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded bg-primary" />
                                            Selected
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded bg-gray-700" />
                                            Occupied
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>

                    {/* CHECKOUT */}
                    <div className="border-t border-gray-800 mt-14 pt-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <p className="text-gray-400 text-sm">Selected seats</p>
                                <p className="font-semibold mt-1 text-base">
                                    {selectedSeats.length > 0 ? selectedSeats.join(", ") : "No seats selected"}
                                </p>
                                {selectedTime && (
                                    <p className="text-gray-400 text-sm mt-2">
                                        Time: {formatTime(selectedTime.showDateTime)}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                <div className="text-left sm:text-right">
                                    <p className="text-gray-400 text-sm">Total</p>
                                    <p className="text-2xl font-bold">Rs. {totalAmount}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    disabled={bookingLoading || !selectedTime || selectedSeats.length === 0}
                                    className="px-6 py-3 rounded-lg bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dull transition"
                                >
                                    {bookingLoading ? "Processing..." : "Proceed to Checkout"}
                                    {!bookingLoading && <ArrowRightIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SeatLayout;