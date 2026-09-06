import React, { useState } from "react";
import axios from "axios";
import HeroSection from "../components/HeroSection";
import FeaturedSection from "../components/FeaturedSection";
import TrailerSection from "../components/TrailerSection";

const Home = () => {
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const findNearbyTheaters = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                try {
                    const res = await axios.get(`http://localhost:5000/theater/nearby?longitude=${lng}&latitude=${lat}`);
                    setTheaters(res.data.theaters);
                    setHasSearched(true);
                } catch (err) {
                    console.error("Error fetching nearby theaters", err);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                alert("Permission denied or location unavailable.");
                setLoading(false);
            }
        );
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <HeroSection />
            
            {/* ================================================= */}
            {/* NEARBY CINEMAS FEATURE SECTION */}
            {/* ================================================= */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Find Movie Centers Near You</h2>
                            <p className="text-gray-400 text-sm mt-1">Discover cinema halls around your current location instantly.</p>
                        </div>
                        <button 
                            onClick={findNearbyTheaters}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg flex items-center gap-2 whitespace-nowrap"
                        >
                            {loading ? "Locating..." : "📍 Find Cinemas Near Me"}
                        </button>
                    </div>

                    {hasSearched && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {theaters.length > 0 ? (
                                theaters.map((theater) => (
                                    <div key={theater._id} className="bg-gray-800/80 border border-gray-700/50 p-4 rounded-xl shadow">
                                        <h3 className="font-bold text-lg text-white">{theater.name}</h3>
                                        <p className="text-sm text-gray-300 mt-1">{theater.address}, {theater.city}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm col-span-full">No theaters found within a 10km radius of your location.</p>
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