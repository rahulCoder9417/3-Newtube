import React from 'react';
import { useNavigate } from 'react-router-dom';

function Avatar({ avatar, border = "none",  id=null,navigateTo = "dashboard" ,dimension="w-12 h-12"}) {
  const navigate = useNavigate(); 
  const borderClass = border === "none" ? `` : `border-[3px] border-${border}-500`;


  const handleClick = () => {
    if (navigateTo === "dashboard") {
      navigate(`/dashboard/${id}`); 
    }
    
  };

  return (
    <img
      src={avatar || 'https://via.placeholder.com/50'} // Default avatar if none provided
      alt="Avatar"
      className={`${dimension} rounded-full object-cover ${borderClass} cursor-pointer`} // Add cursor-pointer for clickability
      onClick={handleClick} // Attach the click event
    />
  );
}

export default Avatar;
