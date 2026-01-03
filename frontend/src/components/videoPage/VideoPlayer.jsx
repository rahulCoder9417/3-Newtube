import React, { useEffect } from 'react';
import { onSubmitAxios } from '../../utils/axios';

const VideoPlayer = ({ videoUrl ,id}) => {
    useEffect(() => {
        const incrementViews = async () => {
        await onSubmitAxios("get", `videos/${id}`);
        };
        incrementViews();
    }, [])
    
    return (
        <div className="w-full bg-black flex items-center justify-center">
                <div className="w-full aspect-video">
                    <video controls autoPlay className="w-full h-full">
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
        </div>
    );
};

export default VideoPlayer;
