import React from 'react';
import VideoP from '../uni/Video';

function Topics({ topic, object }) {
  return (
    <section className="mb-16 max-w-[100vw] px-4">
    <div className="
      grid gap-6
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
    ">
      {object.map((video) => (
        <VideoP
          key={video._id}
          createdAt={video.createdAt}
          id={video._id}
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
