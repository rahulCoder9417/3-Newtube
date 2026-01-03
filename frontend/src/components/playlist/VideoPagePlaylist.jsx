import React, { useEffect, useState } from "react";
import { FaListAlt, FaPlay } from "react-icons/fa";
import PlaylistComp from "./PlaylistComp";
import { onSubmitAxios } from "../../utils/axios";

const VideoPagePlaylist = ({ playlistId, videoIndex }) => {
  const [playlist, setPlaylist] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!playlistId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await onSubmitAxios("get", `playlist/${playlistId}`);
        
        if (response?.data?.data) {
          const playlistData = response.data.data;
          setPlaylist(playlistData);

          // Set current index with validation
          const validIndex = Number(videoIndex) || 0;
          const maxIndex = playlistData.videos?.length - 1 || 0;
          setCurrentIndex(
            validIndex >= 0 && validIndex <= maxIndex ? validIndex : 0
          );
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
        setError("Failed to load playlist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId, videoIndex]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 mt-5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50">
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-400">Loading playlist...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6 mt-5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50">
        <div className="text-center py-10">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // No playlist data
  if (!playlist) {
    return null;
  }

  const totalVideos = playlist.videos?.length || 0;
  const hasVideos = totalVideos > 0;

  return (
    <div className="flex flex-col gap-4 p-6 mt-5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-xl">
      {/* Playlist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg border border-gray-600/50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FaListAlt className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {playlist.name || "Playlist"}
            </h2>
            {playlist.description && (
              <p className="text-sm text-gray-400 line-clamp-1">
                {playlist.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-700">
          <FaPlay className="text-blue-400 text-sm" />
          <span className="text-sm font-semibold text-white">
            {currentIndex + 1} / {totalVideos}
          </span>
        </div>
      </div>

      {/* Playlist Videos */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {hasVideos ? (
          playlist.videos.map((video, index) => (
            <PlaylistComp
              key={video._id}
              dataa={video}
              id={video._id}
              pId={playlistId}
              index={index}
              isPlaying={currentIndex === index}
              removeHis={false}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <FaListAlt className="text-gray-600 text-5xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No videos in this playlist</p>
          </div>
        )}
      </div>

      {/* Playlist Footer Info (Optional) */}
      {hasVideos && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50 text-sm text-gray-400">
          <span>Total videos: {totalVideos}</span>
          {playlist.owner && (
            <span className="flex items-center gap-2">
              By {playlist.owner.fullName || "Unknown"}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPagePlaylist;