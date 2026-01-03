import React, { useEffect, useState } from "react";
import VideoPlayer from "../components/videoPage/VideoPlayer";
import VideoP from "../components/uni/Video";
import { useLocation, useParams } from "react-router-dom";
import { onSubmitAxios } from "../utils/axios";
import { FaThumbsUp, FaThumbsDown, FaChevronDown, FaChevronUp, FaEye, FaCalendar, FaBell, FaBellSlash } from "react-icons/fa";
import Comment from "../components/uni/Comment";
import { handleDislike, handleLike, likeInfo } from "../utils/likeDislike";
import Avatar from "../components/uni/Avatar";
import VideoPagePlaylist from "../components/playlist/VideoPagePlaylist";
import VideoThreeDots from "../components/playlist/VideoThreeDots";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const VideoPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [videoData, setVideoData] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState("");
  const [comments, setComments] = useState(null);
  const [playlist, setPlaylist] = useState(false);
  const [playData, setPlayData] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoading(true);
      try {
        // Fetch video data
        const videoResponse = await onSubmitAxios("get", `videos/videoManupulate/${id}`);
        const video = videoResponse?.data?.data;
        setVideoData(video);

        // Fetch all data in parallel for better performance
        const [subsResponse, recommendResponse, commentsResponse] = await Promise.all([
          onSubmitAxios("get", `users/c/${video.owner._id}`),
          onSubmitAxios("get", "videos/getrandom/7"),
          onSubmitAxios("get", `comments/${id}`, {}, {}, { type: "video" })
        ]);

        setUserDetails(subsResponse.data.data);
        setRecommendedVideos(recommendResponse.data.data);
        setComments(commentsResponse.data.data.comments);

        // Check for playlist parameters
        if (queryParams.size !== 0) {
          const t = queryParams.get("t");
          const pId = queryParams.get("pId");
          const index = queryParams.get("index");
          setPlaylist(true);
          setPlayData({ t, pId, index });
        } else {
          setPlaylist(false);
        }

        // Fetch like/dislike info
        likeInfo("v", id, "Video", setDislikes, setLikes, setAction);
      } catch (error) {
        console.error("Error while fetching video data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  const handleSubscribeToggle = async () => {
    if (isSubscribing) return;
    
    setIsSubscribing(true);
    try {
      const response = await onSubmitAxios("post", `subscriptions/c/${videoData.owner._id}`);
      
      if (response.data.message === "Subscribed successfully") {
        setUserDetails((prev) => ({
          ...prev,
          isSubscribed: true,
          subscribersCount: prev.subscribersCount + 1,
        }));
      } else if (response.data.message === "Unsubscribed successfully") {
        setUserDetails((prev) => ({
          ...prev,
          isSubscribed: false,
          subscribersCount: prev.subscribersCount - 1,
        }));
      }
    } catch (error) {
      console.error("Error while toggling subscription:", error);
      alert("Failed to toggle subscription. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const formatSubscriberCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 font-medium">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-[2000px] mx-auto flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        {/* Main Video Section */}
        <div className="flex-1 space-y-4">
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden bg-black shadow-2xl border border-gray-700/50">
            {videoData ? (
              <VideoPlayer
                key={videoData?.videoFile}
                id={id}
                videoUrl={videoData.videoFile}
              />
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <p className="text-gray-400">Loading video...</p>
              </div>
            )}
          </div>

          {/* Video Info Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50">
            {/* Title and Menu */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex-1">
                {videoData?.title}
              </h1>
              <VideoThreeDots videoId={id} />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <FaEye className="text-blue-400" />
                <span>{videoData?.views?.toLocaleString()} views</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <FaCalendar className="text-purple-400" />
                <span>{dayjs(videoData?.createdAt).fromNow()}</span>
              </div>
            </div>

            {/* Channel Info and Subscribe */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-700/50">
              <div className="flex items-center gap-4">
                <Avatar
                  avatar={videoData?.owner?.avatar}
                  id={videoData?.owner?._id}
                />
                <div>
                  <p className="text-lg font-semibold text-white">
                    {videoData?.owner?.fullName || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatSubscriberCount(userDetails?.subscribersCount || 0)} subscribers
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubscribeToggle}
                disabled={isSubscribing}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  userDetails?.isSubscribed
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isSubscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    {userDetails?.isSubscribed ? <FaBellSlash /> : <FaBell />}
                    <span>{userDetails?.isSubscribed ? "Subscribed" : "Subscribe"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Like/Dislike Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() =>
                  handleLike("v", id, "Video", setDislikes, setLikes, setAction, action)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 ${
                  action === "like"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <FaThumbsUp />
                <span>{likes}</span>
              </button>

              <button
                onClick={() =>
                  handleDislike("v", id, "Video", setDislikes, setLikes, setAction, action)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 ${
                  action === "dislike"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <FaThumbsDown />
                <span>{dislikes}</span>
              </button>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700/50 overflow-hidden">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
            >
              <span className="text-lg font-semibold text-white">Description</span>
              {showDescription ? (
                <FaChevronUp className="text-gray-400" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </button>

            {showDescription && (
              <div className="p-6 pt-0 space-y-4 animate-slide-down">
                {videoData?.tags && videoData.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {videoData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {videoData?.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">About</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {videoData.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Playlist Section */}
          {playlist && (
            <div className="animate-fade-in">
              <VideoPagePlaylist playlistId={playData.pId} videoIndex={playData.index} />
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              Comments
              <span className="text-sm font-normal text-gray-400">
                ({comments?.length || 0})
              </span>
            </h2>
            <Comment commen={comments} id={id} type="video" />
          </div>
        </div>

        {/* Recommended Videos Sidebar */}
        <div className="lg:w-96 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 sticky top-4">
            Recommended
          </h2>
          <div className="space-y-4">
            {recommendedVideos.map((video) => (
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
        </div>
      </div>

   
    </div>
  );
};

export default VideoPage;