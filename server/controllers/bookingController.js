import Booking from "../models/Booking.js";
import Show from "../models/Show.js";


// =====================================================
// CHECK SEAT AVAILABILITY
// =====================================================

const checkSeatsAvailability = async (
    showId,
    selectedSeats
) => {

    try {

        const showData =
            await Show.findById(showId);

        if (!showData) {
            return false;
        }


        const occupiedSeats =
            showData.occupiedSeats || {};


        const isAnySeatTaken =
            selectedSeats.some(
                (seat) =>
                    occupiedSeats[seat]
            );


        return !isAnySeatTaken;

    } catch (error) {

        console.error(
            "Seat availability error:",
            error.message
        );

        return false;
    }
};


// =====================================================
// CREATE BOOKING
// POST /booking/create
// =====================================================

export const createBooking = async (
    req,
    res
) => {

    try {

        console.log(
            "======================================"
        );

        console.log(
            "CREATE BOOKING REQUEST"
        );

        console.log(
            "Request body:",
            req.body
        );


        // =================================================
        // GET USER ID
        // =================================================

        let userId;


        /*
            If you are using Clerk authentication,
            req.auth is normally a function.

            Example:
            const { userId } = req.auth();
        */

        if (
            req.auth &&
            typeof req.auth === "function"
        ) {

            const authData =
                req.auth();

            userId =
                authData?.userId;

        }

        /*
            This also supports middleware that
            stores userId directly in req.userId.
        */

        if (!userId) {

            userId =
                req.userId ||
                req.user?.id ||
                req.user?._id;
        }


        // =================================================
        // CHECK USER
        // =================================================

        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User is not authenticated."
            });
        }


        // =================================================
        // GET REQUEST DATA
        // =================================================

        const {
            showId,
            selectedSeats
        } = req.body;


        // =================================================
        // VALIDATE SHOW ID
        // =================================================

        if (!showId) {

            return res.status(400).json({

                success: false,

                message:
                    "Show ID is required."
            });
        }


        // =================================================
        // VALIDATE SEATS
        // =================================================

        if (
            !Array.isArray(
                selectedSeats
            ) ||
            selectedSeats.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please select at least one seat."
            });
        }


        // =================================================
        // REMOVE DUPLICATE SEATS
        // =================================================

        const uniqueSeats = [
            ...new Set(
                selectedSeats.map(
                    (seat) => String(seat)
                )
            )
        ];


        // =================================================
        // CHECK SEAT AVAILABILITY
        // =================================================

        const isAvailable =
            await checkSeatsAvailability(
                showId,
                uniqueSeats
            );


        if (!isAvailable) {

            return res.status(409).json({

                success: false,

                message:
                    "One or more selected seats are already booked."
            });
        }


        // =================================================
        // GET SHOW
        // =================================================

        const showData =
            await Show.findById(showId)
                .populate("movie");


        if (!showData) {

            return res.status(404).json({

                success: false,

                message:
                    "Show not found."
            });
        }


        // =================================================
        // CALCULATE AMOUNT
        // =================================================

        const showPrice =
            Number(
                showData.showPrice
            );


        if (
            !Number.isFinite(showPrice) ||
            showPrice <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid show price."
            });
        }


        const totalAmount =
            showPrice *
            uniqueSeats.length;


        // =================================================
        // CREATE BOOKING
        // =================================================

        const booking =
            await Booking.create({

                user:
                    String(userId),

                show:
                    String(showId),

                amount:
                    totalAmount,

                bookedSeats:
                    uniqueSeats,

                isPaid:
                    false
            });


        // =================================================
        // UPDATE OCCUPIED SEATS
        // =================================================

        if (
            !showData.occupiedSeats
        ) {

            showData.occupiedSeats = {};
        }


        uniqueSeats.forEach(
            (seat) => {

                showData.occupiedSeats[
                    seat
                ] = String(userId);

            }
        );


        showData.markModified(
            "occupiedSeats"
        );


        await showData.save();


        // =================================================
        // POPULATE BOOKING FOR RESPONSE
        // =================================================

        const populatedBooking =
            await Booking.findById(
                booking._id
            )
                .populate({
                    path: "show",
                    populate: {
                        path: "movie"
                    }
                });


        // =================================================
        // SUCCESS
        // =================================================

        console.log(
            "Booking created successfully:",
            booking._id
        );


        console.log(
            "Movie:",
            showData.movie?.title
        );


        console.log(
            "Seats:",
            uniqueSeats
        );


        console.log(
            "Amount:",
            totalAmount
        );


        console.log(
            "======================================"
        );


        return res.status(201).json({

            success: true,

            message:
                "Booked successfully.",

            booking:
                populatedBooking
        });


    } catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "CREATE BOOKING ERROR"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to create booking."
        });
    }
};



// =====================================================
// GET OCCUPIED SEATS
// GET /booking/seats/:showId
// =====================================================

export const getOccupiedSeats = async (
    req,
    res
) => {

    try {

        const {
            showId
        } = req.params;


        // =================================================
        // CHECK SHOW ID
        // =================================================

        if (!showId) {

            return res.status(400).json({

                success: false,

                message:
                    "Show ID is required."
            });
        }


        // =================================================
        // GET SHOW
        // =================================================

        const showData =
            await Show.findById(
                showId
            );


        if (!showData) {

            return res.status(404).json({

                success: false,

                message:
                    "Show not found."
            });
        }


        // =================================================
        // GET OCCUPIED SEATS
        // =================================================

        const occupiedSeats =
            Object.keys(
                showData.occupiedSeats || {}
            );


        return res.status(200).json({

            success: true,

            occupiedSeats
        });


    } catch (error) {

        console.error(
            "Get Occupied Seats Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};



// =====================================================
// GET ALL BOOKINGS
// GET /booking/all
// =====================================================

export const getAllBookings = async (
    req,
    res
) => {

    try {

        console.log(
            "Getting all bookings..."
        );


        /*
            Booking.show contains Show._id.

            Show.movie contains Movie._id.

            Therefore we populate:

            Booking
                 ↓
               show
                 ↓
               movie
        */

        const bookings =
            await Booking.find()
                .populate({
                    path: "show",
                    populate: {
                        path: "movie"
                    }
                })
                .sort({
                    createdAt: -1
                });


        console.log(
            "Total bookings:",
            bookings.length
        );


        return res.status(200).json({

            success: true,

            bookings
        });


    } catch (error) {

        console.error(
            "Get All Bookings Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};



// =====================================================
// GET ONE BOOKING
// GET /booking/:bookingId
// =====================================================

export const getBookingById = async (
    req,
    res
) => {

    try {

        const {
            bookingId
        } = req.params;


        if (!bookingId) {

            return res.status(400).json({

                success: false,

                message:
                    "Booking ID is required."
            });
        }


        const booking =
            await Booking.findById(
                bookingId
            )
                .populate({
                    path: "show",
                    populate: {
                        path: "movie"
                    }
                });


        if (!booking) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found."
            });
        }


        return res.status(200).json({

            success: true,

            booking
        });


    } catch (error) {

        console.error(
            "Get Booking Error:",
            error
        );


        return res.status(5000).json({

            success: false,

            message:
                error.message
        });
    }
};