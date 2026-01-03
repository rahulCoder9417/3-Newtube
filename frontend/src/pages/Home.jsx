import React, { useEffect, useState } from "react";
import Topics from "../components/home/Topics";
import TweetSlider from "../components/home/TweetSlider";
import { onSubmitAxios } from "../utils/axios";
import { FaFire, FaHashtag, FaVideo } from "react-icons/fa";

const Home = () => {
  const [data, setData] = useState({ ed: [], sc: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both topics in parallel for better performance
        const [edResponse, scResponse] = await Promise.all([
          onSubmitAxios("get", "videos/", {}, {}, { tags: "Education" }),
          onSubmitAxios("get", "videos/", {}, {}, { tags: "Comedy" })
        ]);

        setData({
          ed: edResponse.data.data,
          sc: scResponse.data.data
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0b1220] to-gray-900 text-white">
  

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* ================= Trending Tweets ================= */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <FaFire className="text-white text-xl" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Trending Tweets
            </h2>
          </div>

          <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 shadow-2xl hover:border-gray-600/50 transition-all duration-300">
            <TweetSlider />
          </div>
        </section>

        {/* ================= Trending Topics ================= */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <FaHashtag className="text-white text-xl" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Trending Topics
            </h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium">Loading trending content...</p>
            </div>
          ) : data.ed.length === 0 && data.sc.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                <FaVideo className="text-gray-600 text-3xl" />
              </div>
              <p className="text-gray-400 text-lg">No trending topics available right now</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Education */}
              {data.ed.length > 0 && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      Education
                    </h3>
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                      {data.ed.length} videos
                    </span>
                  </div>
                  <Topics topic="Education" object={data.ed} />
                </div>
              )}

              {/* Comedy */}
              {data.sc.length > 0 && (
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      Comedy
                    </h3>
                    <span className="px-3 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                      {data.sc.length} videos
                    </span>
                  </div>
                  <Topics topic="Comedy" object={data.sc} />
                </div>
              )}
            </div>
          )}
        </section>
      </div>

    </div>
  );
};

export default Home;