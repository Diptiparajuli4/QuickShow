import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import BlurCircle from "../../components/BlurCircle";

import {
    ChartLineIcon,
    CircleDollarSignIcon,
    PlayCircleIcon,
    UsersIcon,
    StarIcon,
    ShieldCheckIcon,
    TrashIcon,
    UserPlusIcon,
    XIcon,
} from "lucide-react";
import { dateFormat } from "../../lib/dateFormat";

const Dashboard = () => {
    const currency = import.meta.env.VITE_CURRENCY || "Rs.";
    const { adminToken } = useAuth();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        activeShows: [],
        totalUser: 0,
        totalAdmin: 0,
    });
    
    const [usersList, setUsersList] = useState([]);
    const [adminsList, setAdminsList] = useState([]);
    const [activeTab, setActiveTab] = useState(null); // 'users' or 'admins' or null

    // State for Add Admin Modal inside the Dashboard
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdminForm, setNewAdminForm] = useState({ name: "", email: "", password: "" });
    const [submittingAdmin, setSubmittingAdmin] = useState(false);
    const [adminError, setAdminError] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // FETCH DASHBOARD DATA
    // =====================================================
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            if (!adminToken) {
                throw new Error("You are not logged in. Please login again.");
            }

            // 1. Dashboard stats
            const dashboardResponse = await fetch(
                "http://localhost:5000/admin/dashboard",
                {
                    headers: { Authorization: `Bearer ${adminToken}` },
                }
            );

            if (!dashboardResponse.ok) {
                const errData = await dashboardResponse.json();
                throw new Error(errData.message || "Failed to fetch dashboard data");
            }

            const dashboardResult = await dashboardResponse.json();

            // 2. Active shows
            const showsResponse = await fetch("http://localhost:5000/show/all", {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            let activeShows = [];
            if (showsResponse.ok) {
                const showsData = await showsResponse.json();
                if (showsData.success) {
                    const now = new Date();
                    activeShows = showsData.shows.filter(
                        (show) => new Date(show.showDateTime) >= now
                    );
                }
            }

            // 3. Fetch data endpoints
            const usersRes = await fetch("http://localhost:5000/admin/users", {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const usersData = usersRes.ok ? await usersRes.json() : { users: [] };

            const adminsRes = await fetch("http://localhost:5000/admin/all", {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const adminsData = adminsRes.ok ? await adminsRes.json() : { admins: [] };

            const rawUsers = usersData.users || usersData.data || [];
            const rawAdmins = adminsData.admins || adminsData.data || adminsData.users || [];

            // Correct table mapping lists
            setUsersList(rawUsers); 
            setAdminsList(rawAdmins); 

            if (dashboardResult.success) {
                const data = dashboardResult.dashboardData || dashboardResult.data || dashboardResult;
                setDashboardData({
                    totalBookings: Number(data.totalBookings ?? data.bookings ?? 0),
                    totalRevenue: Number(data.totalRevenue ?? data.revenue ?? 0),
                    totalUser: rawUsers.length,    // Corrected to use rawUsers length
                    totalAdmin: rawAdmins.length,  // Corrected to use rawAdmins length
                    activeShows,
                });
            } else {
                setDashboardData((prev) => ({ 
                    ...prev, 
                    totalUser: rawUsers.length,    // Corrected to use rawUsers length
                    totalAdmin: rawAdmins.length,  // Corrected to use rawAdmins length
                    activeShows 
                }));
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            setError(error.message || "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [adminToken]);

    // =====================================================
    // ADD NEW ADMIN HANDLER
    // =====================================================
    const handleCreateAdminSubmit = async (e) => {
        e.preventDefault();
        setAdminError("");
        setSubmittingAdmin(true);

        try {
            const res = await fetch("http://localhost:5000/admin/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify(newAdminForm),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                alert("New admin added successfully!");
                setNewAdminForm({ name: "", email: "", password: "" });
                setShowAddAdminModal(false);
                fetchDashboardData(); // Refresh tables and counts instantly
            } else {
                setAdminError(data.message || "Failed to create admin");
            }
        } catch (err) {
            console.error(err);
            setAdminError("Server connection error while creating admin");
        } finally {
            setSubmittingAdmin(false);
        }
    };

    // =====================================================
    // DELETE HANDLERS
    // =====================================================
    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`http://localhost:5000/admin/user/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setUsersList(usersList.filter((u) => u._id !== userId));
                setDashboardData(prev => ({ ...prev, totalUser: prev.totalUser - 1 }));
            } else {
                alert(data.message || "Failed to delete user");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting user");
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;
        try {
            const res = await fetch(`http://localhost:5000/admin/admin/${adminId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAdminsList(adminsList.filter((a) => a._id !== adminId));
                setDashboardData(prev => ({ ...prev, totalAdmin: prev.totalAdmin - 1 }));
            } else {
                alert(data.message || "Failed to delete admin");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting admin");
        }
    };

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-4 text-red-400">
                    <p className="font-medium">Error loading dashboard</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-3 px-4 py-2 bg-primary rounded text-white text-sm hover:bg-primary-dull transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <BlurCircle top="0" left="0" />
            <BlurCircle top="50%" right="0" />

            <div className="mb-8">
                <Title text1="Admin" text2="Dashboard" />
            </div>

            {/* DASHBOARD CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                <Link to="/admin/list-bookings" className="bg-primary/10 border border-primary/20 rounded-lg p-5 hover:bg-primary/20 transition block">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Bookings</p>
                            <h2 className="text-2xl font-semibold mt-1">{dashboardData.totalBookings}</h2>
                        </div>
                        <ChartLineIcon className="w-8 h-8 text-primary" />
                    </div>
                </Link>

                <Link to="/admin/list-bookings" className="bg-primary/10 border border-primary/20 rounded-lg p-5 hover:bg-primary/20 transition block">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                            <h2 className="text-2xl font-semibold mt-1">
                                {currency} {Number(dashboardData.totalRevenue || 0).toLocaleString()}
                            </h2>
                        </div>
                        <CircleDollarSignIcon className="w-8 h-8 text-primary" />
                    </div>
                </Link>

                <Link to="/admin/list-shows" className="bg-primary/10 border border-primary/20 rounded-lg p-5 hover:bg-primary/20 transition block">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Shows</p>
                            <h2 className="text-2xl font-semibold mt-1">{dashboardData.activeShows.length}</h2>
                        </div>
                        <PlayCircleIcon className="w-8 h-8 text-primary" />
                    </div>
                </Link>

                <div 
                    onClick={() => setActiveTab(activeTab === 'users' ? null : 'users')}
                    className="bg-primary/10 border border-primary/20 rounded-lg p-5 hover:bg-primary/20 transition cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Users (Manage)</p>
                            <h2 className="text-2xl font-semibold mt-1">{dashboardData.totalUser}</h2>
                        </div>
                        <UsersIcon className="w-8 h-8 text-primary" />
                    </div>
                </div>

                <div 
                    onClick={() => setActiveTab(activeTab === 'admins' ? null : 'admins')}
                    className="bg-primary/10 border border-primary/20 rounded-lg p-5 hover:bg-primary/20 transition cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Admins (Manage)</p>
                            <h2 className="text-2xl font-semibold mt-1">{dashboardData.totalAdmin}</h2>
                        </div>
                        <ShieldCheckIcon className="w-8 h-8 text-primary" />
                    </div>
                </div>
            </div>

            {/* DYNAMIC USER / ADMIN MANAGEMENT PANEL */}
            {activeTab && (
                <div className="mb-10 bg-gray-900 border border-gray-800 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold capitalize">
                            Manage {activeTab}
                        </h3>
                        <div className="flex gap-2">
                            {activeTab === 'admins' && (
                                <button
                                    onClick={() => setShowAddAdminModal(true)} 
                                    className="flex items-center gap-1 bg-primary text-white text-xs px-3 py-2 rounded hover:bg-primary-dull transition"
                                >
                                    <UserPlusIcon className="w-4 h-4" /> Add New Admin
                                </button>
                            )}
                            <button 
                                onClick={() => setActiveTab(null)}
                                className="text-gray-400 text-xs px-3 py-2 bg-gray-800 rounded hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'users' ? usersList : adminsList).map((item) => (
                                    <tr key={item._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="p-3 font-medium">{item.name || "N/A"}</td>
                                        <td className="p-3">{item.email}</td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => activeTab === 'users' ? handleDeleteUser(item._id) : handleDeleteAdmin(item._id)}
                                                className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(activeTab === 'users' ? usersList : adminsList).length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center p-4 text-gray-500">
                                            No {activeTab} found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ADD NEW ADMIN MODAL POPUP */}
            {showAddAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Add New Admin</h3>
                            <button 
                                onClick={() => setShowAddAdminModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {adminError && (
                            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 text-red-400 text-sm rounded">
                                {adminError}
                            </div>
                        )}

                        <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-xs uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newAdminForm.name}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:outline-none focus:border-primary"
                                    placeholder="Admin Name"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs uppercase mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newAdminForm.email}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:outline-none focus:border-primary"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs uppercase mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newAdminForm.password}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:outline-none focus:border-primary"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddAdminModal(false)}
                                    className="px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingAdmin}
                                    className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary-dull transition disabled:opacity-50"
                                >
                                    {submittingAdmin ? "Creating..." : "Save Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ACTIVE SHOWS LIST */}
            <div>
                <Title text1="Active" text2="Shows" />
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {dashboardData.activeShows.length > 0 ? (
                        dashboardData.activeShows.map((show) => {
                            const movie = show.movie;
                            return (
                                <Link 
                                    to="/admin/list-shows"
                                    key={show._id}
                                    className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 block hover:border-primary/50 transition"
                                >
                                    <img
                                        src={
                                            movie?.poster_path
                                                ? movie.poster_path.startsWith("http")
                                                    ? movie.poster_path
                                                    : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                                : "/fallback.jpg"
                                        }
                                        alt={movie?.title || "Movie"}
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg truncate">
                                            {movie?.title || "Unknown Movie"}
                                        </h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-primary font-medium">
                                                {currency} {show.showPrice}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm">
                                                <StarIcon className="w-4 h-4 fill-current" />
                                                <span>{movie?.vote_average || "N/A"}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {dateFormat(show.showDateTime)}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-400">
                            No active shows available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;