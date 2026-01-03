import React, { useEffect, useState } from 'react';
import Topics from '../components/home/Topics';
import VideoP from '../components/uni/Video';
import { onSubmitAxios } from '../utils/axios';
import { FaPlay } from 'react-icons/fa';

function Youtube() {
  const [recommended, setRecommended] = useState([]);
  const [topics, setTopics] = useState({
    Music: [],
    Education: [],
    Comedy: [],
    Tech: [],
    Sports: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
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
        setError('Failed to load videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 font-medium">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaPlay className="text-blue-500" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Videos
            </span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommended Videos Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
              Recommended for You
            </span>
          </h2>
          
          {recommended.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {recommended.map((video) => (
                <div key={video._id} className="animate-fade-in">
                  <VideoP
                    createdAt={video.createdAt}
                    id={video._id}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    views={video.views}
                    duration={video.duration}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No recommended videos available</p>
            </div>
          )}
        </section>

        {/* Topics Section */}
        <div className="space-y-10">
          {Object.keys(topics).map((topicKey) => (
            <section key={topicKey} className="animate-fade-in">
              <h3 className="text-xl md:text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                {topicKey}
                <span className="text-sm font-normal text-gray-500">
                  ({topics[topicKey].length} videos)
                </span>
              </h3>
              {topics[topicKey].length > 0 ? (
                <Topics topic={topicKey} object={topics[topicKey]} />
              ) : (
                <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <p className="text-gray-500">No videos in this category yet</p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Youtube;