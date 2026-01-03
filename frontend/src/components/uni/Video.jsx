import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'; 
import VideoThreeDots from '../playlist/VideoThreeDots';
import { FaPlay, FaEye, FaClock } from 'react-icons/fa';

const VideoP = ({ 
  title, 
  thumbnail, 
  views, 
  duration, 
  createdAt, 
  id = "676f9af67e03aa1457152778" 
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleVideoClick = () => {
    navigate(`/video/${id}`);
  };

  // Format the createdAt date using dayjs
  const formattedCreatedAt = (new Date(createdAt)).toISOString().split('T')[0];

  // Convert the duration from seconds to MM:SS format
  const formattedDuration = (() => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  })();

  // Format views count
  const formattedViews = (() => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views;
  })();

  const ref = useRef(null);
  return (
    <div 
      ref={ref}
      className="group overflow relative bg-gradient-to-br  from-gray-800 to-gray-900 rounded-xl  shadow-lg hover:shadow-2xl transition-all duration-300 border  border-gray-700/50 hover:border-gray-600 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-gray-950">
        <img
          onClick={handleVideoClick}
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white flex items-center gap-1">
          <FaClock className="text-[10px]" />
          {formattedDuration}
        </div>

        {/* Play Overlay on Hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300">
            <div className="bg-blue-500 hover:bg-blue-600 p-4 rounded-full transform transition-transform hover:scale-110">
              <FaPlay className="text-white text-xl ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h4 
          onClick={handleVideoClick}
          className="text-sm font-semibold text-white line-clamp-2 mb-2 transition-colors leading-tight"
        >
          {title}
        </h4>
        
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <FaEye className="text-blue-400" />
            <span>{formattedViews} views</span>
          </div>
          <span>•</span>
          <span>{formattedCreatedAt}</span>
        </div>
      </div>

      {/* Three Dots Menu */}
      <div className="absolute bottom-1 right-2 z-10 duration-300">
        <VideoThreeDots videoRef={ref} videoId={id} />
      </div>

      {/* Gradient Border Effect on Hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-blue-500/20 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
};

export default VideoP;