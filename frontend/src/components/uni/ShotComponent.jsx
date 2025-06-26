// ShotComponent.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ShotComponent = ({ title, description, thumbnail,id }) => {
  const navigate = useNavigate()

  return (
    <div onClick={()=>navigate(`/shot/${id}/a`)} className="bg-white p-4 rounded-lg h-[600px] w-[350px] shadow-md">
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-3/4 object-cover rounded-lg mb-4"
      />
      <h3 className="font-semibold text-xl">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
    
    </div>
  );
};

export default ShotComponent;
