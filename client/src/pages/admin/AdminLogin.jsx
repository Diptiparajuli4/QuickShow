import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminLogin = () => {
    const navigate = useNavigate();
    const { loginAdmin, admin, loading: authLoading } = useAuth() || {};

    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && admin) {
            navigate("/admin", { replace: true });
        }
    }, [admin, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (isSignUp && !name.trim()) {
            toast.error("Please enter your name.");
            return;
        }

        try {
            setIsSubmitting(true);
            const baseUrl = "http://localhost:5000";
            const endpoint = isSignUp ? "/admin/register" : "/admin/login";

            if (!isSignUp) {
                await loginAdmin(email.trim(), password);
                toast.success("Welcome back, Admin!");
                navigate("/admin", { replace: true });
            } else {
                const payload = {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    secretKey,
                };

                const response = await fetch(`${baseUrl}${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Admin registration failed.");
                }

                localStorage.setItem("adminToken", data.token);
                localStorage.setItem("adminUser", JSON.stringify(data.admin || data.user));
                
                toast.success("Admin account created successfully!");
                window.location.href = "/admin";
            }
        } catch (error) {
            console.error("Admin Auth Error:", error);
            toast.error(error.message || "Authentication failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-black to-black pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-primary/10 border border-primary/30 rounded-full text-primary">
                            <ShieldCheck size={28} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-white mb-1">
                        Admin Portal
                    </h1>
                    <p className="text-gray-400 text-center mb-6 text-sm">
                        {isSignUp
                            ? "Create a new administrative account"
                            : "Sign in to manage movies, shows, and bookings"}
                    </p>

                    <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                                !isSignUp ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <LogIn size={16} /> Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
                                isSignUp ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <UserPlus size={16} /> Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
                                    placeholder="John Doe"
                                    required={isSignUp}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {isSignUp && (
                            <div>
                                <label className="block text-sm text-gray-300 mb-1.5">
                                    Admin Secret Key <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <input
                                    type="password"
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
                                    placeholder="System Access Key"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition text-sm mt-2 cursor-pointer"
                        >
                            {isSubmitting
                                ? "Processing..."
                                : isSignUp
                                ? "Create Admin Account"
                                : "Login to Admin Portal"}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        Return to{" "}
                        <Link to="/" className="text-primary hover:underline font-medium">
                            Home Page
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;