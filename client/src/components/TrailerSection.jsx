import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import BlurCircle from "./BlurCircle";
import { PlayCircleIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext"; // 👈 import context

function TrailerSection() {
  const [trailers, setTrailers] = useState([]);
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const { axios, image_base_url } = useAppContext(); // 👈 use axios from context

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const { data } = await axios.get("/api/show/all");

        if (data.success) {
          const moviesWithTrailers = data.shows
            .filter((movie) => movie && movie.trailerUrl)
            .map((movie) => ({
              id: movie._id,
              title: movie.title,
              videoUrl: movie.trailerUrl,
              image: `${image_base_url}${movie.backdrop_path}`,
            }));

          setTrailers(moviesWithTrailers);
          if (moviesWithTrailers.length > 0) {
            setCurrentTrailer(moviesWithTrailers[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch trailers:", err);
      }
    };

    fetchTrailers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentTrailer) return null;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <p className="text-gray-300 font-medium text-lg max-w-240 mx-auto">
        Trailers
      </p>
      <div className="relative mt-6">
        <BlurCircle top="-100px" right="-100px" />
        <ReactPlayer
          src={currentTrailer.videoUrl}
          controls
          className="mx-auto max-w-full"
          width="960px"
          height="540px"
        />
      </div>

      <div className="group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
        {trailers.map((trailer) => (
          <div
            key={trailer.id}
            className="relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer"
            onClick={() => setCurrentTrailer(trailer)}
          >
            <img
              src={trailer.image}
              alt={trailer.title}
              className="rounded-lg w-full h-full object-cover brightness-75"
            />
            <PlayCircleIcon
              strokeWidth={1.6}
              className="absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrailerSection;
