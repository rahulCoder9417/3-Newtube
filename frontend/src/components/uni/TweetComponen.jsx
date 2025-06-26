import React from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'; // React Icons for like/dislike
import {  IconButton } from '@mui/material'; // Material-UI components
import Avatar from './Avatar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const TweetComponen = ({ avatar, fullName, username, content, image=null }) => {
    const [likeCount, setLikeCount] = useState(0);
    const navigate = useNavigate();
  const [dislikeCount, setDislikeCount] = useState(0);

  // Handle Like button click
  const handleLike = () => {
    setLikeCount(likeCount + 1);
  };
  const nav=()=>{
    navigate("/h")
  }

  // Handle Dislike button click
  const handleDislike = () => {
    setDislikeCount(dislikeCount + 1);
  };
  return (
    <div onClick={nav} className="bg-gray-950 cursor-pointer text-white p-6 rounded-lg max-w-lg mx-auto my-4 shadow-md">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <Avatar avatar={avatar} />
        <div>
          {/* User Name and Username */}
          <p className="text-base font-semibold">{fullName}</p>
          <p className="text-gray-400 text-xs">@{username}</p>
        </div>
      </div>

      {/* Tweet content */}
      <p className="mt-4 text-sm">{content}</p>

      {/* Like/Dislike buttons */}
      <div className="mt-4 flex items-center justify-start space-x-6">
        <div className="flex items-center space-x-1">
          {likeCount} {/* Display like count */}
          <IconButton
            onClick={handleLike}
            color="primary"
            aria-label="like"
            sx={{
              fontSize: 21,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                color: '#1e90ff', // Custom hover color
              },
            }}
          >
            <FaThumbsUp />
          </IconButton>
        
        </div>

        <div className="flex items-center space-x-1">
          {dislikeCount} {/* Display dislike count */}
          <IconButton
            onClick={handleDislike}
            color="error"
            aria-label="dislike"
            sx={{
              fontSize: 21,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                color: '#f44336', // Custom hover color
              },
            }}
          >
            <FaThumbsDown />
          </IconButton>
     
        </div>
      </div>
    </div>
  );
};

export default TweetComponen;
