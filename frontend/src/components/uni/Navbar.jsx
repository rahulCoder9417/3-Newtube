import React from 'react';
import { NavLink,useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaVideo, FaCamera, FaCommentAlt, FaUser, FaHouzz } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { onSubmitAxios } from '../../utils/axios';
 // Assuming the path is correct

const NavBar = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    

    // Dummy message count for chat
    const messageCount = 3;

    const handleLogout = async() => {
        const res =await onSubmitAxios("post","users/logout")
        dispatch(logout());
    };
    const location = useLocation();
    let i;
    if (location.pathname.startsWith("/shot/") || location.pathname.startsWith("/discover/")) {
        i="fixed top-0"
    }
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0b1220]/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
      
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="../../public/newtube.png"
                alt="NewTube"
                className="h-12 w-12 object-cover mt-2 rounded-full"
              />
              <span className="text-xl font-bold tracking-wide text-white">
                New<span className="text-blue-500">Tube</span>
              </span>
            </div>
      
            {/* Navigation */}
            <div className="flex items-center gap-6">
              {[
                { to: "/home", label: "Home", icon: <FaHome /> },
                { to: "/discover", label: "Discover", icon: <FaSearch /> },
                { to: "/tweets", label: "Tweets", icon: <FaHouzz /> },
                { to: "/videos", label: "Videos", icon: <FaVideo /> },
                { to: "/shot", label: "Shots", icon: <FaCamera /> },
              ].map(({ to, label, icon }) => (
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
                  {label}
                </NavLink>
              ))}
      
              {/* Chat / Notifications */}
              {isAuthenticated && (
                <div className="relative cursor-pointer text-gray-400 hover:text-white">
                  <FaCommentAlt />
                  {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                      {messageCount}
                    </span>
                  )}
                </div>
              )}
            </div>
      
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NavLink
                  to="/user"
                  className="text-gray-400 hover:text-white"
                >
                  <FaUser />
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-white/10 px-3 py-1 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink
                  to="/login"
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      );
      
      
};

export default NavBar;
