import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";


// Get user bookings
export const getUserBookings = async (req, res) => {
    try {

        // User id comes from JWT middleware
        const userId = req.user.id;


        const bookings = await Booking.find({
            user: userId
        })
        .populate({
            path: "show",
            populate: {
                path: "movie"
            }
        })
        .sort({ createdAt: -1 });



        res.json({
            success: true,
            bookings
        });


    } catch (error) {

        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });

    }
};




// Add or remove favourite movie
export const updateFavourites = async (req, res) => {
    try {

        const userId = req.user.id;

        const { movieId } = req.body;


        const user = await User.findById(userId);


        if (!user) {

            return res.json({
                success: false,
                message: "User not found"
            });

        }



        // Add movie if not already favourite
        if (!user.favourites.includes(movieId)) {

            user.favourites.push(movieId);

        } 
        // Remove movie if already favourite
        else {

            user.favourites = user.favourites.filter(
                (id) => id.toString() !== movieId
            );

        }



        await user.save();



        res.json({

            success: true,

            message: "Favourite movies updated successfully"

        });



    } catch (error) {

        console.log(error.message);


        res.json({

            success: false,

            message: error.message

        });

    }
};




// Get favourite movies
export const getFavourites = async (req, res) => {

    try {

        const userId = req.user.id;


        const user = await User.findById(userId);



        if (!user) {

            return res.json({

                success:false,

                message:"User not found"

            });

        }



        const movies = await Movie.find({

            _id: {
                $in: user.favourites
            }

        });



        res.json({

            success:true,

            movies

        });



    } catch (error) {


        console.log(error.message);


        res.json({

            success:false,

            message:error.message

        });

    }
};