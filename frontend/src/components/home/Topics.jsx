import React from 'react';
import VideoP from '../uni/Video';

function Topics({ topic, object }) {
  return (
    <section className="mb-16">
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
