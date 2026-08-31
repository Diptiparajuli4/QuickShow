
import React, { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";

const ListBookings = () => {
  const currency =
    import.meta.env.VITE_CURRENCY || "Rs.";

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // DATE FORMAT
  // ============================================

  const dateFormat = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(date).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch (error) {
      return "Invalid Date";
    }
  };

  // ============================================
  // GET ALL BOOKINGS
  // ============================================

  const getAllBookings = () => {
    try {
      const savedBookings = JSON.parse(
        localStorage.getItem(
          "quickshow_bookings"
        ) || "[]"
      );

      console.log(
        "Saved Bookings:",
        savedBookings
      );

      setBookings(savedBookings);
    } catch (error) {
      console.error(
        "Error loading bookings:",
        error
      );

      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // LOAD BOOKINGS
  // ============================================

  useEffect(() => {
    getAllBookings();

    const handleStorageChange = () => {
      getAllBookings();
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

  if (isLoading) {
    return <Loading />;
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <>
      <Title
        text1="List"
        text2="Bookings"
      />

      <div className="max-w-6xl mt-6 overflow-x-auto">

        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">

          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <thead>
            <tr className="bg-primary/20 text-left text-white">

              <th className="p-3 font-medium pl-5">
                User Name
              </th>

              <th className="p-3 font-medium">
                Movie Name
              </th>

              <th className="p-3 font-medium">
                Show Time
              </th>

              <th className="p-3 font-medium">
                Seats
              </th>

              <th className="p-3 font-medium">
                Amount
              </th>

            </tr>
          </thead>

          {/* ================================= */}
          {/* BODY */}
          {/* ================================= */}

          <tbody className="text-sm">

            {bookings.length > 0 ? (

              bookings.map((item, index) => {

                /*
                  Support different possible
                  booking structures.
                */

                const userName =
                  item.user?.name ||
                  item.userName ||
                  item.name ||
                  "Unknown User";

                const movieName =
                  item.show?.movie?.title ||
                  item.movie?.title ||
                  item.movieName ||
                  "Unknown Movie";

                const showTime =
                  item.show?.showDateTime ||
                  item.showDateTime ||
                  item.dateTime;

                // Get seats
                let seats = [];

                if (item.bookedSeats) {
                  if (
                    Array.isArray(
                      item.bookedSeats
                    )
                  ) {
                    seats =
                      item.bookedSeats;
                  } else {
                    seats =
                      Object.values(
                        item.bookedSeats
                      );
                  }
                } else if (
                  item.seats
                ) {
                  seats = Array.isArray(
                    item.seats
                  )
                    ? item.seats
                    : Object.values(
                        item.seats
                      );
                }

                const amount =
                  Number(item.amount) ||
                  Number(item.totalAmount) ||
                  0;

                return (
                  <tr
                    key={
                      item._id ||
                      item.id ||
                      index
                    }
                    className="border-b border-primary/20 bg-primary/5 even:bg-primary/10 hover:bg-primary/20 transition"
                  >

                    {/* USER */}

                    <td className="p-4 pl-5">
                      {userName}
                    </td>

                    {/* MOVIE */}

                    <td className="p-4">
                      {movieName}
                    </td>

                    {/* SHOW TIME */}

                    <td className="p-4">
                      {dateFormat(
                        showTime
                      )}
                    </td>

                    {/* SEATS */}

                    <td className="p-4">
                      {seats.length > 0
                        ? seats.join(", ")
                        : "-"}
                    </td>

                    {/* AMOUNT */}

                    <td className="p-4">
                      {currency}
                      {amount}
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
                  No bookings found.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>
    </>
  );
};

export default ListBookings;

