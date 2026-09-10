import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";

import {
    ArrowRightIcon,
    ClockIcon,
    HeartIcon,
    ArmchairIcon,
    MapPinIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";

import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

// =====================================================
// SEAT PRICES - NPR (default fallback)
// =====================================================

const SEAT_PRICES = {
    STANDARD: 150,
    LOVE: 250,
    VIP: 400,
};

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
// GET SEAT TYPE (hardcoded fallback)
// =====================================================

const getSeatType = (seat) => {
    const row = String(seat).charAt(0);

    if (row === "I" || row === "J") {
        return "VIP";
    }

    if (
        row === "E" ||
        row === "F" ||
        row === "G" ||
        row === "H"
    ) {
        return "LOVE";
    }

    return "STANDARD";
};

// =====================================================
// GET SEAT TYPE FROM SHOW (dynamic)
// =====================================================

const getSeatTypeFromShow = (seat, show) => {
    if (show?.seatTypeMapping && typeof show.seatTypeMapping === "object") {
        const row = String(seat).charAt(0);
        const type = show.seatTypeMapping[row];
        if (type) return type;
    }

    return getSeatType(seat);
};

// =====================================================
// GET SEAT TYPE LABEL
// =====================================================

const getSeatTypeLabel = (seat, show) => {
    const type = getSeatTypeFromShow(seat, show);

    if (type === "VIP") {
        return "VIP / Luxury";
    }

    if (type === "LOVE") {
        return "Love / Couple";
    }

    return "Standard";
};

// =====================================================
// GET SEATING ZONE (hardcoded – keep as is)
// =====================================================

const getSeatingZone = (seat) => {
    const row = String(seat).charAt(0);

    const seatNumber = Number(
        String(seat).substring(1)
    );

    if (seatNumber === 1 || seatNumber === 9) {
        return "SIDE / CORNER";
    }

    if (
        row === "A" ||
        row === "B" ||
        row === "C" ||
        row === "D"
    ) {
        return "FRONT";
    }

    if (
        row === "E" ||
        row === "F" ||
        row === "G" ||
        row === "H"
    ) {
        return "MIDDLE";
    }

    if (row === "I" || row === "J") {
        return "BACK";
    }

    return "";
};

// =====================================================
// GET SEAT PRICE (uses show.seatPrices or fallback)
// =====================================================

const getSeatPrice = (seat, show) => {
    const type = getSeatTypeFromShow(seat, show);

    if (show?.seatPrices) {
        if (type === "VIP") {
            return Number(
                show.seatPrices.vip ??
                    SEAT_PRICES.VIP
            );
        }

        if (type === "LOVE") {
            return Number(
                show.seatPrices.love ??
                    SEAT_PRICES.LOVE
            );
        }

        return Number(
            show.seatPrices.standard ??
                show.showPrice ??
                SEAT_PRICES.STANDARD
        );
    }

    if (type === "VIP") {
        return SEAT_PRICES.VIP;
    }

    if (type === "LOVE") {
        return SEAT_PRICES.LOVE;
    }

    return Number(
        show?.showPrice ||
            SEAT_PRICES.STANDARD
    );
};

// =====================================================
// GET ALL PRICES
// =====================================================

const getShowPrices = (show) => {
    return {
        standard: Number(
            show?.seatPrices?.standard ??
                show?.showPrice ??
                SEAT_PRICES.STANDARD
        ),

        love: Number(
            show?.seatPrices?.love ??
                SEAT_PRICES.LOVE
        ),

        vip: Number(
            show?.seatPrices?.vip ??
                SEAT_PRICES.VIP
        ),
    };
};

// =====================================================
// GET AVAILABLE SEAT TYPES FOR LEGEND
// =====================================================

const getAvailableSeatTypes = (show) => {
    if (show?.seatTypeMapping && typeof show.seatTypeMapping === "object") {
        const typeSet = new Set(Object.values(show.seatTypeMapping));
        const ordered = ["STANDARD", "LOVE", "VIP"];
        return ordered.filter(type => typeSet.has(type));
    }

    return ["STANDARD", "LOVE", "VIP"];
};

// =====================================================
// GET THEATER ID FROM A SHOW
// =====================================================

const getTheaterIdFromShow = (show) => {
    if (!show) return "";

    if (show.theaterId && typeof show.theaterId === "object") {
        return String(show.theaterId._id || show.theaterId.id || "");
    }
    if (show.theaterId) {
        return String(show.theaterId);
    }
    if (show.theater && typeof show.theater === "object") {
        return String(show.theater._id || show.theater.id || "");
    }
    return "";
};

// =====================================================
// GET THEATER INFO FROM A SHOW
// =====================================================

const getTheaterInfoFromShow = (show) => {
    if (!show) return null;

    if (show.theaterId && typeof show.theaterId === "object") {
        return {
            _id: show.theaterId._id || show.theaterId.id,
            name: show.theaterId.name || "",
            city: show.theaterId.city || "",
            address: show.theaterId.address || "",
        };
    }
    if (show.theater && typeof show.theater === "object") {
        return {
            _id: show.theater._id || show.theater.id,
            name: show.theater.name || "",
            city: show.theater.city || "",
            address: show.theater.address || "",
        };
    }
    if (show.theaterName) {
        return {
            _id: show.theaterId || "",
            name: show.theaterName,
            city: show.theaterCity || "",
            address: show.theaterAddress || "",
        };
    }
    return null;
};

// =====================================================
// SEAT BUTTON
// =====================================================

const SeatButton = ({
    seat,
    occupied,
    selected,
    onClick,
    show,
}) => {
    const seatType = getSeatTypeFromShow(seat, show);

    const seatTypeLabel =
        getSeatTypeLabel(seat, show);

    const seatingZone =
        getSeatingZone(seat);

    let normalClass =
        "bg-transparent border-gray-700 text-gray-300 hover:bg-primary/20 hover:border-primary hover:text-white";

    if (seatType === "STANDARD") {
        normalClass =
            "bg-transparent border-gray-700 text-gray-300 hover:bg-primary/20 hover:border-primary hover:text-white";
    }

    if (seatType === "LOVE") {
        normalClass =
            "bg-pink-500/10 border-pink-500/50 text-pink-300 hover:bg-pink-500/20 hover:border-pink-400 hover:text-white";
    }

    if (seatType === "VIP") {
        normalClass =
            "bg-yellow-500/10 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-400 hover:text-white";
    }

    return (
        <button
            type="button"
            disabled={occupied}
            onClick={() => onClick(seat)}
            title={
                occupied
                    ? `${seat} - Occupied`
                    : `${seat} - ${seatTypeLabel} - ${seatingZone}`
            }
            className={`
                w-9 h-9
                sm:w-10 sm:h-10
                rounded-md
                border
                text-xs
                font-medium
                transition-all
                duration-200
                flex
                items-center
                justify-center

                ${
                    occupied
                        ? "bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed"
                        : selected
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : normalClass
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

    const [searchParams] = useSearchParams();

    const { user, admin } = useAuth();

    // =====================================================
    // THEATER CONTEXT (from DateSelect, with URL fallback)
    // =====================================================

    const theaterFromState = location.state || {};

    const theaterIdFromState =
        theaterFromState.theaterId ||
        searchParams.get("theater") ||
        "";

    const theaterNameFromState =
        theaterFromState.theaterName || "";

    const theaterCityFromState =
        theaterFromState.theaterCity || "";

    const theaterAddressFromState =
        theaterFromState.theaterAddress || "";

    // =====================================================
    // STATES
    // =====================================================

    const [shows, setShows] = useState([]);

    const [selectedTime, setSelectedTime] =
        useState(null);

    const [selectedSeats, setSelectedSeats] =
        useState([]);

    const [occupiedSeats, setOccupiedSeats] =
        useState([]);

    const [movie, setMovie] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [bookingLoading, setBookingLoading] =
        useState(false);

    // Derived theater info (state wins, then the first show's populated theater)
    const [resolvedTheater, setResolvedTheater] = useState(
        theaterNameFromState
            ? {
                  _id: theaterIdFromState,
                  name: theaterNameFromState,
                  city: theaterCityFromState,
                  address: theaterAddressFromState,
              }
            : null
    );

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
            console.log("Theater ID (from state/URL):", theaterIdFromState);
            console.log("=================================");

            if (!id) {
                toast.error(
                    "Movie ID is missing."
                );

                return;
            }

            const response = await axios.get(
                `http://localhost:5000/show/${id}`
            );

            console.log(
                "SHOW RESPONSE:",
                response.data
            );

            if (!response.data?.success) {
                toast.error(
                    response.data?.message ||
                        "Unable to load shows."
                );

                return;
            }

            const allShows =
                response.data.shows || [];

            console.log(
                "ALL SHOWS:",
                allShows
            );

            // Filter by date
            const dateFiltered = allShows.filter((show) => {
                if (!show?.showDateTime) {
                    return false;
                }
                return getDateOnly(show.showDateTime) === date;
            });

            // Filter by theater — if we know the theater, restrict to it
            const filteredShows = theaterIdFromState
                ? dateFiltered.filter(
                      (show) =>
                          getTheaterIdFromShow(show) ===
                          String(theaterIdFromState)
                  )
                : dateFiltered;

            console.log(
                "SHOWS FOR SELECTED DATE & THEATER:",
                filteredShows
            );

            setShows(filteredShows);

            // Resolve theater info from shows (fallback if state is missing)
            if (filteredShows.length > 0) {
                const firstShow = filteredShows[0];

                if (
                    firstShow.movie &&
                    typeof firstShow.movie === "object"
                ) {
                    setMovie(firstShow.movie);
                }

                if (!resolvedTheater) {
                    const theaterInfo =
                        getTheaterInfoFromShow(firstShow);
                    if (theaterInfo) {
                        setResolvedTheater(theaterInfo);
                    }
                }
            } else if (allShows.length > 0) {
                const firstShow = allShows[0];

                if (
                    firstShow.movie &&
                    typeof firstShow.movie === "object"
                ) {
                    setMovie(firstShow.movie);
                }
            }
        } catch (error) {
            console.error(
                "GET SHOWS ERROR:",
                error
            );

            console.error(
                "ERROR RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data
                    ?.message ||
                    "Unable to load show timings."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // GET OCCUPIED SEATS (per show — theater-safe)
    // =====================================================

    const getOccupiedSeats = async (
        showId
    ) => {
        try {
            if (!showId) return;

            console.log(
                "Getting occupied seats for show:",
                showId
            );

            const response =
                await axios.get(
                    `http://localhost:5000/booking/occupied-seats/${showId}`
                );

            console.log(
                "OCCUPIED SEATS RESPONSE:",
                response.data
            );

            if (response.data?.success) {
                const seats =
                    response.data
                        .occupiedSeats ||
                    response.data.seats ||
                    [];

                setOccupiedSeats(
                    Array.isArray(seats)
                        ? seats
                        : []
                );
            } else {
                setOccupiedSeats([]);
            }
        } catch (error) {
            console.error(
                "GET OCCUPIED SEATS ERROR:",
                error
            );

            setOccupiedSeats([]);
        }
    };

    // =====================================================
    // LOAD SHOWS
    // =====================================================

    useEffect(() => {
        getShows();
        // eslint-disable-next-line
    }, [id, date]);

    // =====================================================
    // SELECT SHOW TIME
    // =====================================================

    const handleTimeSelect = async (
        show
    ) => {
        console.log(
            "SELECTED SHOW:",
            show
        );

        setSelectedTime(show);

        setSelectedSeats([]);

        setOccupiedSeats([]);

        await getOccupiedSeats(
            show._id
        );
    };

    // =====================================================
    // CHECK OCCUPIED
    // =====================================================

    const isSeatOccupied = (
        seat
    ) => {
        return occupiedSeats.includes(
            seat
        );
    };

    // =====================================================
    // SELECT SEAT
    // =====================================================

    const handleSeatClick = (
        seat
    ) => {
        if (isSeatOccupied(seat)) {
            toast.error(
                "This seat is already booked."
            );

            return;
        }

        setSelectedSeats(
            (previousSeats) => {
                if (
                    previousSeats.includes(
                        seat
                    )
                ) {
                    return previousSeats.filter(
                        (item) =>
                            item !== seat
                    );
                }

                if (
                    previousSeats.length >=
                    5
                ) {
                    toast.error(
                        "You can select a maximum of 5 seats."
                    );

                    return previousSeats;
                }

                return [
                    ...previousSeats,
                    seat,
                ];
            }
        );
    };

    // =====================================================
    // GET MOVIE
    // =====================================================

    const getMovie = () => {
        if (movie) return movie;

        if (
            selectedTime?.movie &&
            typeof selectedTime.movie ===
                "object"
        ) {
            return selectedTime.movie;
        }

        return null;
    };

    // =====================================================
    // CALCULATE TOTAL
    // =====================================================

    const totalAmount =
        selectedTime
            ? selectedSeats.reduce(
                  (
                      total,
                      seat
                  ) => {
                      return (
                          total +
                          getSeatPrice(
                              seat,
                              selectedTime
                          )
                      );
                  },
                  0
              )
            : 0;

    // =====================================================
    // CHECKOUT
    // =====================================================

    const handleCheckout = async () => {
        try {
            const userId =
                user?._id ||
                user?.id ||
                location.state?.userId ||
                null;

            if (!userId) {
                toast.error(
                    "User information is unavailable. Please refresh the page."
                );

                return;
            }

            if (!selectedTime) {
                toast.error(
                    "Please select a show time."
                );

                return;
            }

            if (
                selectedSeats.length ===
                0
            ) {
                toast.error(
                    "Please select at least one seat."
                );

                return;
            }

            if (
                selectedSeats.length > 5
            ) {
                toast.error(
                    "You can select a maximum of 5 seats."
                );

                return;
            }

            const showId =
                selectedTime._id;

            if (!showId) {
                toast.error(
                    "Show ID is missing."
                );

                console.error(
                    "Selected show:",
                    selectedTime
                );

                return;
            }

            const token =
                localStorage.getItem(
                    "userToken"
                ) ||
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                toast.error(
                    "Authentication token not found. Please log in again."
                );

                return;
            }

            setBookingLoading(true);

            const payload = {
                showId: showId,
                selectedSeats:
                    selectedSeats,
                // explicitly include theater, so backend stores it even if show doc lacks it
                theaterId:
                    resolvedTheater?._id ||
                    theaterIdFromState ||
                    undefined,
            };

            console.log(
                "================================="
            );

            console.log(
                "CHECKOUT PAYLOAD:",
                payload
            );

            console.log(
                "User ID:",
                userId
            );

            console.log(
                "Token:",
                token
            );

            console.log(
                "Total Amount:",
                totalAmount
            );

            console.log(
                "Theater:",
                resolvedTheater
            );

            console.log(
                "================================="
            );

            const response =
                await axios.post(
                    "http://localhost:5000/booking/create",
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            console.log(
                "CREATE BOOKING RESPONSE:",
                response.data
            );

            if (
                response.data?.success
            ) {
                toast.success(
                    "Booking created successfully!"
                );

                navigate(
                    "/my-booking",
                    {
                        replace: true,
                    }
                );
            } else {
                toast.error(
                    response.data
                        ?.message ||
                        "Unable to create booking."
                );
            }
        } catch (error) {
            console.error(
                "CHECKOUT ERROR:",
                error
            );

            console.error(
                "CHECKOUT RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data
                    ?.message ||
                    error?.message ||
                    "Unable to create booking."
            );
        } finally {
            setBookingLoading(
                false
            );
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

                    <BlurCircle
                        top="100px"
                        left="0px"
                    />

                    <BlurCircle
                        top="500px"
                        right="0px"
                    />

                    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">

                        <h2 className="text-2xl font-semibold mb-4">
                            No Show Timings Available
                        </h2>

                        <p className="text-gray-400 mb-6 text-center">
                            There are no shows
                            available for{" "}
                            {date}
                            {resolvedTheater?.name
                                ? ` at ${resolvedTheater.name}`
                                : ""}
                            .
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    `/movies/${id}`
                                )
                            }
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

    // =====================================================
    // CURRENT MOVIE
    // =====================================================

    const currentMovie =
        getMovie();

    // =====================================================
    // CURRENT PRICE LIST
    // =====================================================

    const currentPrices =
        getShowPrices(
            selectedTime
        );

    // =====================================================
    // DYNAMIC SEAT TYPES FOR LEGEND
    // =====================================================

    const availableTypes = getAvailableSeatTypes(selectedTime);

    const typeConfig = {
        STANDARD: {
            label: "REGULER",
            color: "bg-gray-500",
            border: "border-gray-500",
        },
        LOVE: {
            label: "GOLD",
            color: "bg-pink-500",
            border: "border-pink-500",
        },
        VIP: {
            label: "PREMIUM",
            color: "bg-yellow-500",
            border: "border-yellow-500",
        },
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">

            <Navbar />

            <main className="flex-1 relative overflow-hidden">

                <BlurCircle
                    top="100px"
                    left="0px"
                />

                <BlurCircle
                    top="500px"
                    right="0px"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10">

                    {/* =====================================
                        BACK BUTTON
                    ===================================== */}

                    <button
                        onClick={() =>
                            navigate(
                                `/movies/${id}`
                            )
                        }
                        className="text-gray-400 hover:text-white transition mb-8"
                    >
                        ← Back to movie
                    </button>

                    {/* =====================================
                        MOVIE TITLE + THEATER INFO
                    ===================================== */}

                    <div className="mb-10">

                        <h1 className="text-2xl sm:text-3xl font-bold">
                            {currentMovie?.title ||
                                currentMovie?.movieName ||
                                "Select your seat"}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-gray-400">
                            <span>{date}</span>

                            {resolvedTheater?.name && (
                                <>
                                    <span className="text-gray-600">•</span>
                                    <span className="flex items-center gap-1.5 text-primary">
                                        <MapPinIcon className="w-4 h-4" />
                                        <span className="font-medium">
                                            {resolvedTheater.name}
                                        </span>
                                        {resolvedTheater.city && (
                                            <span className="text-gray-400">
                                                , {resolvedTheater.city}
                                            </span>
                                        )}
                                    </span>
                                </>
                            )}
                        </div>

                        {resolvedTheater?.address && (
                            <p className="text-xs text-gray-500 mt-1">
                                {resolvedTheater.address}
                            </p>
                        )}

                    </div>

                    {/* =====================================
                        MAIN GRID
                    ===================================== */}

                    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:gap-12">

                        {/* =================================
                            LEFT - AVAILABLE TIMINGS
                        ================================= */}

                        <aside>

                            <div className="border border-gray-800 rounded-xl bg-gray-900/60 p-5 lg:sticky lg:top-24">

                                <h2 className="text-lg font-semibold mb-6">
                                    Available Timings
                                </h2>

                                <div className="space-y-3">

                                    {shows.map(
                                        (show) => {

                                            const isSelected =
                                                selectedTime?._id ===
                                                show._id;

                                            const showPrices =
                                                getShowPrices(
                                                    show
                                                );

                                            return (
                                                <button
                                                    key={
                                                        show._id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleTimeSelect(
                                                            show
                                                        )
                                                    }
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition ${
                                                        isSelected
                                                            ? "border-primary bg-primary/20 text-primary"
                                                            : "border-gray-700 bg-black/40 hover:border-primary hover:bg-primary/10"
                                                    }`}
                                                >

                                                    <ClockIcon className="w-4 h-4 shrink-0" />

                                                    <div>

                                                        <p className="font-medium">
                                                            {formatTime(
                                                                show.showDateTime
                                                            )}
                                                        </p>

                                                        <p className="text-xs text-gray-400 mt-1">
                                                            From Rs.{" "}
                                                            {
                                                                showPrices.standard
                                                            }
                                                        </p>

                                                    </div>

                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                            </div>

                        </aside>

                        {/* =================================
                            RIGHT - SEAT SECTION
                        ================================= */}

                        <section>

                            <h2 className="text-2xl font-bold text-center mb-8">
                                Select your seat
                            </h2>

                            {/* SCREEN */}

                            <div className="max-w-2xl mx-auto mb-12 px-6">

                                <div className="h-5 border-t-8 border-primary rounded-[50%] opacity-70" />

                                <p className="text-center text-gray-500 text-sm mt-3">
                                    SCREEN
                                </p>

                            </div>

                            {/* NO TIME SELECTED */}

                            {!selectedTime ? (
                                <div className="border border-gray-800 rounded-xl p-10 text-center bg-gray-900/30">

                                    <ClockIcon className="w-8 h-8 mx-auto mb-4 text-gray-500" />

                                    <p className="text-gray-400">
                                        Please select a show time from the left.
                                    </p>

                                </div>
                            ) : (
                                <>

                                    {/* SEAT LAYOUT with SECTION LABELS */}

                                    <div className="w-full overflow-x-auto pb-3">

                                        <div className="min-w-162.5 flex flex-col items-center gap-4">

                                            {/* STANDARD SECTION (Rows A-D) */}

                                            <div className="w-full flex justify-start pl-4">
                                                <span className="text-xs font-semibold text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                                                    REGULER
                                                </span>
                                            </div>

                                            {["A", "B"].map(
                                                (row) => (
                                                    <div
                                                        key={row}
                                                        className="flex items-center justify-center"
                                                    >
                                                        <div className="flex gap-2">
                                                            {Array.from(
                                                                { length: 9 },
                                                                (_, index) => {
                                                                    const seat = `${row}${index + 1}`;
                                                                    return (
                                                                        <SeatButton
                                                                            key={seat}
                                                                            seat={seat}
                                                                            occupied={isSeatOccupied(seat)}
                                                                            selected={selectedSeats.includes(seat)}
                                                                            onClick={handleSeatClick}
                                                                            show={selectedTime}
                                                                        />
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            <div className="h-2" />

                                            {["C", "D"].map((row) => (
                                                <div
                                                    key={row}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div className="flex gap-2">
                                                        {Array.from(
                                                            { length: 4 },
                                                            (_, index) => {
                                                                const seat = `${row}${index + 1}`;
                                                                return (
                                                                    <SeatButton
                                                                        key={seat}
                                                                        seat={seat}
                                                                        occupied={isSeatOccupied(seat)}
                                                                        selected={selectedSeats.includes(seat)}
                                                                        onClick={handleSeatClick}
                                                                        show={selectedTime}
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="w-12 sm:w-16" />
                                                    <div className="flex gap-2">
                                                        {Array.from(
                                                            { length: 5 },
                                                            (_, index) => {
                                                                const seatNumber = index + 5;
                                                                const seat = `${row}${seatNumber}`;
                                                                return (
                                                                    <SeatButton
                                                                        key={seat}
                                                                        seat={seat}
                                                                        occupied={isSeatOccupied(seat)}
                                                                        selected={selectedSeats.includes(seat)}
                                                                        onClick={handleSeatClick}
                                                                        show={selectedTime}
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="h-4" />

                                            {/* LOVE SECTION (Rows E-H) */}

                                            <div className="w-full flex justify-start pl-4">
                                                <span className="text-xs font-semibold text-pink-400 bg-pink-900/20 px-3 py-1 rounded-full border border-pink-500/40">
                                                    GOLD
                                                </span>
                                            </div>

                                            {["E", "F", "G", "H"].map((row) => (
                                                <div
                                                    key={row}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div className="flex gap-2">
                                                        {Array.from(
                                                            { length: 4 },
                                                            (_, index) => {
                                                                const seat = `${row}${index + 1}`;
                                                                return (
                                                                    <SeatButton
                                                                        key={seat}
                                                                        seat={seat}
                                                                        occupied={isSeatOccupied(seat)}
                                                                        selected={selectedSeats.includes(seat)}
                                                                        onClick={handleSeatClick}
                                                                        show={selectedTime}
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="w-12 sm:w-16" />
                                                    <div className="flex gap-2">
                                                        {Array.from(
                                                            { length: 5 },
                                                            (_, index) => {
                                                                const seatNumber = index + 5;
                                                                const seat = `${row}${seatNumber}`;
                                                                return (
                                                                    <SeatButton
                                                                        key={seat}
                                                                        seat={seat}
                                                                        occupied={isSeatOccupied(seat)}
                                                                        selected={selectedSeats.includes(seat)}
                                                                        onClick={handleSeatClick}
                                                                        show={selectedTime}
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="h-4" />

                                            {/* VIP SECTION (Rows I-J) */}

                                            <div className="w-full flex justify-start pl-4">
                                                <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-500/40">
                                                    PREMIUM
                                                </span>
                                            </div>

                                            {["I", "J"].map((row) => (
                                                <div
                                                    key={row}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div className="flex gap-2">
                                                        {Array.from(
                                                            { length: 4 },
                                                            (_, index) => {
                                                                const seat = `${row}${index + 1}`;
                                                                return (
                                                                    <SeatButton
                                                                        key={seat}
                                                                        seat={seat}
                                                                        occupied={isSeatOccupied(seat)}
                                                                        selected={selectedSeats.includes(seat)}
                                                                        onClick={handleSeatClick}
                                                                        show={selectedTime}
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="w-12 sm:w-16" />
                                                    <div className="flex gap-2">
                                                        {Array.from(
                                                            { length: 5 },
                                                            (_, index) => {
                                                                const seatNumber = index + 5;
                                                                const seat = `${row}${seatNumber}`;
                                                                return (
                                                                    <SeatButton
                                                                        key={seat}
                                                                        seat={seat}
                                                                        occupied={isSeatOccupied(seat)}
                                                                        selected={selectedSeats.includes(seat)}
                                                                        onClick={handleSeatClick}
                                                                        show={selectedTime}
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                        </div>

                                    </div>

                                    {/* COMBINED LEGEND */}

                                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mt-12 text-sm text-gray-400">

                                        <div className="flex items-center gap-4">
                                            {availableTypes.map((type) => {
                                                const config = typeConfig[type];
                                                if (!config) return null;
                                                return (
                                                    <div key={type} className="flex items-center gap-2">
                                                        <span className={`w-4 h-4 rounded-full ${config.color} border ${config.border}`} />
                                                        <span className="font-medium text-white">{config.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <span className="text-gray-600">|</span>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded border border-gray-700 bg-transparent" />
                                                <span>Available</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded bg-primary" />
                                                <span>Selected</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded bg-gray-700" />
                                                <span>Occupied</span>
                                            </div>
                                        </div>

                                    </div>

                                </>
                            )}

                        </section>

                    </div>

                    {/* =================================================
                        CHECKOUT
                    ================================================= */}

                    <div className="border-t border-gray-800 mt-14 pt-8">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                            <div>

                                <p className="text-gray-400 text-sm">
                                    Selected seats
                                </p>

                                <p className="font-semibold mt-1 text-base">

                                    {selectedSeats.length >
                                    0
                                        ? selectedSeats.join(
                                              ", "
                                          )
                                        : "No seats selected"}

                                </p>

                                {selectedTime && (
                                    <p className="text-gray-400 text-sm mt-2">
                                        Time:{" "}
                                        {formatTime(
                                            selectedTime.showDateTime
                                        )}
                                    </p>
                                )}

                                {resolvedTheater?.name && (
                                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
                                        <MapPinIcon className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-primary font-medium">
                                            {resolvedTheater.name}
                                        </span>
                                        {resolvedTheater.city && (
                                            <span>, {resolvedTheater.city}</span>
                                        )}
                                    </p>
                                )}

                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                                <div className="text-left sm:text-right">

                                    <p className="text-gray-400 text-sm">
                                        Total
                                    </p>

                                    <p className="text-2xl font-bold">
                                        Rs.{" "}
                                        {totalAmount}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleCheckout
                                    }
                                    disabled={
                                        bookingLoading ||
                                        !selectedTime ||
                                        selectedSeats.length ===
                                            0
                                    }
                                    className="px-6 py-3 rounded-lg bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dull transition"
                                >

                                    {bookingLoading
                                        ? "Processing..."
                                        : "Proceed to Checkout"}

                                    {!bookingLoading && (
                                        <ArrowRightIcon className="w-5 h-5" />
                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

            <Footer />

        </div>
    );
};

export default SeatLayout;