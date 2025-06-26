import React from 'react';
import VideoP from '../uni/Video';

function Topics({ topic, object }) {
  return (
    <section className="mb-16">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-950 via-red-800 to-blue-950 mb-8">{topic}</h2>
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {object.map((video, index) => (
          <VideoP
              createdAt={video.createdAt}
              id={video._id}
              key={index}
              title={video.title}
              thumbnail={video.thumbnail}
              views={video.views}
              duration={video.duration}
            />
           
        ))}
      </div>
    </section>
  );
}

export default Topics;
