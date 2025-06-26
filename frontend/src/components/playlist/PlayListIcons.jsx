import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSubmitAxios } from '../../utils/axios'; // Utility for making Axios calls

function PlayListIcons({ id, videosLength, videoFirst }) {
  const [thumbnail, setThumbnail] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchThumbnail = async () => {

      try {
        const response = await onSubmitAxios("get", `videos/videoManupulate/${videoFirst}`);
        setThumbnail(response.data.data.thumbnail); // Assuming the response contains the thumbnail field
      } catch (error) {
 
        setThumbnail("https://res.cloudinary.com/dmywuwnwx/image/upload/v1735987281/hipquhronmdi0tmow9pq.jpg")
      }
    };
    if(id=="watch-history"){
        setThumbnail("https://res.cloudinary.com/dmywuwnwx/image/upload/v1736087537/griymakscenkandpnrfn.png")
    }
    else if (videoFirst) {
      fetchThumbnail();
    }else{
        setThumbnail("https://res.cloudinary.com/dmywuwnwx/image/upload/v1735987281/hipquhronmdi0tmow9pq.jpg")
    }
  }, [videoFirst]);

  const handleClick = () => {
    navigate(`/playlist/${id}`);
  };

  return (
    <div
      className="bg-gray-800 shadow-md rounded-lg overflow-hidden w-64 cursor-pointer relative"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <img
        src={thumbnail}
        alt="Playlist Thumbnail"
        className="w-full h-40 object-cover"
      />

      {/* Video Length */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs py-1 px-2 rounded">
        {videosLength} videos
      </div>
    </div>
  );
}

export default PlayListIcons;
