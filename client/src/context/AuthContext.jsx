import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    // =========================================
    // USER SESSION
    // =========================================

    const [user, setUser] = useState(null);

    // =========================================
    // ADMIN SESSION
    // =========================================

    const [admin, setAdmin] = useState(null);

    // =========================================
    // LOADING
    // =========================================

    const [loading, setLoading] = useState(true);


    // =========================================
    // LOAD BOTH SESSIONS
    // =========================================

    useEffect(() => {

        try {

            const savedUser =
                localStorage.getItem("userUser");

            const savedAdmin =
                localStorage.getItem("adminUser");


            if (savedUser) {

                setUser(
                    JSON.parse(savedUser)
                );

            }


            if (savedAdmin) {

                setAdmin(
                    JSON.parse(savedAdmin)
                );

            }

        } catch (error) {

            console.error(
                "Error loading authentication:",
                error
            );

        } finally {

            setLoading(false);

        }

    }, []);


    // =========================================
    // LOGIN
    // =========================================

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
                            email,
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


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Invalid email or password"
                );

            }


            const loggedInUser =
                data.user;


            const token =
                data.token;


            if (!loggedInUser || !token) {

                throw new Error(
                    "Invalid login response from server."
                );

            }


            // =================================
            // ADMIN LOGIN
            // =================================

            if (
                loggedInUser.role === "admin" ||
                loggedInUser.isAdmin === true
            ) {

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

                setAdmin(
                    loggedInUser
                );

                return {
                    ...loggedInUser,
                    token,
                };

            }


            // =================================
            // NORMAL USER LOGIN
            // =================================

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

            setUser(
                loggedInUser
            );


            return {
                ...loggedInUser,
                token,
            };

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            throw error;

        }

    };


    // =========================================
    // USER LOGOUT
    // =========================================

    const logoutUser = () => {

        localStorage.removeItem(
            "userToken"
        );

        localStorage.removeItem(
            "userUser"
        );

        setUser(null);

    };


    // =========================================
    // ADMIN LOGOUT
    // =========================================

    const logoutAdmin = () => {

        localStorage.removeItem(
            "adminToken"
        );

        localStorage.removeItem(
            "adminUser"
        );

        setAdmin(null);

    };


    // =========================================
    // GENERAL LOGOUT
    // =========================================

    const logout = () => {

        logoutUser();
        logoutAdmin();

    };


    // =========================================
    // CONTEXT
    // =========================================

    const value = {

        user,

        admin,

        loading,

        login,

        logout,

        logoutUser,

        logoutAdmin,

        isUserLoggedIn:
            !!user,

        isAdminLoggedIn:
            !!admin,

    };


    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );

};


// =========================================
// USE AUTH
// =========================================

export const useAuth = () => {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

};


export default AuthContext;