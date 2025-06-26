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
        <nav className={`bg-gray-900 text-white ${i} z-10 shadow-md py-4 w-full px-8 flex justify-between items-center`}>
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
                <img 
                    src="https://via.placeholder.com/50" 
                    alt="NewTube Logo" 
                    className="w-10 h-10 rounded-full"
                />
                <span className="text-2xl font-extrabold text-gradient">NewTube</span>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-8">
                <NavLink
                    to="/home"
                    className={({ isActive }) => `flex items-center text-lg ${isActive ? 'text-blue-500' : 'text-white'} hover:text-blue-500`}
                >
                    <FaHome className="mr-2" /> Home
                </NavLink>
                <NavLink
                    to="/discover/"
                    className={({ isActive }) => `flex items-center text-lg ${isActive ? 'text-blue-500' : 'text-white'} hover:text-blue-500`}
                >
                    <FaSearch className="mr-2" /> Discover
                </NavLink>
                <NavLink
                    to="/tweets"
                    className={({ isActive }) => `flex items-center text-lg ${isActive ? 'text-blue-500' : 'text-white'} hover:text-blue-500`}
                >
                    <FaHouzz className="mr-2" /> Tweets
                </NavLink>
                <NavLink
                    to="/videos"
                    className={({ isActive }) => `flex items-center text-lg ${isActive ? 'text-blue-500' : 'text-white'} hover:text-blue-500`}
                >
                    <FaVideo className="mr-2" /> Videos
                </NavLink>
                <NavLink
                    to="/shot"
                    className={({ isActive }) => `flex items-center text-lg ${isActive ? 'text-blue-500' : 'text-white'} hover:text-blue-500`}
                >
                    <FaCamera className="mr-2" /> Shots
                </NavLink>
                {/* Conditional Chat Button */}
                {isAuthenticated ? (
                    <div className="relative flex items-center text-lg hover:text-blue-500">
                        <FaCommentAlt className="mr-2" />
                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {messageCount}
                        </span>
                    </div>
                ) : (
                    <NavLink
                        to="/chat"
                        className={({ isActive }) => `flex items-center text-lg ${isActive ? 'text-blue-500' : 'text-white'} hover:text-blue-500`}
                    >
                        <FaCommentAlt className="mr-2" /> Chat
                    </NavLink>
                )}
            </div>

            {/* Conditional Login/Signup Button */}
            {isAuthenticated ? (<div className='flex'>
            <NavLink
                        to="/user"
                        className={({ isActive }) => `text-lg ${isActive ? 'text-blue-500' : 'text-gray-400'} hover:text-white`}
                    >
                <FaUser className="mr-5 mt-2" /> </NavLink>
                <button onClick={handleLogout} className="text-lg text-gray-400 hover:text-white">Logout</button></div>
            ) : (
                <div className="flex space-x-6">
                    <NavLink
                        to="/login"
                        className={({ isActive }) => `text-lg ${isActive ? 'text-blue-500' : 'text-gray-400'} hover:text-white`}
                    >
                        Login
                    </NavLink>
                    <NavLink
                        to="/register"
                        className={({ isActive }) => `px-4 py-2 bg-blue-600 rounded-full text-white text-lg ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                    >
                        Sign Up
                    </NavLink>
                </div>
            )}
        </nav>
    );
};

export default NavBar;
