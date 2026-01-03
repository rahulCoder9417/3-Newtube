import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaVideo,
  FaCamera,
  FaUser,
  FaHouzz,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { onSubmitAxios } from "../../utils/axios";

const NavBar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [menuOpen, setMenuOpen] = useState(false);

  // Check if current route is a shot page
  const isShotPage = location.pathname.startsWith('/shot');

  const handleLogout = async () => {
    await onSubmitAxios("post", "users/logout");
    dispatch(logout());
    setMenuOpen(false);
  };

  const navItems = [
    { to: "/home", label: "Home", icon: <FaHome /> },
    { to: "/discover", label: "Discover", icon: <FaSearch /> },
    { to: "/tweets", label: "Tweets", icon: <FaHouzz /> },
    { to: "/videos", label: "Videos", icon: <FaVideo /> },
    { to: "/shot", label: "Shots", icon: <FaCamera /> },
  ];

  return (
    <nav 
      className={`${isShotPage ? 'fixed' : 'sticky'} top-0 z-50 w-full border-b border-white/5 bg-[#0b1220]/90 backdrop-blur`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <NavLink to="/home" className="flex items-center gap-2">
          <img
            src="/newtube.png"
            alt="NewTube"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-xl font-bold text-white">
            New<span className="text-blue-500">Tube</span>
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition ${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-white"
                }`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Auth Section (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NavLink 
                to="/user" 
                className="text-gray-400 hover:text-white transition"
                aria-label="Profile"
              >
                <FaUser size={20} />
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink 
                to="/login" 
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-2xl p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0b1220] px-6 py-4 space-y-3">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 text-sm py-2 ${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-white"
                }`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="border-t border-white/10 pt-4 space-y-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/user"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-gray-400 hover:text-white"
                >
                  <FaUser />
                  <span>Profile</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-md border border-white/10 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-gray-400 hover:text-white"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 transition"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;