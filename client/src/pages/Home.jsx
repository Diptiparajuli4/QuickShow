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
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(false);

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

    // -------- Find nearby theaters (triggers permission prompt) --------
    const findNearbyTheaters = () => {
        if (!navigator.geolocation) {
            setLocationError(true);
            return;
        }

        setLoading(true);
        setLocationError(false);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLocation({ lat, lng });

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
                    // If nearby API fails but we have coords, we can still show all with distance
                    fetchAllTheaters({ lat, lng });
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.warn("Geolocation error (likely denied):", error.message);
                setLocationError(true);
                setLoading(false);
                // Do NOT auto-fetch all theaters – let the user choose.
            }
        );
    };

    // -------- Show all theaters (manual fallback) --------
    const showAllTheaters = async () => {
        setLocationError(false);
        await fetchAllTheaters(null);
    };

    // -------- Fetch all theaters (internal) --------
    const fetchAllTheaters = async (userCoords) => {
        try {
            const res = await axios.get("http://localhost:5000/theater/all");
            let theaterList = res.data.theaters || [];
            if (userCoords) {
                theaterList = theaterList.map((theater) => ({
                    ...theater,
                    distance: getDistanceFromLatLonInKm(
                        userCoords.lat,
                        userCoords.lng,
                        theater.latitude || 0,
                        theater.longitude || 0
                    ),
                }));
                theaterList.sort((a, b) => a.distance - b.distance);
            }
            setTheaters(theaterList);
            setHasSearched(true);
        } catch (err) {
            console.error("Error fetching all theaters:", err);
            setTheaters([]);
            setHasSearched(true);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <HeroSection />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Find Movie Centers Near You</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {hasSearched && theaters.length === 0
                                    ? "No theaters found."
                                    : "Discover cinema halls around your current location instantly."}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={findNearbyTheaters}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center gap-2 whitespace-nowrap"
                                disabled={loading}
                            >
                                {loading ? "Locating..." : "📍 Find Cinemas Near Me"}
                            </button>
                            <button 
                                onClick={showAllTheaters}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center gap-2 whitespace-nowrap"
                            >
                                📋 Show All Theaters
                            </button>
                        </div>
                    </div>

                    {locationError && (
                        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Location access is required to find nearby theaters. 
                                Please allow location in your browser settings or click the button below to try again.
                            </p>
                            <button
                                onClick={findNearbyTheaters}
                                className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                disabled={loading}
                            >
                                {loading ? "Retrying..." : "🔄 Retry Location"}
                            </button>
                            <button
                                onClick={showAllTheaters}
                                className="mt-2 ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                                📋 Show All Theaters
                            </button>
                        </div>
                    )}

                    {hasSearched && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {theaters.length > 0 ? (
                                theaters.map((theater) => (
                                    <div key={theater._id} className="bg-gray-800/80 border border-gray-700/50 p-4 rounded-xl shadow">
                                        <h3 className="font-bold text-lg text-white">{theater.name}</h3>
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
                                    {loading ? "Searching..." : "No theaters found."}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <FeaturedSection />
            <TrailerSection />
        </div>
    );
};

export default Home;