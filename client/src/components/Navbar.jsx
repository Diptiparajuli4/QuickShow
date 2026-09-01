
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Settings,
  Ticket,
  LogOut,
  Plus,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { axios } = useAppContext();

  const [showMenu, setShowMenu] = useState(false);

  // ==========================================
  // SEARCH STATES
  // ==========================================

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [movies, setMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ==========================================
  // FAVORITE STATE
  // ==========================================

  const [hasFavorites, setHasFavorites] = useState(false);

  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // ==========================================
  // CHECK FAVORITES
  // ==========================================

  const checkFavorites = () => {
    try {
      /*
       * Change these keys if your Favorite page
       * uses a different localStorage key.
       */

      const possibleKeys = [
        "quickshow_favorites",
        "favorites",
        "favoriteMovies",
        "favorite",
      ];

      let favoriteMovies = [];

      for (const key of possibleKeys) {
        const storedData =
          localStorage.getItem(key);

        if (!storedData) {
          continue;
        }

        try {
          const parsedData =
            JSON.parse(storedData);

          if (Array.isArray(parsedData)) {
            favoriteMovies = parsedData;
            break;
          }

          /*
           * Also support an object such as:
           *
           * {
           *   movies: [...]
           * }
           */

          if (
            parsedData &&
            Array.isArray(parsedData.movies)
          ) {
            favoriteMovies =
              parsedData.movies;
            break;
          }
        } catch (error) {
          console.error(
            `Error parsing ${key}:`,
            error
          );
        }
      }

      setHasFavorites(
        favoriteMovies.length > 0
      );
    } catch (error) {
      console.error(
        "Error checking favorites:",
        error
      );

      setHasFavorites(false);
    }
  };

  // ==========================================
  // LOAD FAVORITES
  // ==========================================

  useEffect(() => {
    checkFavorites();

    /*
     * Detect changes made in another browser tab.
     */

    const handleStorageChange = () => {
      checkFavorites();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    /*
     * Custom event allows the Favorites page
     * to immediately tell Navbar that favorites
     * have changed in the SAME tab.
     */

    window.addEventListener(
      "favoritesUpdated",
      checkFavorites
    );

    /*
     * Also check periodically so the navbar
     * updates even if the Favorite page changes
     * localStorage without dispatching an event.
     */

    const interval = setInterval(
      checkFavorites,
      1000
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "favoritesUpdated",
        checkFavorites
      );

      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================
  // FETCH MOVIES FROM DATABASE
  // ==========================================

  const fetchMovies = async () => {
    try {
      setSearchLoading(true);

      const { data } =
        await axios.get(
          "/show/now-playing"
        );

      if (data.success) {
        setMovies(data.movies || []);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error(
        "Error fetching movies for search:",
        error
      );

      setMovies([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ==========================================
  // LOAD MOVIES WHEN SEARCH OPENS
  // ==========================================

  useEffect(() => {
    if (searchOpen) {
      fetchMovies();
    }
  }, [searchOpen]);

  // ==========================================
  // SEARCH MOVIES
  // ==========================================

  useEffect(() => {
    const searchValue =
      searchText.trim().toLowerCase();

    if (!searchValue) {
      setSearchResults([]);
      return;
    }

    const results = movies.filter((movie) => {
      const title = (
        movie.title ||
        movie.name ||
        ""
      ).toLowerCase();

      return title.includes(searchValue);
    });

    setSearchResults(results);
  }, [searchText, movies]);

  // ==========================================
  // OPEN MOVIE DETAIL
  // ==========================================

  const handleMovieClick = (movie) => {
    const movieId =
      movie._id || movie.id;

    if (!movieId) {
      return;
    }

    setSearchText("");
    setSearchResults([]);
    setSearchOpen(false);

    navigate(`/movie/${movieId}`);

    window.scrollTo(0, 0);
  };

  // ==========================================
  // CLOSE SEARCH
  // ==========================================

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchText("");
    setSearchResults([]);
  };

  // ==========================================
  // SIGN OUT
  // ==========================================

  const handleLogout = () => {
    setShowMenu(false);

    if (logout) {
      logout();
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }

    navigate("/login");
  };

  // ==========================================
  // USER INFORMATION
  // ==========================================

  const userName =
    user?.name ||
    user?.username ||
    "User";

  const userEmail =
    user?.email ||
    "user@example.com";

  const userInitial =
    userName.charAt(0).toUpperCase();

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* ================================= */}
        {/* LOGO */}
        {/* ================================= */}

        <Link
          to="/"
          className="text-2xl font-bold text-white"
        >
          Quick
          <span className="text-primary">
            Show
          </span>
        </Link>

        {/* ================================= */}
        {/* NAVIGATION */}
        {/* ================================= */}

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-200">

          <Link
            to="/"
            className="hover:text-primary transition"
          >
            Home
          </Link>

          <Link
            to="/movies"
            className="hover:text-primary transition"
          >
            Movies
          </Link>

          <Link
            to="/theaters"
            className="hover:text-primary transition"
          >
            Theaters
          </Link>

          <Link
            to="/releases"
            className="hover:text-primary transition"
          >
            Releases
          </Link>

          {/* ================================= */}
          {/* FAVORITES */}
          {/* ================================= */}

          {hasFavorites && (
            <Link
              to="/favorite"
              className="hover:text-primary transition"
            >
              Favorites
            </Link>
          )}

        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="flex items-center gap-5">

          {/* ================================= */}
          {/* SEARCH */}
          {/* ================================= */}

          <div
            className="relative"
            ref={searchRef}
          >

            {searchOpen ? (

              <div className="relative">

                {/* SEARCH INPUT */}

                <div className="flex items-center gap-2 border border-gray-600 rounded-full px-3 py-1.5 bg-black/80">

                  <Search
                    size={18}
                    className="text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchText}
                    onChange={(e) =>
                      setSearchText(
                        e.target.value
                      )
                    }
                    className="bg-transparent outline-none text-sm text-white w-48"
                    autoFocus
                  />

                  <X
                    size={18}
                    className="cursor-pointer text-gray-300 hover:text-white"
                    onClick={closeSearch}
                  />

                </div>

                {/* SEARCH RESULTS */}

                {searchText.trim() !== "" && (

                  <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">

                    {searchLoading ? (

                      <div className="px-4 py-4 text-sm text-gray-400 text-center">
                        Searching...
                      </div>

                    ) : searchResults.length > 0 ? (

                      <div className="max-h-80 overflow-y-auto">

                        {searchResults.map(
                          (movie) => {

                            const movieId =
                              movie._id ||
                              movie.id;

                            return (

                              <button
                                key={movieId}
                                onClick={() =>
                                  handleMovieClick(
                                    movie
                                  )
                                }
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition text-left"
                              >

                                {/* POSTER */}

                                <img
                                  src={
                                    movie.poster_path ||
                                    movie.poster ||
                                    movie.image
                                  }
                                  alt={
                                    movie.title ||
                                    "Movie"
                                  }
                                  className="w-10 h-14 object-cover rounded"
                                />

                                {/* DETAILS */}

                                <div className="min-w-0">

                                  <p className="text-white text-sm font-medium truncate">
                                    {movie.title ||
                                      movie.name ||
                                      "Untitled Movie"}
                                  </p>

                                  {movie.release_date && (

                                    <p className="text-gray-400 text-xs mt-1">
                                      {
                                        movie.release_date
                                      }
                                    </p>

                                  )}

                                </div>

                              </button>

                            );
                          }
                        )}

                      </div>

                    ) : (

                      <div className="px-4 py-5 text-center">

                        <p className="text-gray-400 text-sm">
                          Movie not available
                        </p>

                      </div>

                    )}

                  </div>

                )}

              </div>

            ) : (

              <Search
                size={22}
                className="text-white cursor-pointer hover:text-primary transition"
                onClick={() =>
                  setSearchOpen(true)
                }
              />

            )}

          </div>

          {/* ================================= */}
          {/* USER PROFILE */}
          {/* ================================= */}

          <div
            className="relative"
            ref={menuRef}
          >

            {/* PROFILE BUTTON */}

            <button
              onClick={() =>
                setShowMenu(
                  (prev) => !prev
                )
              }
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-300 hover:scale-105 transition"
            >

              {user?.image ? (

                <img
                  src={user.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />

              ) : (

                <span className="text-black font-semibold">
                  {userInitial}
                </span>

              )}

            </button>

            {/* ================================= */}
            {/* DROPDOWN */}
            {/* ================================= */}

            {showMenu && (

              <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-2xl overflow-hidden text-gray-800">

                {/* USER HEADER */}

                <div className="px-5 py-4 border-b border-gray-200">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">

                      {user?.image ? (

                        <img
                          src={user.image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <span className="text-gray-700 font-bold text-lg">
                          {userInitial}
                        </span>

                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold truncate">
                        {userName}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </p>

                    </div>

                  </div>

                </div>

                {/* MANAGE ACCOUNT */}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-100 transition text-left"
                >

                  <Settings
                    size={18}
                    className="text-gray-600"
                  />

                  <span className="text-sm">
                    Manage Account
                  </span>

                </button>

                {/* MY BOOKINGS */}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/my-booking");
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-100 transition text-left"
                >

                  <Ticket
                    size={18}
                    className="text-gray-600"
                  />

                  <span className="text-sm">
                    My Bookings
                  </span>

                </button>

                {/* SIGN OUT */}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-100 transition text-left"
                >

                  <LogOut
                    size={18}
                    className="text-gray-600"
                  />

                  <span className="text-sm">
                    Sign out
                  </span>

                </button>

                {/* ADD ACCOUNT */}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3 border-t border-gray-200 hover:bg-gray-100 transition text-left"
                >

                  <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">

                    <Plus
                      size={13}
                      className="text-gray-500"
                    />

                  </div>

                  <span className="text-sm">
                    Add account
                  </span>

                </button>

                {/* FOOTER */}

                <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 text-center">

                  <p className="text-[11px] text-gray-400">
                    QuickShow Account
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;
