import Theater from "../models/Theater.js";

// Seed initial theaters if the database is empty
export const seedTheaters = async () => {
    try {
        const count = await Theater.countDocuments();
        if (count === 0) {
            await Theater.insertMany([
                {
                    name: "QuickShow Cinema Lalitpur",
                    address: "Pulchowk Road",
                    city: "Lalitpur",
                    location: {
                        type: "Point",
                        coordinates: [85.3123, 27.6782] // [longitude, latitude]
                    }
                },
                {
                    name: "QuickShow Multiplex Kathmandu",
                    address: "Durbar Marg",
                    city: "Kathmandu",
                    location: {
                        type: "Point",
                        coordinates: [85.3188, 27.7089]
                    }
                }
            ]);
            console.log("Sample theaters seeded successfully!");
        }
    } catch (error) {
        console.error("Error seeding theaters:", error);
    }
};

// Get nearby theaters based on coordinates
export const getNearbyTheaters = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
        }

        const theaters = await Theater.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 10000 // 10km radius
                }
            }
        });

        res.status(200).json({ success: true, theaters });
    } catch (error) {
        console.error("Error fetching nearby theaters:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};