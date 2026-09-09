import React, { useState, useCallback } from "react";
import axios from "axios";
import HeroSection from "../components/HeroSection";
import FeaturedSection from "../components/FeaturedSection";
import TrailerSection from "../components/TrailerSection";
import { useAutoRefresh } from "../context/RefreshContext";

// -------- helper: compute distance between two coordinates (km) --------
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const Home = () => {
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [locationError, setLocationError] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const [movies, setMovies] = useState([]);

    const fetchMovies = useCallback(async () => {
        try {
            const res = await axios.get("http://localhost:5000/show/all");
            if (res.data?.shows) {
                const movieMap = new Map();
                res.data.shows.forEach((show) => {
                    if (show.movie && show.movie._id && !movieMap.has(show.movie._id)) {
                        movieMap.set(show.movie._id, show.movie);
                    }
                });
                setMovies(Array.from(movieMap.values()));
            }
        } catch (err) {
            console.error("Error fetching movies:", err);
        }
    }, []);

    useAutoRefresh(fetchMovies, []);

    // -------- Attempt to get location --------
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(true);
            setShowSettingsModal(true);
            return;
        }

        setLoading(true);
        setLocationError(false);
        setShowSettingsModal(false);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                try {
                    const res = await axios.get(
                        `http://localhost:5000/theater/nearby?longitude=${lng}&latitude=${lat}`
                    );
                    const theatersWithDistance = (res.data.theaters || []).map((theater) => ({
                        ...theater,
                        distance: getDistanceFromLatLonInKm(
                            lat,
                            lng,
                            theater.latitude || 0,
                            theater.longitude || 0
                        ),
                    }));
                    setTheaters(theatersWithDistance);
                    setHasSearched(true);
                } catch (err) {
                    console.error("Error fetching nearby theaters:", err);
                    alert("Could not fetch theaters. Please try again.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.warn("Geolocation error:", error.message);
                setLocationError(true);
                setLoading(false);
                // Show modal with "Open Settings" option
                setShowSettingsModal(true);
            }
        );
    };

    // -------- Open Windows location settings --------
    const openSystemSettings = () => {
        // Works on Windows 10/11 with Edge/Chrome (may be blocked by some browsers)
        window.open("ms-settings:privacy-location", "_blank");
        // Also try the old URI for compatibility
        window.open("ms-settings:privacy-location", "_self");
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <HeroSection />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Find Movie Centers Near You
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {hasSearched && theaters.length === 0
                                    ? "No theaters found nearby."
                                    : "Allow location to see nearby cinemas."}
                            </p>
                        </div>
                        <button
                            onClick={requestLocation}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center gap-2 whitespace-nowrap"
                            disabled={loading}
                        >
                            {loading ? "Locating..." : "📍 Find Cinemas Near Me"}
                        </button>
                    </div>

                    {locationError && !showSettingsModal && (
                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Location access is required. Please allow location in your browser settings.
                            </p>
                            <button
                                onClick={requestLocation}
                                className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                disabled={loading}
                            >
                                {loading ? "Retrying..." : "🔄 Retry Location"}
                            </button>
                        </div>
                    )}

                    {hasSearched && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {theaters.length > 0 ? (
                                theaters.map((theater) => (
                                    <div
                                        key={theater._id}
                                        className="bg-gray-800/80 border border-gray-700/50 p-4 rounded-xl shadow"
                                    >
                                        <h3 className="font-bold text-lg text-white">
                                            {theater.name}
                                        </h3>
                                        <p className="text-sm text-gray-300 mt-1">
                                            {theater.address}, {theater.city}
                                        </p>
                                        {theater.distance !== undefined && (
                                            <p className="text-xs text-primary mt-1">
                                                📍 {theater.distance.toFixed(1)} km away
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm col-span-full">
                                    No theaters found within 10 km.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* -------- Custom Modal for System Settings -------- */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">
                            🌍 Location Access Required
                        </h3>
                        <p className="text-gray-300 text-sm mb-4">
                            To find nearby theaters, please enable location access in your system settings.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={openSystemSettings}
                                className="bg-primary hover:bg-primary/80 text-white py-2.5 rounded-lg font-medium transition"
                            >
                                ⚙️ Open Settings
                            </button>
                            <button
                                onClick={() => {
                                    setShowSettingsModal(false);
                                    requestLocation();
                                }}
                                className="bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-medium transition"
                            >
                                🔄 Retry
                            </button>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="text-gray-400 hover:text-white text-sm transition"
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            After enabling, click <strong>Retry</strong> to search again.
                        </p>
                    </div>
                </div>
            )}

            <FeaturedSection />
            <TrailerSection />
        </div>
    );
};

export default Home;