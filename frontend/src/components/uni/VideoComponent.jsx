// VideoComponent.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const VideoComponent = ({ title, description, id, thumbnail }) => {
    const navigate = useNavigate();

    const handleVideoClick = () => {
        navigate(`/video/${id}`); // Navigate to the video page with the ID
    };

  return (
    <div onClick={handleVideoClick} className="bg-white p-4 rounded-lg shadow-md">
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h3 className="font-semibold text-xl">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
    </div>
  );
};

export default VideoComponent;
