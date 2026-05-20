import { ArrowRight, CalendarIcon, ClockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import timeFormat from "../lib/timeFormat";

function HeroSection() {
  const navigate = useNavigate();
  const { axios } = useAppContext();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchHeroMovie = async () => {
      try {
        const { data } = await axios.get("/api/show/all");
        if (data.success && data.shows.length > 0) {
          // pick a random movie from available shows
          const random =
            data.shows[Math.floor(Math.random() * data.shows.length)];
          setMovie(random);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchHeroMovie();
  }, []);

  return (
    <div
      className="flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center h-screen transition-all duration-500"
      style={{
        backgroundImage: movie
          ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
          : "url('/backgroundImage.png')",
      }}
    >
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 -z-0" />
      <div className="relative z-10 flex flex-col gap-4">
        <h1 className="text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110">
          {movie?.title || "Guardians of the Galaxy"}
        </h1>
        <div className="flex items-center gap-4 text-gray-300">
          <span>
            {movie?.genres?.map((g) => g.name).join(" | ") ||
              "Action | Adventure"}
          </span>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4.5 h-4.5" />
            {movie?.release_date?.split("-")[0] || "2018"}
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4.5 h-4.5" />
            {movie ? timeFormat(movie.runtime) : "2h 8m"}
          </div>
        </div>
        <p className="max-w-md text-gray-300">
          {movie?.overview ||
            "A group of intergalactic criminals must pull together to stop a fanatical warrior."}
        </p>
        <button
          onClick={() => navigate(movie ? `/movies/${movie._id}` : "/movies")}
          className="flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer w-fit"
        >
          {movie ? "Book Tickets" : "Explore Movies"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default HeroSection;
