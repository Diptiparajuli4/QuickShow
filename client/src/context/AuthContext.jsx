import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [adminToken, setAdminToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Independently restore sessions
    useEffect(() => {
        const verifySessions = async () => {
            const storedAdminToken = localStorage.getItem("adminToken");
            const storedUserToken =
                localStorage.getItem("userToken") || localStorage.getItem("token");
            const savedUser = localStorage.getItem("userUser");
            const savedAdmin = localStorage.getItem("adminUser");

            // 1. Verify Admin Session via Database API
            if (storedAdminToken) {
                try {
                    const res = await fetch("http://localhost:5000/admin/profile", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${storedAdminToken}`,
                        },
                    });
                    const data = await res.json();

                    if (res.ok && data.success && data.admin) {
                        setAdmin(data.admin);
                        setAdminToken(storedAdminToken);
                    } else if (savedAdmin) {
                        setAdmin(JSON.parse(savedAdmin));
                        setAdminToken(storedAdminToken);
                    } else {
                        localStorage.removeItem("adminToken");
                        localStorage.removeItem("adminUser");
                    }
                } catch (error) {
                    if (savedAdmin) {
                        setAdmin(JSON.parse(savedAdmin));
                        setAdminToken(storedAdminToken);
                    } else {
                        localStorage.removeItem("adminToken");
                        localStorage.removeItem("adminUser");
                    }
                }
            }

            // 2. Verify User Session via Database API (/user/me) with localStorage fallback
            if (storedUserToken) {
                let verifiedUser = null;
                if (savedUser) {
                    try {
                        verifiedUser = JSON.parse(savedUser);
                    } catch (e) {
                        verifiedUser = null;
                    }
                }

                try {
                    const res = await fetch("http://localhost:5000/user/me", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${storedUserToken}`,
                        },
                    });
                    const data = await res.json();
                    if (res.ok && data.success && data.user) {
                        verifiedUser = data.user;
                        localStorage.setItem("userUser", JSON.stringify(data.user));
                    }
                } catch (error) {
                    // Falls back to cached local storage user object if offline or route has issue
                }

                if (verifiedUser) {
                    setUser(verifiedUser);
                    setUserToken(storedUserToken);
                } else {
                    localStorage.removeItem("userToken");
                    localStorage.removeItem("token");
                    localStorage.removeItem("userUser");
                }
            }

            setLoading(false);
        };

        verifySessions();
    }, []);

    // ---------- USER LOGIN ----------
    const login = async (email, password) => {
        try {
            const response = await fetch("http://localhost:5000/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Invalid email or password.");
            }

            const loggedInUser = data.user;
            const token = data.token;

            if (!loggedInUser || !token) {
                throw new Error("Invalid login response from server.");
            }

            localStorage.setItem("userToken", token);
            localStorage.setItem("userUser", JSON.stringify(loggedInUser));
            setUser(loggedInUser);
            setUserToken(token);

            return { ...loggedInUser, token };
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    // ---------- ADMIN LOGIN ----------
    const loginAdmin = async (email, password) => {
        try {
            const response = await fetch("http://localhost:5000/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Invalid admin credentials.");
            }

            const loggedInAdmin = data.admin || data.user;
            const token = data.token;

            if (!loggedInAdmin || !token) {
                throw new Error("Invalid admin login response from server.");
            }

            if (!loggedInAdmin.role) {
                loggedInAdmin.role = "admin";
            }

            localStorage.setItem("adminToken", token);
            localStorage.setItem("adminUser", JSON.stringify(loggedInAdmin));
            setAdmin(loggedInAdmin);
            setAdminToken(token);

            return { ...loggedInAdmin, token };
        } catch (error) {
            console.error("Admin login error:", error);
            throw error;
        }
    };

    // ---------- SIGNUP ----------
    const signup = async (name, email, password) => {
        try {
            const response = await fetch("http://localhost:5000/user/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not create account.");
            }

            const newUser = data.user;
            const token = data.token;

            if (!newUser || !token) {
                throw new Error("Invalid signup response from server.");
            }

            localStorage.setItem("userToken", token);
            localStorage.setItem("userUser", JSON.stringify(newUser));
            setUser(newUser);
            setUserToken(token);

            return { ...newUser, token };
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    };

    // ---------- INDEPENDENT LOGOUTS ----------
    const logoutUser = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        localStorage.removeItem("userUser");
        setUser(null);
        setUserToken(null);
    };

    const logoutAdmin = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setAdmin(null);
        setAdminToken(null);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setAdmin(null);
        setUserToken(null);
        setAdminToken(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("userUser", JSON.stringify(updatedUser));
    };

    const updateAdmin = (updatedAdmin) => {
        setAdmin(updatedAdmin);
        localStorage.setItem("adminUser", JSON.stringify(updatedAdmin));
    };

    const updateAdminProfile = async (updateData) => {
        try {
            const currentToken = adminToken || localStorage.getItem("adminToken");
            if (!currentToken) {
                throw new Error("No admin authorization token found.");
            }

            const response = await fetch("http://localhost:5000/admin/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update profile.");
            }

            const updatedAdminInfo = data.admin || data.user;
            if (updatedAdminInfo) {
                updateAdmin(updatedAdminInfo);
            }

            return data;
        } catch (error) {
            console.error("Update admin profile error:", error);
            throw error;
        }
    };

    const isLoggedIn = () => !!(user || admin);
    const requireLogin = (action) => {
        if (!isLoggedIn()) {
            navigate("/login");
            return false;
        }
        if (typeof action === "function") action();
        return true;
    };

    const value = {
        user,
        admin,
        userToken,
        adminToken,
        loading,
        login,
        loginAdmin,
        signup,
        logout,
        logoutUser,
        logoutAdmin,
        setUser: updateUser,
        setAdmin: updateAdmin,
        updateAdminProfile,
        isUserLoggedIn: !!user,
        isAdminLoggedIn: !!admin,
        isLoggedIn,
        requireLogin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};

export default AuthContext;