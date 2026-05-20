import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { useState } from "react";
import { useClerk, UserButton, useUser } from "@clerk/react";
import { useAppContext } from "../context/AppContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // 👈
  const [searchQuery, setSearchQuery] = useState(""); // 👈
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const { favouriteMovies } = useAppContext();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5">
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="" className="w-36 h-auto" />
      </Link>
      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isOpen ? "max-md:w-full" : "max-md:w-0"}`}
      >
        <XIcon
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
        <Link
          onClick={() => {
            scrollTo(0, 0);
            setIsOpen(false);
          }}
          to="/"
        >
          Home
        </Link>
        <Link
          to="/movies"
          onClick={() => {
            scrollTo(0, 0);
            setIsOpen(false);
          }}
        >
          Movies
        </Link>
        <Link
          to="/about"
          onClick={() => {
            scrollTo(0, 0);
            setIsOpen(false);
          }}
        >
          About Us
        </Link>
        {favouriteMovies.length > 0 && (
          <Link
            to="/favourite"
            onClick={() => {
              scrollTo(0, 0);
              setIsOpen(false);
            }}
          >
            Favourite
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* 👇 search bar */}
        <form
          onSubmit={handleSearch}
          className={`flex items-center gap-2 bg-white/10 border border-gray-300/20 rounded-full px-3 py-1.5 transition-all duration-300 ${searchOpen ? "w-48 md:w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"}`}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="bg-transparent outline-none text-sm text-white placeholder-gray-400 w-full"
            autoFocus={searchOpen}
          />
          <button type="submit">
            <SearchIcon className="w-4 h-4 text-gray-300" />
          </button>
        </form>

        {/* 👇 toggle search */}
        <SearchIcon
          className="max-md:hidden w-6 h-6 cursor-pointer"
          onClick={() => setSearchOpen(!searchOpen)}
        />

        {!isLoaded ? (
          <div className="px-4 py-1 sm:px-7 sm:py-2 w-20 h-9 rounded-full bg-white/10 animate-pulse" />
        ) : !user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus width={15} />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>
      <MenuIcon
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}

export default Navbar;
