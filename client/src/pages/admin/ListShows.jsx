
import React, { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import dateFormat from "../../lib/dateFormat";

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || "Rs.";

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // GET ALL SHOWS
  // ============================================

  const getAllShows = () => {
    try {
      // Get shows saved from AddShows page
      const savedShows = JSON.parse(
        localStorage.getItem("quickshow_shows") || "[]"
      );

      console.log("Saved Shows:", savedShows);

      const formattedShows = [];

      // ============================================
      // CONVERT EACH DATE/TIME INTO A SHOW
      // ============================================

      savedShows.forEach((show) => {
        // Find movie details
        const movie = dummyShowsData.find(
          (item) =>
            String(item.id) === String(show.movieId) ||
            String(item._id) === String(show.movieId)
        );

        if (!movie) {
          return;
        }

        /*
          dateTimes format from AddShows:

          {
            "2026-09-01": ["10:00", "14:00"],
            "2026-09-02": ["18:00"]
          }
        */

        Object.entries(show.dateTimes || {}).forEach(
          ([date, times]) => {
            times.forEach((time) => {
              const showDateTime = `${date}T${time}`;

              /*
                Each show gets its own object.
              */

              formattedShows.push({
                _id: `${show.createdAt}-${date}-${time}`,

                movie: movie,

                showDateTime: showDateTime,

                showPrice: Number(show.price || 0),

                // If occupiedSeats exists, use it.
                // Otherwise create an empty object.
                occupiedSeats: show.occupiedSeats || {},
              });
            });
          }
        );
      });

      // Sort newest/upcoming shows first
      formattedShows.sort(
        (a, b) =>
          new Date(a.showDateTime) -
          new Date(b.showDateTime)
      );

      setShows(formattedShows);
    } catch (error) {
      console.error("Error getting shows:", error);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD SHOWS
  // ============================================

  useEffect(() => {
    getAllShows();

    /*
      Listen for changes from other pages/tabs.
    */
    const handleStorageChange = () => {
      getAllShows();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

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
        text1="List"
        text2="Shows"
      />

      <div className="max-w-5xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">

          {/* TABLE HEADER */}

          <thead>
            <tr className="bg-primary/20 text-left text-white">

              <th className="p-3 font-medium pl-5">
                Movie Name
              </th>

              <th className="p-3 font-medium">
                Show Time
              </th>

              <th className="p-3 font-medium">
                Show Price
              </th>

              <th className="p-3 font-medium">
                Total Bookings
              </th>

              <th className="p-3 font-medium">
                Earnings
              </th>

            </tr>
          </thead>

          {/* TABLE BODY */}

          <tbody className="text-sm font-light">

            {shows.length > 0 ? (
              shows.map((show) => {

                const totalBookings =
                  Object.keys(
                    show.occupiedSeats || {}
                  ).length;

                const earnings =
                  totalBookings *
                  Number(show.showPrice || 0);

                return (
                  <tr
                    key={show._id}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/20 transition"
                  >

                    {/* MOVIE */}

                    <td className="p-3 min-w-45 pl-5">
                      {show.movie?.title ||
                        show.movie?.name ||
                        "Unknown Movie"}
                    </td>

                    {/* SHOW TIME */}

                    <td className="p-3">
                      {dateFormat(
                        show.showDateTime
                      )}
                    </td>

                    {/* PRICE */}

                    <td className="p-3">
                      {currency}
                      {show.showPrice}
                    </td>

                    {/* BOOKINGS */}

                    <td className="p-3">
                      {totalBookings}
                    </td>

                    {/* EARNINGS */}

                    <td className="p-3">
                      {currency}
                      {earnings}
                    </td>

                  </tr>
                );
              })
            ) : (

              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-400"
                >
                  No shows found. Add a show from Add Shows.
                </td>
              </tr>

            )}

          </tbody>

        </table>
      </div>
    </>
  );
};

export default ListShows;

