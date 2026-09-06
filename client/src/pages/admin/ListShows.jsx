import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import dateFormat from "../../lib/dateFormat";
import toast from "react-hot-toast";
import { Trash2, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";   // ✅ import

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || "Rs.";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const { adminToken } = useAuth();   // ✅ get admin token from context

  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedShowId, setExpandedShowId] = useState(null);

  const toggleUserList = (showId) => {
    setExpandedShowId((prev) => (prev === showId ? null : showId));
  };

  // =====================================================
  // FETCH SHOWS AND BOOKINGS FROM MONGODB
  // =====================================================
  const fetchData = async () => {
    try {
      setLoading(true);

      if (!adminToken) {
        throw new Error("You are not logged in. Please login again.");
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      };

      // 1. Fetch Shows
      let showRes = await fetch(`${backendUrl}/show/all`, {
        method: "GET",
        headers,
      });

      if (showRes.status === 404) {
        showRes = await fetch(`${backendUrl}/admin/all-shows`, {
          method: "GET",
          headers,
        });
      }

      const showData = await showRes.json();

      if (!showRes.ok) {
        throw new Error(showData.message || "Failed to fetch shows");
      }

      const fetchedShows =
        showData.shows ||
        showData.data ||
        showData.allShows ||
        (Array.isArray(showData) ? showData : []);

      // 2. Fetch All Bookings (with populated user info)
      let fetchedBookings = [];
      try {
        const bookingRes = await fetch(`${backendUrl}/booking/all`, {
          method: "GET",
          headers,
        });

        if (bookingRes.ok) {
          const bookingData = await bookingRes.json();
          fetchedBookings =
            bookingData.bookings ||
            bookingData.data ||
            (Array.isArray(bookingData) ? bookingData : []);
        }
      } catch (bErr) {
        console.warn("Could not fetch bookings for user aggregation:", bErr);
      }

      setShows(fetchedShows);
      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Error getting shows:", error);
      toast.error(error.message || "Failed to load shows from database.");
      setShows([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE A SHOW
  // =====================================================
  const handleDeleteShow = async (showId) => {
    if (!window.confirm("Are you sure you want to delete this show?")) return;

    try {
      if (!adminToken) {
        toast.error("You are not logged in.");
        return;
      }

      const response = await fetch(`${backendUrl}/show/${showId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,   // ✅ use adminToken
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete show");
      }

      toast.success("Show deleted successfully!");
      setShows((prev) => prev.filter((item) => item._id !== showId));
    } catch (error) {
      toast.error(error.message);
    }
  };

  // =====================================================
  // LOAD DATA WHEN PAGE OPENS
  // =====================================================
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [adminToken]);   // re‑fetch if token changes

  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return <Loading />;
  }

  // =====================================================
  // PAGE RENDER
  // =====================================================
  return (
    <>
      <Title text1="List" text2="Shows" />

      <div className="max-w-6xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          {/* TABLE HEADER */}
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-3 font-medium pl-5">Movie Name</th>
              <th className="p-3 font-medium">Show Time</th>
              <th className="p-3 font-medium">Show Price</th>
              <th className="p-3 font-medium">Total Bookings</th>
              <th className="p-3 font-medium">Booked Users</th>
              <th className="p-3 font-medium">Earnings</th>
              <th className="p-3 font-medium text-center">Action</th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="text-sm font-light">
            {shows.length > 0 ? (
              shows.map((show) => {
                const showIdStr = String(show._id);

                // Filter bookings matching this show ID
                const showBookings = bookings.filter((b) => {
                  const bShowId = typeof b.show === "object" ? b.show?._id : b.show;
                  return String(bShowId) === showIdStr && (b.isPaid === true || b.isPaid === undefined);
                });

                // Total seats booked
                const totalBookedSeats = showBookings.reduce((sum, b) => {
                  const seatCount = Array.isArray(b.bookedSeats)
                    ? b.bookedSeats.length
                    : Array.isArray(b.seats)
                    ? b.seats.length
                    : 1;
                  return sum + seatCount;
                }, 0);

                // Real total earnings
                const realEarnings = showBookings.reduce((sum, b) => {
                  const amt = Number(b.amount || b.totalAmount || 0);
                  return (
                    sum +
                    (amt > 0
                      ? amt
                      : (Array.isArray(b.bookedSeats) ? b.bookedSeats.length : 1) *
                        Number(show.showPrice || 0))
                  );
                }, 0);

                const isExpanded = expandedShowId === show._id;

                return (
                  <React.Fragment key={show._id}>
                    <tr className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/20 transition">
                      {/* MOVIE NAME */}
                      <td className="p-3 min-w-45 pl-5 font-medium text-white">
                        {show.movie?.title || show.movieTitle || "Unknown Movie"}
                      </td>

                      {/* SHOW DATE & TIME */}
                      <td className="p-3">
                        {show.showDateTime
                          ? dateFormat(show.showDateTime)
                          : show.dateTime
                          ? dateFormat(show.dateTime)
                          : "N/A"}
                      </td>

                      {/* SHOW PRICE */}
                      <td className="p-3">
                        {currency}
                        {show.showPrice}
                      </td>

                      {/* TOTAL BOOKINGS */}
                      <td className="p-3">
                        {totalBookedSeats}{" "}
                        <span className="text-xs text-gray-400">
                          ({showBookings.length} {showBookings.length === 1 ? "order" : "orders"})
                        </span>
                      </td>

                      {/* BOOKED USERS COLUMN */}
                      <td className="p-3">
                        {showBookings.length > 0 ? (
                          <button
                            onClick={() => toggleUserList(show._id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-primary/20 hover:bg-primary/40 text-primary-light border border-primary/30 rounded transition"
                          >
                            <Users size={14} />
                            <span>{showBookings.length} Customer(s)</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs">No users yet</span>
                        )}
                      </td>

                      {/* REAL-TIME EARNINGS */}
                      <td className="p-3 font-medium text-emerald-400">
                        {currency}
                        {realEarnings}
                      </td>

                      {/* ACTION */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteShow(show._id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded transition"
                          title="Delete Show"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDABLE USER LIST SUB-ROW */}
                    {isExpanded && (
                      <tr className="bg-primary/20 border-b border-primary/20">
                        <td colSpan="7" className="p-4 pl-10">
                          <div className="bg-black/40 p-3 rounded-lg border border-primary/10">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-2">
                              <Users size={14} /> Registered Customers for this Show
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {showBookings.map((b, idx) => {
                                const userName =
                                  typeof b.user === "object" && b.user?.name
                                    ? b.user.name
                                    : b.userName || "Guest / Direct Booking";
                                const userEmail =
                                  typeof b.user === "object" && b.user?.email
                                    ? b.user.email
                                    : b.userEmail || "No Email";
                                const seats = Array.isArray(b.bookedSeats)
                                  ? b.bookedSeats.join(", ")
                                  : "N/A";

                                return (
                                  <div
                                    key={b._id || idx}
                                    className="p-2 bg-white/5 rounded text-xs border border-white/5"
                                  >
                                    <p className="font-medium text-white">{userName}</p>
                                    <p className="text-gray-400 text-[11px]">{userEmail}</p>
                                    <p className="text-emerald-400 text-[11px] mt-1">
                                      Seats: <span className="font-mono text-white">{seats}</span>
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  No shows found. Add a show from Add Shows.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListShows;