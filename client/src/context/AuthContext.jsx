
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";


// =====================================================
// CREATE CONTEXT
// =====================================================

const AuthContext = createContext();


// =====================================================
// AUTH PROVIDER
// =====================================================

export const AuthProvider = ({ children }) => {

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


            // =============================================
            // RESTORE ADMIN
            // =============================================

            if (savedAdmin) {

                const adminData =
                    JSON.parse(savedAdmin);


                if (
                    adminData &&
                    adminData.role === "admin"
                ) {

                    setAdmin(adminData);

                    // Make sure user session is not active
                    setUser(null);

                } else {

                    localStorage.removeItem(
                        "adminUser"
                    );

                    localStorage.removeItem(
                        "adminToken"
                    );

                }

            }


            // =============================================
            // RESTORE NORMAL USER
            // =============================================

            else if (savedUser) {

                const userData =
                    JSON.parse(savedUser);


                if (
                    userData &&
                    userData.role === "user"
                ) {

                    setUser(userData);

                    // Make sure admin session is not active
                    setAdmin(null);

                } else {

                    localStorage.removeItem(
                        "userUser"
                    );

                    localStorage.removeItem(
                        "userToken"
                    );

                }

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
                "userToken"
            );

            localStorage.removeItem(
                "adminUser"
            );

            localStorage.removeItem(
                "adminToken"
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
                                email.trim().toLowerCase(),

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
                    "userToken"
                );

                localStorage.removeItem(
                    "userUser"
                );


                setUser(null);


                // Save admin session
                localStorage.setItem(
                    "adminToken",
                    token
                );

                localStorage.setItem(
                    "adminUser",
                    JSON.stringify(
                        loggedInUser
                    )
                );


                // Keep admin logged in
                setAdmin(
                    loggedInUser
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
                    "adminToken"
                );

                localStorage.removeItem(
                    "adminUser"
                );


                setAdmin(null);


                // Save normal user session
                localStorage.setItem(
                    "userToken",
                    token
                );

                localStorage.setItem(
                    "userUser",
                    JSON.stringify(
                        loggedInUser
                    )
                );


                // Keep user logged in
                setUser(
                    loggedInUser
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
                                email.trim().toLowerCase(),

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

            localStorage.removeItem(
                "adminToken"
            );

            localStorage.removeItem(
                "adminUser"
            );


            setAdmin(null);


            // Save new user
            localStorage.setItem(
                "userToken",
                token
            );

            localStorage.setItem(
                "userUser",
                JSON.stringify(
                    newUser
                )
            );


            setUser(
                newUser
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
    // USER LOGOUT
    // =====================================================

    const logoutUser = () => {

        localStorage.removeItem(
            "userToken"
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
            "adminToken"
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

        logoutUser();

        logoutAdmin();

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

        isUserLoggedIn:
            !!user,

        isAdminLoggedIn:
            !!admin,

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
