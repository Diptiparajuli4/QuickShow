
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";


// =====================================================
// CREATE CONTEXT
// =====================================================

const AuthContext = createContext();


// =====================================================
// AUTH PROVIDER
// =====================================================

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate();


    // =================================================
    // USER
    // =================================================

    const [user, setUser] = useState(null);


    // =================================================
    // ADMIN
    // =================================================

    const [admin, setAdmin] = useState(null);


    // =================================================
    // LOADING
    // =================================================

    const [loading, setLoading] = useState(true);


    // =================================================
    // LOAD SAVED LOGIN SESSION
    // =================================================

    useEffect(() => {

        try {

            const savedUser =
                localStorage.getItem("userUser");

            const savedAdmin =
                localStorage.getItem("adminUser");

            const token =
                localStorage.getItem("token");


            // =============================================
            // RESTORE ADMIN
            // =============================================

            if (
                savedAdmin &&
                token
            ) {

                const adminData =
                    JSON.parse(savedAdmin);


                if (
                    adminData &&
                    adminData.role === "admin"
                ) {

                    setAdmin(adminData);
                    setUser(null);

                } else {

                    localStorage.removeItem(
                        "adminUser"
                    );

                    localStorage.removeItem(
                        "token"
                    );

                }

            }


            // =============================================
            // RESTORE NORMAL USER
            // =============================================

            else if (
                savedUser &&
                token
            ) {

                const userData =
                    JSON.parse(savedUser);


                if (
                    userData &&
                    userData.role === "user"
                ) {

                    setUser(userData);
                    setAdmin(null);

                } else {

                    localStorage.removeItem(
                        "userUser"
                    );

                    localStorage.removeItem(
                        "token"
                    );

                }

            }

            // =============================================
            // NO VALID SESSION
            // =============================================

            else {

                setUser(null);
                setAdmin(null);

            }

        } catch (error) {

            console.error(
                "Error restoring login session:",
                error
            );


            // Clear corrupted session

            localStorage.removeItem(
                "userUser"
            );

            localStorage.removeItem(
                "adminUser"
            );

            localStorage.removeItem(
                "token"
            );


            setUser(null);
            setAdmin(null);

        } finally {

            setLoading(false);

        }

    }, []);


    // =====================================================
    // LOGIN
    // =====================================================

    const login = async (
        email,
        password
    ) => {

        try {

            const response =
                await fetch(
                    "http://localhost:5000/user/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            email:
                                email
                                    .trim()
                                    .toLowerCase(),

                            password,
                        }),
                    }
                );


            const data =
                await response.json();


            console.log(
                "Login response:",
                data
            );


            // =============================================
            // LOGIN FAILED
            // =============================================

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Invalid email or password."
                );

            }


            const loggedInUser =
                data.user;

            const token =
                data.token;


            // =============================================
            // CHECK SERVER RESPONSE
            // =============================================

            if (
                !loggedInUser ||
                !token
            ) {

                throw new Error(
                    "Invalid login response from server."
                );

            }


            // =============================================
            // ADMIN LOGIN
            // =============================================

            if (
                loggedInUser.role === "admin"
            ) {

                // Remove normal user session

                localStorage.removeItem(
                    "userUser"
                );


                // Save admin session

                localStorage.setItem(
                    "token",
                    token
                );

                localStorage.setItem(
                    "adminUser",
                    JSON.stringify(
                        loggedInUser
                    )
                );


                // Update React state

                setUser(null);

                setAdmin(
                    loggedInUser
                );


                console.log(
                    "Admin token saved:",
                    localStorage.getItem("token")
                );


                return {
                    ...loggedInUser,
                    token,
                };

            }


            // =============================================
            // NORMAL USER LOGIN
            // =============================================

            if (
                loggedInUser.role === "user"
            ) {

                // Remove admin session

                localStorage.removeItem(
                    "adminUser"
                );


                // Save normal user session

                localStorage.setItem(
                    "token",
                    token
                );

                localStorage.setItem(
                    "userUser",
                    JSON.stringify(
                        loggedInUser
                    )
                );


                // Update React state

                setAdmin(null);

                setUser(
                    loggedInUser
                );


                console.log(
                    "User token saved:",
                    localStorage.getItem("token")
                );


                return {
                    ...loggedInUser,
                    token,
                };

            }


            // =============================================
            // INVALID ROLE
            // =============================================

            throw new Error(
                "Invalid account role."
            );


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            throw error;

        }

    };


    // =====================================================
    // SIGNUP
    // =====================================================

    const signup = async (
        name,
        email,
        password
    ) => {

        try {

            const response =
                await fetch(
                    "http://localhost:5000/user/signup",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name:
                                name.trim(),

                            email:
                                email
                                    .trim()
                                    .toLowerCase(),

                            password,
                        }),
                    }
                );


            const data =
                await response.json();


            console.log(
                "Signup response:",
                data
            );


            // =============================================
            // SIGNUP FAILED
            // =============================================

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Could not create account."
                );

            }


            const newUser =
                data.user;

            const token =
                data.token;


            // =============================================
            // CHECK SERVER RESPONSE
            // =============================================

            if (
                !newUser ||
                !token
            ) {

                throw new Error(
                    "Invalid signup response from server."
                );

            }


            // =============================================
            // SIGNUP ALWAYS CREATES NORMAL USER
            // =============================================

            // Remove admin session

            localStorage.removeItem(
                "adminUser"
            );


            // Save normal user session

            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "userUser",
                JSON.stringify(
                    newUser
                )
            );


            // Update React state

            setAdmin(null);

            setUser(
                newUser
            );


            console.log(
                "Signup token saved:",
                localStorage.getItem("token")
            );


            return {
                ...newUser,
                token,
            };


        } catch (error) {

            console.error(
                "Signup error:",
                error
            );

            throw error;

        }

    };


    // =====================================================
    // CHECK LOGIN
    // =====================================================

    const isLoggedIn = () => {

        return !!(
            user ||
            admin
        );

    };


    // =====================================================
    // REQUIRE LOGIN
    // =====================================================

    const requireLogin = (action) => {

        if (!isLoggedIn()) {

            navigate("/login");

            return false;

        }


        if (
            typeof action === "function"
        ) {

            action();

        }


        return true;

    };


    // =====================================================
    // USER LOGOUT
    // =====================================================

    const logoutUser = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "userUser"
        );


        setUser(null);

    };


    // =====================================================
    // ADMIN LOGOUT
    // =====================================================

    const logoutAdmin = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "adminUser"
        );


        setAdmin(null);

    };


    // =====================================================
    // GENERAL LOGOUT
    // =====================================================

    const logout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "userUser"
        );

        localStorage.removeItem(
            "adminUser"
        );


        setUser(null);
        setAdmin(null);

    };


    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    const value = {

        user,

        admin,

        loading,

        login,

        signup,

        logout,

        logoutUser,

        logoutAdmin,


        // =============================================
        // LOGIN STATUS
        // =============================================

        isUserLoggedIn:
            !!user,

        isAdminLoggedIn:
            !!admin,

        isLoggedIn,


        // =============================================
        // PROTECTED ACTION
        // =============================================

        requireLogin,

    };


    // =====================================================
    // PROVIDER
    // =====================================================

    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );

};


// =========================================================
// USE AUTH
// =========================================================

export const useAuth = () => {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

};


export default AuthContext;
