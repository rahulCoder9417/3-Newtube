import React, { useEffect, useState, useCallback } from "react";
import { onSubmitAxios } from "../utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaEdit, FaHistory, FaPlay } from "react-icons/fa";
import PlaylistComp from "../components/playlist/PlaylistComp";
import Notifier from "../components/uni/Notifier";

const DEFAULT_HISTORY_THUMBNAIL =
  "https://res.cloudinary.com/dmywuwnwx/image/upload/v1736087537/griymakscenkandpnrfn.png";

const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth);

  const [data, setData] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [canModify, setCanModify] = useState(false);
  const [isWatchHistory, setIsWatchHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifier, setNotifier] = useState({
    visible: false,
    loading: false,
    message: "",
  });

  const userId = userData.id;

  // Fetch playlist or watch history data
  useEffect(() => {
    const fetchPlaylistData = async () => {
      setIsLoading(true);
      console.log("Fetching playlist data");
      try {
        const response = await onSubmitAxios("get", `playlist/${id}`);
        const playlistData = response.data.data;

        setData(playlistData);
        setCanModify(playlistData.owner._id === userId);
        setThumbnail(playlistData.videos[0]?.thumbnail || null);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWatchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await onSubmitAxios("get", "users/history");
        setData({
          description: "Your recently watched videos",
          name: "Watch History",
          owner: {
            fullName: userData.fullName,
            avatar: userData.avatar,
            _id: userId,
          },
          videos: response.data.data,
        });
        setThumbnail(DEFAULT_HISTORY_THUMBNAIL);
        setIsWatchHistory(true);
      } catch (error) {
        console.error("Error fetching watch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id === "watch-history") {

      fetchWatchHistory();
    } else {
      fetchPlaylistData();
    }
  }, [id, userId, userData]);

  // Remove video from watch history
  const removeVideo = useCallback(
    async (videoId) => {
      try {
        setNotifier({ visible: true, loading: true, message: "" });

        await onSubmitAxios("get", `users/remove-video-history/${videoId}`);

        setData((prevData) => ({
          ...prevData,
          videos: prevData.videos.filter((video) => video._id !== videoId),
        }));

        setNotifier({ visible: true, loading: false, message: "success" });
      } catch (error) {
        console.error("Error removing video:", error);
        setNotifier({ visible: true, loading: false, message: "error" });
      }
    },
    []
  );

  const handleModifyPlaylist = () => {
    navigate(`/playlistManipulation/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A1C2E]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A1C2E]">
        <div className="text-center">
          <p className="text-white text-xl">Playlist not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1C2E] text-white p-4 md:p-6">
      {/* Notifier */}
      {notifier.visible && (
        <Notifier
          type={notifier.message}
          message={
            notifier.message === "error"
              ? "Error removing video"
              : "Video removed successfully"
          }
          loading={notifier.loading}
          setV={(visible) =>
            setNotifier((prev) => ({ ...prev, visible }))
          }
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - Playlist Info */}
          <div className="lg:w-2/5 xl:w-1/3">
            <div className="sticky top-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700/50">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-black">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt="Playlist Thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <FaPlay className="text-gray-600 text-6xl" />
                  </div>
                )}
                
                {/* Video Count Badge */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                  {isWatchHistory ? (
                    <FaHistory className="text-blue-400" />
                  ) : (
                    <FaPlay className="text-blue-400" />
                  )}
                  {data.videos.length} {data.videos.length === 1 ? "video" : "videos"}
                </div>
              </div>

              {/* Playlist Details */}
              <div className="p-6 space-y-4">
                {/* Owner Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={data.owner.avatar}
                    alt={data.owner.fullName}
                    className="w-14 h-14 rounded-full border-2 border-blue-400 shadow-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">
                      {data.owner.fullName}
                    </h4>
                    <p className="text-gray-400 text-sm">{data.name}</p>
                  </div>
                </div>

                {/* Description */}
                {data.description && (
                  <div className="pt-4 border-t border-gray-700/50">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                )}

                {/* Modify Button */}
                {canModify && (
                  <button
                    onClick={handleModifyPlaylist}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.02]"
                  >
                    <FaEdit />
                    Modify Playlist
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Video List */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-blue-700/50 shadow-xl">
              {/* Header */}
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {isWatchHistory ? (
                    <>
                      <FaHistory className="text-blue-400" />
                      Watch History
                    </>
                  ) : (
                    <>
                      <FaPlay className="text-blue-400" />
                      Playlist Videos
                    </>
                  )}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {data.videos.length} {data.videos.length === 1 ? "video" : "videos"}
                </p>
              </div>

              {/* Video List */}
              <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {data.videos.length > 0 ? (
                  data.videos.map((video, index) => (
                    <PlaylistComp
                      key={video._id}
                      removeHis={isWatchHistory}
                      remove={removeVideo}
                      dataa={video}
                      id={video._id}
                      pId={id}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FaPlay className="text-gray-600 text-5xl mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">
                      {isWatchHistory
                        ? "No videos in your watch history"
                        : "No videos in this playlist"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playlist;