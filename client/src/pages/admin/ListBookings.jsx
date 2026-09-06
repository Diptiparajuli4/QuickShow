import React, { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/AuthContext";

const ListBookings = () => {
    const currency = import.meta.env.VITE_CURRENCY || "Rs.";
    const { adminToken } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // DATE FORMAT
    // =====================================================
    const dateFormat = (date) => {
        if (!date) return "N/A";
        try {
            return new Date(date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Invalid Date";
        }
    };

    // =====================================================
    // GET ALL BOOKINGS FROM MONGODB
    // =====================================================
    const getAllBookings = async () => {
        try {
            setIsLoading(true);
            setError("");

            if (!adminToken) {
                throw new Error("You are not logged in. Please login again.");
            }

            const response = await fetch("http://localhost:5000/booking/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
            });

            const data = await response.json();
            console.log("Bookings received from MongoDB:", data);

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to fetch bookings");
            }

            const rawBookings = Array.isArray(data.bookings) ? data.bookings : [];

            // ✅ FILTER: only show paid bookings
            const paidBookings = rawBookings.filter(
                (booking) => booking.isPaid === true
            );

            setBookings(paidBookings);

            // Optional: show a message if no paid bookings
            if (paidBookings.length === 0) {
                setError("No paid bookings found.");
            } else {
                setError(""); // clear any previous error
            }
        } catch (error) {
            console.error("Error loading bookings:", error);
            setError(error.message || "Failed to load bookings");
            setBookings([]);
        } finally {
            setIsLoading(false);
        }
    };

    // =====================================================
    // LOAD BOOKINGS WHEN PAGE OPENS
    // =====================================================
    useEffect(() => {
        getAllBookings();
        // eslint-disable-next-line
    }, [adminToken]);

    // =====================================================
    // LOADING
    // =====================================================
    if (isLoading) {
        return <Loading />;
    }

    // =====================================================
    // PAGE
    // =====================================================
    return (
        <>
            <Title text1="List" text2="Bookings (Paid)" />

            {error && (
                <div className="mt-6 max-w-6xl px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                    {error}
                </div>
            )}

            <div className="max-w-6xl mt-6 overflow-x-auto">
                <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
                    <thead>
                        <tr className="bg-primary/20 text-left text-white">
                            <th className="p-3 font-medium pl-5">User Name</th>
                            <th className="p-3 font-medium">Movie Name</th>
                            <th className="p-3 font-medium">Show Time</th>
                            <th className="p-3 font-medium">Seats</th>
                            <th className="p-3 font-medium">Amount</th>
                            <th className="p-3 font-medium">Payment Status</th> {/* optional */}
                        </tr>
                    </thead>

                    <tbody className="text-sm">
                        {bookings.length > 0 ? (
                            bookings.map((item, index) => {
                                const userName =
                                    item.user?.name ||
                                    item.userName ||
                                    item.user_name ||
                                    item.name ||
                                    item.userId?.name ||
                                    item.customerName ||
                                    "Unknown User";

                                const movieName =
                                    item.show?.movie?.title ||
                                    item.movie?.title ||
                                    item.movieName ||
                                    "Unknown Movie";

                                const showTime =
                                    item.show?.showDateTime ||
                                    item.showDateTime ||
                                    item.dateTime;

                                let seats = [];
                                if (Array.isArray(item.bookedSeats)) {
                                    seats = item.bookedSeats;
                                } else if (item.bookedSeats && typeof item.bookedSeats === "object") {
                                    seats = Object.keys(item.bookedSeats);
                                } else if (Array.isArray(item.seats)) {
                                    seats = item.seats;
                                } else if (item.seats && typeof item.seats === "object") {
                                    seats = Object.keys(item.seats);
                                }

                                const amount =
                                    Number(item.amount) ||
                                    Number(item.totalAmount) ||
                                    Number(item.total) ||
                                    0;

                                // Since we already filtered, all these are paid
                                const isPaid = item.isPaid === true;

                                return (
                                    <tr
                                        key={item._id || item.id || index}
                                        className="border-b border-primary/20 bg-primary/5 even:bg-primary/10 hover:bg-primary/20 transition"
                                    >
                                        <td className="p-4 pl-5">{userName}</td>
                                        <td className="p-4">{movieName}</td>
                                        <td className="p-4">{dateFormat(showTime)}</td>
                                        <td className="p-4">
                                            {seats.length > 0 ? seats.join(", ") : "-"}
                                        </td>
                                        <td className="p-4">
                                            {currency}
                                            {amount}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                                                Paid
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-400">
                                    No paid bookings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ListBookings;