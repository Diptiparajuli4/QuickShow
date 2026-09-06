import React, { useEffect, useState } from "react";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";   // ✅ correct import

const Favorite = () => {
    // ✅ Correctly destructure both user and userToken
    const { user, userToken } = useAuth();

    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchFavoriteMovies();
        // eslint-disable-next-line
    }, [userToken, user]);

    const fetchFavoriteMovies = async () => {
        try {
            setLoading(true);
            setError("");

            // ✅ use userToken from context
            if (!userToken || !user) {
                setError("Please login.");
                setLoading(false);
                return;
            }

            // 1. Get user's favourites
            const userRes = await fetch("http://localhost:5000/user/me", {
                headers: { Authorization: `Bearer ${userToken}` },
            });

            if (!userRes.ok) {
                throw new Error(`/user/me failed: ${userRes.status}`);
            }

            const userData = await userRes.json();
            const favouriteIds = userData.user?.favourites || [];

            if (favouriteIds.length === 0) {
                setError("No favourites yet.");
                setLoading(false);
                return;
            }

            // 2. Get all shows to map movie details
            const moviesRes = await fetch("http://localhost:5000/show/all", {
                headers: { Authorization: `Bearer ${userToken}` },
            });

            if (!moviesRes.ok) {
                throw new Error(`/show/all failed: ${moviesRes.status}`);
            }

            const moviesData = await moviesRes.json();
            const shows = moviesData.shows || [];

            const movieMap = new Map();
            shows.forEach((show) => {
                if (show.movie && show.movie._id) {
                    const id = String(show.movie._id);
                    if (!movieMap.has(id)) {
                        movieMap.set(id, show.movie);
                    }
                }
            });

            const matched = [];
            favouriteIds.forEach((id) => {
                const movie = movieMap.get(String(id));
                if (movie) matched.push(movie);
            });

            setFavoriteMovies(matched);
            if (matched.length === 0) {
                setError("Favourite movies not found in database.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // -------- Render --------
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loading />
                    <p className="text-gray-400 mt-2">Loading favourites...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (!userToken || !user) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center px-6">
                    <h1 className="text-3xl font-bold text-center">Please login</h1>
                    <button
                        onClick={() => (window.location.href = "/login")}
                        className="mt-6 px-6 py-2 bg-primary rounded-lg"
                    >
                        Login
                    </button>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md w-full">
                        <h1 className="text-2xl font-bold text-red-400 text-center">Error</h1>
                        <p className="text-gray-300 mt-3 text-center">{error}</p>
                        <button
                            onClick={fetchFavoriteMovies}
                            className="mt-6 w-full px-6 py-2 bg-primary rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (favoriteMovies.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 relative overflow-hidden px-4 py-10 md:px-16 lg:px-40">
                    <BlurCircle top="150px" left="0px" />
                    <BlurCircle bottom="50px" right="50px" />
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                        <h1 className="text-3xl font-bold text-center">No favourite movies</h1>
                        <p className="text-gray-400 mt-3 text-center">
                            Movies you add to favourites will appear here.
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <main className="flex-1 relative overflow-hidden px-4 py-10 md:px-16 lg:px-40">
                <BlurCircle top="150px" left="0px" />
                <BlurCircle bottom="50px" right="50px" />

                <h1 className="text-2xl font-medium my-8">My Favourite Movies</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {favoriteMovies.map((movie) => (
                        <MovieCard key={String(movie._id)} movie={movie} />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Favorite;