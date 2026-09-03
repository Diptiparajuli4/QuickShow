import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // LOGIN
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate input
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // Login through AuthContext
      const result = await login(email.trim(), password);
      console.log("Login result:", result);

      // AuthContext may return user directly or { user, token }
      const loggedInUser = result?.user || result;

      // Save token if provided (AuthContext already saves it, but keep for safety)
      if (result?.token) {
        localStorage.setItem("token", result.token);
        console.log("JWT token saved successfully.");
      }

      console.log("Token in localStorage:", localStorage.getItem("token"));

      if (!loggedInUser) {
        throw new Error("Login successful, but user information was not received.");
      }

      console.log("Logged in user:", loggedInUser);

      // -------------------------------------------------
      // REDIRECT LOGIC (with `from` support)
      // -------------------------------------------------
      const from = location.state?.from;

      // If there is an intended destination (e.g., from DateSelect), go there
      if (from && typeof from === "string") {
        navigate(from, { replace: true });
        return;
      }

      // Otherwise fallback to role-based redirects
      if (loggedInUser.role === "admin") {
        console.log("Admin detected - redirecting to admin.");
        navigate("/admin", { replace: true });
        return;
      }

      if (loggedInUser.role === "user") {
        console.log("User detected - redirecting to home.");
        navigate("/", { replace: true });
        return;
      }

      // Unknown role
      setError("Your account has an invalid role.");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Unable to login. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Background gradient */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))]
          from-primary/20
          via-black
          to-black
          pointer-events-none
        "
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={assets.logo} alt="Logo" className="w-36 h-auto" />
          </Link>
        </div>

        {/* Login Card */}
        <div
          className="
            bg-white/5
            border
            border-white/10
            backdrop-blur-md
            rounded-2xl
            p-8
          "
        >
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-6">
            Sign in to your account to continue
          </p>

          {error && (
            <div
              className="
                mb-4
                px-4
                py-3
                bg-red-500/10
                border
                border-red-500/30
                rounded-lg
                text-red-400
                text-sm
              "
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="
                  w-full
                  px-4
                  py-2.5
                  rounded-lg
                  bg-white/10
                  border
                  border-white/10
                  text-white
                  placeholder-gray-500
                  focus:outline-none
                  focus:border-primary
                  focus:ring-1
                  focus:ring-primary
                  transition
                  text-sm
                "
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full
                  px-4
                  py-2.5
                  rounded-lg
                  bg-white/10
                  border
                  border-white/10
                  text-white
                  placeholder-gray-500
                  focus:outline-none
                  focus:border-primary
                  focus:ring-1
                  focus:ring-primary
                  transition
                  text-sm
                "
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-2.5
                bg-primary
                hover:bg-primary-dull
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
                rounded-lg
                font-semibold
                text-white
                text-sm
              "
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Signup link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;