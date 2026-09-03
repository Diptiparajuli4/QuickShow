import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import SeatLayout from "./pages/SeatLayout";
import MyBooking from "./pages/MyBooking";
import Favorite from "./pages/Favorite";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import {
    Routes,
    Route,
    useLocation,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

// =====================================================
// IMPORT TOASTER
// =====================================================

import { Toaster } from 'react-hot-toast';

// =====================================================
// ADMIN PAGES
// =====================================================

import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListBookings from "./pages/admin/ListBookings";
import ListShows from "./pages/admin/ListShows";
import Layout from "./pages/admin/Layout";

import { useAuth } from "./context/AuthContext";


// =====================================================
// APP
// =====================================================

const App = () => {

    const { pathname } = useLocation();

    // =================================================
    // CHECK ADMIN ROUTE
    // =================================================

    const isAdminRoute =
        pathname.startsWith("/admin");


    // =================================================
    // AUTH DATA
    // =================================================

    const {
        user,
        admin,
        loading,
    } = useAuth();


    // =================================================
    // ADMIN CHECK
    // =================================================

    const isAdmin =
        admin?.role === "admin";


    // =================================================
    // WAIT FOR AUTH
    // =================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">

                <p className="text-gray-400">
                    Loading...
                </p>

            </div>
        );
    }


    // =================================================
    // PAGE
    // =================================================

    return (
        <>

            {/* ================================================= */}
            {/* TOASTER - Add this at the top level */}
            {/* ================================================= */}

            <Toaster 
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '16px',
                        borderRadius: '8px',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#4ade80',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* ================================================= */}
            {/* NAVBAR */}
            {/* ================================================= */}

            {!isAdminRoute && <Navbar />}


            {/* ================================================= */}
            {/* ROUTES */}
            {/* ================================================= */}

            <Routes>

                {/* ================================================= */}
                {/* HOME */}
                {/* ================================================= */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/home"
                    element={<Home />}
                />


                {/* ================================================= */}
                {/* MOVIES */}
                {/* ================================================= */}

                <Route
                    path="/movies"
                    element={<Movies />}
                />

                <Route
                    path="/movies/:id"
                    element={<MovieDetail />}
                />


                {/* ================================================= */}
                {/* SEAT LAYOUT */}
                {/* ================================================= */}

                <Route 
                    path="/movies/:id/:date" 
                    element={<SeatLayout />} 
                />


                {/* ================================================= */}
                {/* MY BOOKINGS */}
                {/* ================================================= */}

                <Route
                    path="/my-booking"
                    element={
                      
                            <MyBooking />
                      
                    }
                />


                {/* ================================================= */}
                {/* FAVORITES */}
                {/* ================================================= */}

                <Route
                    path="/favorite"
                    element={
                        <ProtectedRoute>
                            <Favorite />
                        </ProtectedRoute>
                    }
                />


                {/* ================================================= */}
                {/* PROFILE */}
                {/* ================================================= */}

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />


                {/* ================================================= */}
                {/* LOGIN */}
                {/* ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ================================================= */}
                {/* SIGNUP */}
                {/* ================================================= */}

                <Route
                    path="/signup"
                    element={<Signup />}
                />


                {/* ================================================= */}
                {/* ADMIN */}
                {/* ================================================= */}

                <Route
                    path="/admin/*"
                    element={

                        isAdmin ? (

                            <Layout />

                        ) : (

                            <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white px-4">

                                <h1 className="text-2xl font-bold mb-4">
                                    Admin Access Required
                                </h1>

                                <p className="text-gray-400 mb-6 text-center">
                                    Please login with an administrator account.
                                </p>

                                <a
                                    href="/login"
                                    className="px-6 py-3 bg-primary rounded-lg font-semibold hover:bg-primary-dull transition"
                                >
                                    Go to Login
                                </a>

                            </div>

                        )
                    }
                >

                    {/* ADMIN DASHBOARD */}

                    <Route
                        index
                        element={<Dashboard />}
                    />


                    {/* ADD SHOWS */}

                    <Route
                        path="add-shows"
                        element={<AddShows />}
                    />


                    {/* LIST SHOWS */}

                    <Route
                        path="list-shows"
                        element={<ListShows />}
                    />


                    {/* LIST BOOKINGS */}

                    <Route
                        path="list-bookings"
                        element={<ListBookings />}
                    />

                </Route>

            </Routes>


            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            {!isAdminRoute && <Footer />}

        </>
    );
};


export default App;