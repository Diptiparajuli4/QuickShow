import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UsersIcon,
  StarIcon,
} from "lucide-react";

import React, { useEffect, useState } from "react";

import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import BlurCircle from "../../components/BlurCircle";
import dateFormat from "../../lib/dateFormat";

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY || "Rs.";

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });

  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD SHOWS FROM LOCAL STORAGE
  // ============================================

  const fetchDashboardData = () => {
    try {
      // Get shows added from AddShows page
      const savedShows = JSON.parse(
        localStorage.getItem("quickshow_shows") || "[]"
      );

      console.log("Saved Shows:", savedShows);

      // Create active shows for dashboard
      const activeShows = [];

      savedShows.forEach((show) => {
        // Find movie from dummyShowsData
        const movie = dummyShowsData.find(
          (movie) =>
            String(movie.id) === String(show.movieId) ||
            String(movie._id) === String(show.movieId)
        );

        // If movie is not found, don't display it
        if (!movie) {
          return;
        }

        // dateTimes looks like:
        // {
        //   "2026-09-01": ["10:00", "14:00"],
        //   "2026-09-02": ["18:00"]
        // }

        Object.entries(show.dateTimes || {}).forEach(
          ([date, times]) => {
            times.forEach((time) => {
              activeShows.push({
                _id: `${show.createdAt}-${date}-${time}`,

                movie: movie,

                showPrice: show.price,

                showDateTime: `${date}T${time}`,
              });
            });
          }
        );
      });

      // ============================================
      // CALCULATE TOTAL REVENUE
      // ============================================

      const totalRevenue = activeShows.reduce(
        (total, show) => total + Number(show.showPrice || 0),
        0
      );

      // ============================================
      // DASHBOARD DATA
      // ============================================

      setDashboardData({
        totalBookings: 0,
        totalRevenue: totalRevenue,
        activeShows: activeShows,
        totalUser: 0,
      });

    } catch (error) {
      console.error(
        "Error loading dashboard data:",
        error
      );

      setDashboardData({
        totalBookings: 0,
        totalRevenue: 0,
        activeShows: [],
        totalUser: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD DATA WHEN DASHBOARD OPENS
  // ============================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ============================================
  // DASHBOARD CARDS
  // ============================================

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings,
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value: `${currency}${dashboardData.totalRevenue}`,
      icon: CircleDollarSignIcon,
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length,
      icon: PlayCircleIcon,
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser,
      icon: UsersIcon,
    },
  ];

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return <Loading />;
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <>
      <Title
        text1="Admin"
        text2="Dashboard"
      />

      {/* ========================================= */}
      {/* DASHBOARD CARDS */}
      {/* ========================================= */}

      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle
          top="-100px"
          left="0"
        />

        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
              >
                <div>
                  <h1 className="text-sm">
                    {card.title}
                  </h1>

                  <p className="text-xl font-medium mt-1">
                    {card.value}
                  </p>
                </div>

                <Icon className="w-6 h-6" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================= */}
      {/* ACTIVE SHOWS */}
      {/* ========================================= */}

      <p className="mt-10 text-lg font-medium">
        Active Shows
      </p>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4 max-w-5xl">
        <BlurCircle
          top="100px"
          left="-10%"
        />

        {dashboardData.activeShows.length > 0 ? (
          dashboardData.activeShows.map((show) => (
            <div
              key={show._id}
              className="rounded-lg overflow-hidden hover:-translate-y-1 transition duration-300 bg-gray-900 border border-gray-800"
            >
              {/* ================================= */}
              {/* MOVIE POSTER */}
              {/* ================================= */}

              <div className="w-full h-48 bg-black">
                <img
                  src={
                    show.movie?.poster_path ||
                    show.movie?.poster ||
                    show.movie?.image
                  }
                  alt={
                    show.movie?.title ||
                    "Movie"
                  }
                  className="h-full w-full object-contain"
                />
              </div>

              {/* ================================= */}
              {/* MOVIE TITLE */}
              {/* ================================= */}

              <p className="font-medium px-3 pt-3 truncate">
                {show.movie?.title ||
                  show.movie?.name ||
                  "Untitled Movie"}
              </p>

              {/* ================================= */}
              {/* PRICE + RATING */}
              {/* ================================= */}

              <div className="flex items-center justify-between px-3 mt-2">
                <p className="text-lg font-medium">
                  {currency}
                  {show.showPrice}
                </p>

                <p className="flex items-center gap-1 text-sm text-gray-400">
                  <StarIcon className="w-4 h-4 text-primary fill-primary" />

                  {show.movie?.vote_average
                    ? show.movie.vote_average.toFixed(1)
                    : "N/A"}
                </p>
              </div>

              {/* ================================= */}
              {/* SHOW DATE & TIME */}
              {/* ================================= */}

              <p className="px-3 py-3 text-sm text-gray-400">
                {dateFormat(show.showDateTime)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            No Active Shows Available
          </p>
        )}
      </div>
    </>
  );
};

export default Dashboard;