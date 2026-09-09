import Theater from "../models/Theater.js";

// =====================================================
// SEED THEATERS (if empty)
// =====================================================
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
                        coordinates: [85.3123, 27.6782], // [longitude, latitude]
                    },
                    latitude: 27.6782,
                    longitude: 85.3123,
                },
                {
                    name: "QuickShow Multiplex Kathmandu",
                    address: "Durbar Marg",
                    city: "Kathmandu",
                    location: {
                        type: "Point",
                        coordinates: [85.3188, 27.7089],
                    },
                    latitude: 27.7089,
                    longitude: 85.3188,
                },
            ]);
            console.log("✅ Sample theaters seeded successfully!");
        }
    } catch (error) {
        console.error("❌ Error seeding theaters:", error);
    }
};

// =====================================================
// GET NEARBY THEATERS
// =====================================================
export const getNearbyTheaters = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required",
            });
        }

        const theaters = await Theater.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)],
                    },
                    $maxDistance: 10000, // 10km radius
                },
            },
        });

        res.status(200).json({
            success: true,
            theaters,
        });
    } catch (error) {
        console.error("Error fetching nearby theaters:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// =====================================================
// GET ALL THEATERS
// =====================================================
export const getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find().sort({ name: 1 });
        return res.status(200).json({
            success: true,
            theaters,
        });
    } catch (error) {
        console.error("Get All Theaters Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// GET THEATER BY ID
// =====================================================
export const getTheaterById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Theater ID is required",
            });
        }

        const theater = await Theater.findById(id);
        if (!theater) {
            return res.status(404).json({
                success: false,
                message: "Theater not found",
            });
        }

        return res.status(200).json({
            success: true,
            theater,
        });
    } catch (error) {
        console.error("Get Theater By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// ADD THEATER
// =====================================================
export const addTheater = async (req, res) => {
    try {
        const { name, city, address, latitude, longitude, phone, email, image } = req.body;

        // -------- validation --------
        if (!name || !city || !address) {
            return res.status(400).json({
                success: false,
                message: "Name, city, and address are required",
            });
        }

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required",
            });
        }

        // -------- build location object --------
        const location = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
        };

        const theater = await Theater.create({
            name,
            city,
            address,
            location,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            phone: phone || "",
            email: email || "",
            image: image || "",
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            message: "Theater added successfully",
            theater,
        });
    } catch (error) {
        console.error("Add Theater Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// UPDATE THEATER
// =====================================================
export const updateTheater = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Theater ID is required",
            });
        }

        // If latitude/longitude are provided, update location as well
        if (updates.latitude !== undefined && updates.longitude !== undefined) {
            updates.location = {
                type: "Point",
                coordinates: [parseFloat(updates.longitude), parseFloat(updates.latitude)],
            };
        }

        const theater = await Theater.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!theater) {
            return res.status(404).json({
                success: false,
                message: "Theater not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Theater updated successfully",
            theater,
        });
    } catch (error) {
        console.error("Update Theater Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =====================================================
// DELETE THEATER
// =====================================================
export const deleteTheater = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Theater ID is required",
            });
        }

        const theater = await Theater.findByIdAndDelete(id);

        if (!theater) {
            return res.status(404).json({
                success: false,
                message: "Theater not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Theater deleted successfully",
            theater,
        });
    } catch (error) {
        console.error("Delete Theater Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};