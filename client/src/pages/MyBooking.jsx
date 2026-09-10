import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import BlurCircle from "../components/BlurCircle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

import { MapPin } from "lucide-react";

// =====================================================
// STRIPE PUBLISHABLE KEY (from .env)
// =====================================================
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// =====================================================
// STRIPE PAYMENT FORM (embedded in sidebar)
// =====================================================
const StripePaymentForm = ({ bookingId, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [stripeReady, setStripeReady] = useState(false);

    useEffect(() => {
        if (stripe && elements) {
            setStripeReady(true);
        }
    }, [stripe, elements]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            toast.error("Stripe is not ready. Please try again.");
            return;
        }
        setLoading(true);

        try {
            let rawToken = localStorage.getItem("userToken") || localStorage.getItem("token");
            if (!rawToken) {
                toast.error("Please log in to proceed.");
                setLoading(false);
                return;
            }
            const cleanToken = rawToken
                .replace(/^"(.*)"$/, "$1")
                .replace(/^Bearer\s+/i, "")
                .trim();

            const response = await axios.post(
                `http://localhost:5000/booking/stripe/create-payment-intent/${bookingId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${cleanToken}` },
                }
            );

            if (!response.data?.success) {
                toast.error(response.data?.message || "Failed to initialize payment.");
                setLoading(false);
                return;
            }

            const { clientSecret } = response.data;

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                toast.error("Card element not found. Please refresh and try again.");
                setLoading(false);
                return;
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {},
                },
            });

            if (error) {
                toast.error(error.message);
                setLoading(false);
                return;
            }

            if (paymentIntent.status === "succeeded") {
                const verifyResponse = await axios.post(
                    "http://localhost:5000/booking/stripe/verify-payment-intent",
                    {
                        paymentIntentId: paymentIntent.id,
                        bookingId: bookingId,
                    },
                    {
                        headers: { Authorization: `Bearer ${cleanToken}` },
                    }
                );

                if (verifyResponse.data?.success) {
                    toast.success("Payment successful!");
                    onSuccess();
                } else {
                    toast.error(verifyResponse.data?.message || "Payment verification failed.");
                }
            } else {
                toast.error("Payment not completed. Status: " + paymentIntent.status);
            }
        } catch (err) {
            console.error("Payment error:", err);
            toast.error(err?.response?.data?.message || "Payment failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!stripeReady) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Loading Stripe...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <CardElement
                    options={{
                        style: {
                            base: {
                                color: "#fff",
                                fontSize: "16px",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                                "::placeholder": { color: "#aab7c4" },
                                padding: "10px",
                            },
                            invalid: { color: "#fa755a" },
                        },
                        hidePostalCode: true,
                    }}
                />
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="flex-1 bg-primary hover:bg-primary/80 disabled:opacity-50 py-2 rounded-lg font-semibold transition"
                >
                    {loading ? "Processing..." : "Pay Now"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                    Cancel
                </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
                Secured by Stripe. Your card details are not stored.
            </p>
        </form>
    );
};

// =====================================================
// HELPERS
// =====================================================
const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d)) return "Invalid Date";
    return d.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

// =====================================================
// RESOLVE THEATER INFO from a booking
// =====================================================
const resolveTheaterFromBooking = (booking) => {
    if (!booking) return null;

    // 1. Booking has a populated show with theaterId (object)
    const show = booking.show;
    if (show?.theaterId && typeof show.theaterId === "object") {
        return {
            name: show.theaterId.name || "",
            city: show.theaterId.city || "",
            address: show.theaterId.address || "",
        };
    }

    // 2. Show has flat denormalized theater fields
    if (show?.theaterName) {
        return {
            name: show.theaterName,
            city: show.theaterCity || "",
            address: show.theaterAddress || "",
        };
    }

    // 3. Booking has flat theater fields
    if (booking.theaterName) {
        return {
            name: booking.theaterName,
            city: booking.theaterCity || "",
            address: booking.theaterAddress || "",
        };
    }

    // 4. Booking has populated theater object
    if (booking.theater && typeof booking.theater === "object") {
        return {
            name: booking.theater.name || "",
            city: booking.theater.city || "",
            address: booking.theater.address || "",
        };
    }

    return null;
};

// =====================================================
// MAIN COMPONENT
// =====================================================
const MyBooking = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [searchParams] = useSearchParams();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    // =====================================================
    // FETCH MY BOOKINGS
    // =====================================================
    const fetchBookings = async () => {
        try {
            setLoading(true);

            let rawToken = localStorage.getItem("userToken") || localStorage.getItem("token");
            if (!rawToken) {
                toast.error("Please log in to view your bookings.");
                setBookings([]);
                return;
            }

            let cleanToken = rawToken
                .replace(/^"(.*)"$/, "$1")
                .replace(/^Bearer\s+/i, "")
                .trim();

            const response = await axios.get(
                "http://localhost:5000/booking/my",
                { headers: { Authorization: `Bearer ${cleanToken}` } }
            );

            if (response.data?.success) {
                console.log("My bookings from API:", response.data.bookings);
                setBookings(response.data.bookings || []);
            } else {
                toast.error(response.data?.message || "Failed to load bookings.");
                setBookings([]);
            }
        } catch (error) {
            console.error("Fetch bookings error:", error);
            toast.error(error?.response?.data?.message || "Unable to fetch bookings.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // SIDEBAR CONTROLS
    // =====================================================
    const handleOpenSidebar = (bookingId) => {
        setSelectedBookingId(bookingId);
        setSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
        setSelectedBookingId(null);
    };

    const handlePaymentSuccess = () => {
        toast.success("Payment successful! Your booking is confirmed.");
        handleCloseSidebar();
        fetchBookings();
    };

    // =====================================================
    // VERIFY STRIPE PAYMENT AFTER REDIRECT
    // =====================================================
    useEffect(() => {
        const payment = searchParams.get("payment");
        const sessionId = searchParams.get("session_id");

        if (payment === "success" && sessionId) {
            const verifyPayment = async () => {
                try {
                    let rawToken = localStorage.getItem("userToken") || localStorage.getItem("token");
                    if (!rawToken) {
                        toast.error("Please log in to verify payment.");
                        return;
                    }

                    let cleanToken = rawToken
                        .replace(/^"(.*)"$/, "$1")
                        .replace(/^Bearer\s+/i, "")
                        .trim();

                    const response = await axios.post(
                        "http://localhost:5000/booking/stripe/verify",
                        { sessionId },
                        { headers: { Authorization: `Bearer ${cleanToken}` } }
                    );

                    if (response.data?.success) {
                        toast.success("Payment successful!");
                        await fetchBookings();
                        navigate("/my-booking", { replace: true });
                    } else {
                        toast.error(response.data?.message || "Payment verification failed.");
                    }
                } catch (error) {
                    console.error("Stripe verify error:", error);
                    toast.error(error?.response?.data?.message || "Payment verification failed.");
                }
            };
            verifyPayment();
        } else if (payment === "cancelled") {
            toast.error("Payment was cancelled.");
            navigate("/my-booking", { replace: true });
        }
    }, [searchParams]);

    // =====================================================
    // LOAD ON MOUNT
    // =====================================================
    useEffect(() => {
        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }
        fetchBookings();
    }, []);

    // =====================================================
    // RENDER
    // =====================================================
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loading />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <main className="flex-1 relative overflow-hidden px-4 py-10 md:px-16 lg:px-40">
                <BlurCircle top="100px" left="100px" />
                <BlurCircle bottom="0px" left="600px" />

                <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

                {bookings.length === 0 ? (
                    <div className="border border-primary/25 bg-primary/10 rounded-lg p-10 text-center">
                        <h2 className="text-xl font-semibold">No bookings yet</h2>
                        <p className="text-gray-400 mt-3">
                            You haven't made any movie bookings yet.
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            Your bookings will appear here after you book a movie.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl">
                        {bookings.map((booking) => {
                            const theater = resolveTheaterFromBooking(booking);

                            return (
                                <div
                                    key={booking._id}
                                    className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition"
                                >
                                    {/* Poster */}
                                    <div className="flex-shrink-0">
                                        {booking.poster ? (
                                            <img
                                                src={booking.poster}
                                                alt={booking.movieName || "Movie"}
                                                className="w-28 h-40 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-28 h-40 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                                                No Poster
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {booking.movieName || "Unknown Movie"}
                                            </h2>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-1">
                                                <span>{formatDuration(booking.runtime)}</span>
                                                <span>•</span>
                                                <span>{formatDate(booking.showDateTime)}</span>
                                            </div>

                                            {/* ============================= */}
                                            {/* THEATER INFO (NEW) */}
                                            {/* ============================= */}
                                            {theater?.name && (
                                                <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-300">
                                                    <MapPin
                                                        size={14}
                                                        className="text-primary flex-shrink-0 mt-0.5"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-white font-medium truncate">
                                                            {theater.name}
                                                        </p>
                                                        {(theater.city ||
                                                            theater.address) && (
                                                            <p className="text-xs text-gray-400 truncate">
                                                                {theater.city &&
                                                                    `${theater.city}, `}
                                                                {theater.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-3 text-sm text-gray-400">
                                                <span>
                                                    Total Seats:{" "}
                                                    {booking.bookedSeats?.length || 0}
                                                </span>
                                                <span className="ml-4">
                                                    Seats:{" "}
                                                    {booking.bookedSeats?.join(", ") ||
                                                        "None"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Total Amount
                                                </p>
                                                <p className="text-2xl font-bold text-primary">
                                                    Rs. {booking.amount || 0}
                                                </p>
                                            </div>
                                            <div>
                                                {booking.isPaid ? (
                                                    <span className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium">
                                                        Paid ✓
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            handleOpenSidebar(
                                                                booking._id
                                                            )
                                                        }
                                                        className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white font-semibold transition flex items-center gap-2"
                                                    >
                                                        Pay Now
                                                        <span className="text-xs">→</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />

            {/* SIDEBAR OVERLAY */}
            {sidebarOpen && selectedBookingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
                    <div className="bg-gray-900 w-full max-w-md p-6 overflow-y-auto h-full border-l border-gray-700 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Complete Payment</h2>
                            <button
                                onClick={handleCloseSidebar}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            Enter your card details to pay for this booking.
                        </p>
                        <Elements stripe={stripePromise}>
                            <StripePaymentForm
                                bookingId={selectedBookingId}
                                onSuccess={handlePaymentSuccess}
                                onCancel={handleCloseSidebar}
                            />
                        </Elements>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBooking;