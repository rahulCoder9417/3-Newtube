import React, { useEffect, useState } from 'react';
import Topics from '../components/home/Topics';
import VideoP from '../components/uni/Video';
import { onSubmitAxios } from '../utils/axios';

function Youtube() {
  const [recommended, setRecommended] = useState([]);
  const [topics, setTopics] = useState({
    Music: [],
    Education: [],
    Comedy: [],
    Tech: [],
    Sports: [],
  });

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch recommended videos
        const recommendResponse = await onSubmitAxios('get', 'videos/getrandom/8');
        setRecommended(recommendResponse.data.data);

        // Fetch videos for each topic
        const topicsResponse = await Promise.all([
          onSubmitAxios('get', 'videos/', {}, {}, { tags: 'Music' }),
          onSubmitAxios('get', 'videos/', {}, {}, { tags: 'Education' }),
          onSubmitAxios('get', 'videos/', {}, {}, { tags: 'Comedy' }),
          onSubmitAxios('get', 'videos/', {}, {}, { tags: 'Tech' }),
          onSubmitAxios('get', 'videos/', {}, {}, { tags: 'Sports' }),
        ]);

        setTopics({
          Music: topicsResponse[0].data.data,
          Education: topicsResponse[1].data.data,
          Comedy: topicsResponse[2].data.data,
          Tech: topicsResponse[3].data.data,
          Sports: topicsResponse[4].data.data,
        });
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="bg-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      {/* Recommended Videos Section */}
      <section className="mb-16">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500 mb-8">
          Recommended Videos
        </h2>
        <div className="grid grid-cols-4 gap-5 ">
          {recommended.map((video, index) => (
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

      {/* Topics Section */}
      {Object.keys(topics).map((topicKey) => (
        <Topics key={topicKey} topic={topicKey} object={topics[topicKey]} />
      ))}
    </div>
  );
}

export default Youtube;
