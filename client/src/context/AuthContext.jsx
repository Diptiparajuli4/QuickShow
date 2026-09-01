
import React, {
    createContext,
    useContext,
    useState
} from "react";

import axios from "axios";

const AuthContext = createContext(null);

// ==========================================
// BACKEND URL
// ==========================================

axios.defaults.baseURL =
    import.meta.env.VITE_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;


// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider = ({ children }) => {

    // ==========================================
    // CURRENT USER
    // ==========================================

    const [user, setUser] = useState(() => {

        try {

            const storedUser =
                localStorage.getItem("auth_user");

            return storedUser
                ? JSON.parse(storedUser)
                : null;

        } catch (error) {

            console.error(
                "Error loading stored user:",
                error
            );

            return null;

        }

    });


    // ==========================================
    // LOGIN
    // ==========================================

    const login = async (email, password) => {

        try {

            console.log("Sending login request...");
            console.log("Backend:", axios.defaults.baseURL);

            const { data } = await axios.post(
                "/user/login",
                {
                    email,
                    password
                }
            );


            console.log("Login response:", data);


            if (!data.success) {

                throw new Error(
                    data.message || "Login failed"
                );

            }


            const loggedInUser =
                data.user;


            // Save user in React state
            setUser(loggedInUser);


            // Save user in localStorage
            localStorage.setItem(
                "auth_user",
                JSON.stringify(loggedInUser)
            );


            // Save token if backend sends one
            if (data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );

            }


            return loggedInUser;


        } catch (error) {

            console.error(
                "Login error:",
                error.response?.data ||
                error.message
            );


            throw new Error(
                error.response?.data?.message ||
                error.message ||
                "Login failed"
            );

        }

    };


    // ==========================================
    // SIGNUP
    // ==========================================

    const signup = async (
        name,
        email,
        password
    ) => {

        try {

            console.log("Sending signup request...");
            console.log("Backend:", axios.defaults.baseURL);


            const { data } = await axios.post(
                "/user/signup",
                {
                    name,
                    email,
                    password
                }
            );


            console.log(
                "Signup response:",
                data
            );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Signup failed"
                );

            }


            const newUser =
                data.user;


            // Save new user
            setUser(newUser);


            // Save user locally
            localStorage.setItem(
                "auth_user",
                JSON.stringify(newUser)
            );


            // Save token if backend sends one
            if (data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );

            }


            return newUser;


        } catch (error) {

            console.error(
                "Signup error:",
                error.response?.data ||
                error.message
            );


            throw new Error(
                error.response?.data?.message ||
                error.message ||
                "Signup failed"
            );

        }

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        setUser(null);

        localStorage.removeItem(
            "auth_user"
        );

        localStorage.removeItem(
            "token"
        );

    };


    // ==========================================
    // AUTH CONTEXT
    // ==========================================

    return (

        <AuthContext.Provider
            value={{
                user,
                setUser,
                login,
                signup,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

};


// ==========================================
// USE AUTH
// ==========================================

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
