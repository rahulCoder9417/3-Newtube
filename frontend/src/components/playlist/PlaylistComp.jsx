import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../uni/Avatar';

function PlaylistComp({ removeHis,remove,id, pId, index, ino, dataa }) {
  const [data, setData] = useState(null);
  const [inP, setInP] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setData(dataa);
    setInP(ino);
  }, [dataa, ino]);

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const timeAgo = (timestamp) => {
    const now = new Date();
    const videoDate = new Date(timestamp);
    const diff = now - videoDate;

    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const handleClick = () => {
    const queryParams = new URLSearchParams({
      t: "playlist",
      pId,
      index,
    }).toString();
    navigate(`/video/${id}?${queryParams}`);
  };

  return (
    <div
      className={`flex gap-4 cursor-pointer ${inP ? "bg-blue-800" : "bg-[#1B2631]"} p-4 w-auto border-blue-700 border-2 rounded-lg shadow-md`}
    >
      {/* Thumbnail */}
      <div className="relative">
        <img
        
      onClick={handleClick}
          src={data?.thumbnail}
          alt={`${data?.title} Thumbnail`}
          className="w-40 h-24 rounded-md object-cover"
        />
        {/* Duration Overlay */}
        <span className="absolute bottom-4 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-md">
          {formatDuration(Number(data?.duration || 0))}
        </span>
      </div>
      {/* Video Details */}
      <div className="flex flex-col justify-between">
        <h3 className="text-lg font-bold">{data?.title}</h3>
        
        <div className="text-sm  text-gray-300"><div className='flex gap-2'>
        <Avatar  dimension='w-6 h-6' avatar={data?.owner.avatar} id={data?.owner._id}/> <span className=' font-bold'>{data?.owner.fullName}</span></div>
          <p>{data?.views.toLocaleString()} views</p>
          <span>{timeAgo(data?.createdAt || 0)}</span>
          
        {removeHis && <span className='ml-2 bg-red-700 rounded-md border-2 border-black ' onClick={()=>remove(id)}> Remove . </span>}
        </div>
      </div>
    </div>
  );
}

export default PlaylistComp;
