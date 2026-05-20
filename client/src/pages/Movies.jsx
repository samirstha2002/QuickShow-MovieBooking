import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom"; // 👈

function Movies() {
  const { shows } = useAppContext();
  const [searchParams] = useSearchParams(); // 👈
  const searchQuery = searchParams.get("search") || ""; // 👈

  // 👇 filter by search query if present, otherwise show all
  const filteredShows = searchQuery
    ? shows.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : shows;

  return filteredShows.length > 0 ? (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      <h1 className="text-lg font-medium my-4">
        {searchQuery ? `Results for "${searchQuery}"` : "Now Showing"}{" "}
        {/* 👈 */}
      </h1>
      <div className="flex flex-wrap max-sm:*:justify-center gap-8">
        {filteredShows.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center">
        {searchQuery
          ? `No results for "${searchQuery}"`
          : "No movies Available"}{" "}
        {/* 👈 */}
      </h1>
    </div>
  );
}

export default Movies;
