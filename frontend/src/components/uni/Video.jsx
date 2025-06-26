import React from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'; 
import VideoThreeDots from '../playlist/VideoThreeDots';

const VideoP = ({ title, thumbnail, views, duration, createdAt, id="676f9af67e03aa1457152778" }) => {
    const navigate = useNavigate();
 
    const handleVideoClick = () => {
        navigate(`/video/${id}`);
    };

    // Format the createdAt date using dayjs
    const formattedCreatedAt = dayjs(createdAt).format("MMMM D, YYYY");

    // Convert the duration from seconds to MM:SS format
    const formattedDuration = dayjs(duration * 1000).format('mm:ss');


    return (
        <div className="bg-gray-500 shadow-md rounded-lg overflow-hidden w-72 cursor-pointer relative">
            <img onClick={handleVideoClick} src={thumbnail} alt={title} className="w-full h-36 object-cover" />
            <div className="p-4">
                <h4 className="text-lg font-semibold mb-2">{title}</h4>
                <p className="text-sm text-black">{views} views • {formattedDuration} • {formattedCreatedAt}</p>
            </div>

            {/* Three dots icon for options */}
            <VideoThreeDots videoId={id}/>
        </div>
    );
};

export default VideoP;
