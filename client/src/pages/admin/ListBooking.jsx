/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";

function ListBooking() {
  const { axios, getToken, user } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(data.bookings);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);
  return !isLoading ? (
    <>
      <Title text1="List" text2="Bookings" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium p1-5">User Name</th>
              <th className="p-2 font-medium">Movie Name</th>

              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium ">Seats</th>
              <th className="p-2 font-medium ">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {bookings
              .filter((item) => item.show?.movie) // 👈 add this
              .map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 mib-w-45 pl-5">{item.user.name}</td>
                  <td className="p-2">{item.show.movie.title}</td>

                  <td className="p-2">{dateFormat(item.show.showDateTime)}</td>
                  <td className="p-2">
                    {Object.keys(item.bookedSeats).length}
                  </td>
                  <td className="p-2">
                    {currency}
                    {item.amount}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
}

export default ListBooking;
