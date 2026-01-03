import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";

const ShotComponent = ({ title, description, thumbnail, id }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shot/${id}/a`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-gray-700/50 hover:border-teal-500 w-full max-w-[350px] mx-auto"
    >
      {/* Thumbnail Container - Fixed aspect ratio */}
      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <FaPlay className="text-gray-900 text-2xl ml-1" />
          </div>
        </div>

        {/* Gradient Overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
      </div>

      {/* Content - Positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <h3 className="font-bold text-lg mb-1 line-clamp-2 group-hover:text-teal-400 transition-colors drop-shadow-lg">
          {title}
        </h3>
        <p className="text-gray-300 text-sm line-clamp-2 drop-shadow-md">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ShotComponent;