import React from 'react';
import { useNavigate } from 'react-router-dom';
const Shot = ({ title, thumbnail,id="675d259b464bf53a4a5de8e4" }) => {
    const navigate = useNavigate();

    const handleVideoClick = () => {
        navigate(`/shot/${id}`); // Navigate to the video page with the ID
    };
    return (
        <div   onClick={handleVideoClick} className="flex flex-col items-center bg-white shadow-lg rounded-lg p-4 w-52">
            <img
                src={thumbnail}
                alt={title}
                className="w-full h-60 cursor-pointer object-cover rounded-lg mb-3 hover:scale-105 transition-transform duration-300"
            />
            <h4 className="text-lg font-semibold text-gray-900 text-center">{title}</h4>
        </div>
    );
};

export default Shot;
