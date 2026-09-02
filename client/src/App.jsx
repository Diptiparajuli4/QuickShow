
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Profile from './pages/Profile'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetail from './pages/MovieDetail'
import SeatLayout from './pages/SeatLayout'
import MyBooking from './pages/MyBooking'
import Favorite from './pages/Favorite'
import Login from './pages/Login'
import Signup from './pages/Signup'

import {
    Routes,
    Route,
    useLocation
} from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'

import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListBookings from './pages/admin/ListBookings'
import ListShows from './pages/admin/ListShows'
import Layout from './pages/admin/Layout'

import { useAuth } from './context/AuthContext'


const App = () => {

    const { pathname } = useLocation()


    // =====================================================
    // CHECK ADMIN ROUTE
    // =====================================================

    const isAdminRoute =
        pathname.startsWith('/admin')


    // =====================================================
    // GET AUTH DATA
    // =====================================================

    const {
        user,
        admin,
        loading
    } = useAuth()


    // =====================================================
    // ADMIN CHECK
    // =====================================================

    const isAdmin =
        admin?.role === 'admin'


    // =====================================================
    // WAIT FOR AUTHENTICATION TO LOAD
    // =====================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">

                <p className="text-gray-400">
                    Loading...
                </p>

            </div>
        )

    }


    return (
        <>

            {/* ================================================= */}
            {/* NAVBAR FOR NORMAL USER PAGES */}
            {/* ================================================= */}

            {!isAdminRoute && <Navbar />}


            <Routes>


                {/* ================================================= */}
                {/* NORMAL USER PAGES */}
                {/* ================================================= */}

                <Route
                    path="/"
                    element={<Home />}
                />


                <Route
                    path="/home"
                    element={<Home />}
                />


                <Route
                    path="/movies"
                    element={<Movies />}
                />


                <Route
                    path="/movies/:id"
                    element={<MovieDetail />}
                />


                <Route
                    path="/movies/:id/:date"
                    element={
                        <ProtectedRoute>
                            <SeatLayout />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/my-booking"
                    element={
                        <ProtectedRoute>
                            <MyBooking />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/favorite"
                    element={
                        <ProtectedRoute>
                            <Favorite />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />


                {/* ================================================= */}
                {/* LOGIN / SIGNUP */}
                {/* ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                <Route
                    path="/signup"
                    element={<Signup />}
                />


                {/* ================================================= */}
                {/* ADMIN ROUTES */}
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

                    <Route
                        index
                        element={<Dashboard />}
                    />


                    <Route
                        path="add-shows"
                        element={<AddShows />}
                    />


                    <Route
                        path="list-shows"
                        element={<ListShows />}
                    />


                    <Route
                        path="list-bookings"
                        element={<ListBookings />}
                    />

                </Route>


            </Routes>


            {/* ================================================= */}
            {/* FOOTER FOR NORMAL USER PAGES */}
            {/* ================================================= */}

            {!isAdminRoute && <Footer />}

        </>
    )
}


export default App
