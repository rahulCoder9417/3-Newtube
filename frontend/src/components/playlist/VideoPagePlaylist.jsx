import React, { useEffect, useState } from "react";
import PlaylistComp from "./PlaylistComp";
import { onSubmitAxios } from "../../utils/axios";

function VideoPagePlaylist({ playlistId, videoIndex }) {
  
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await onSubmitAxios("get", `playlist/${playlistId}`);
        if (response?.data?.data) {
          setPlaylist(response.data.data);
          setCurrentIndex(
            videoIndex >= 0 && videoIndex < response.data.data.videos.length
              ? videoIndex
              : 0
          );
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistId, videoIndex]);

  if (loading) {
    return <p className="text-gray-600">Loading playlist...</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-6 mt-5 rounded-lg  bg-gray-600">
      {/* Playlist Header */}
      <div className="flex items-center justify-between bg-gray-200 p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800">
          Playlist: {playlist?.name || "Unknown Playlist"}
        </h2>
        <span className="text-sm text-gray-600">
          Playing Video: {Number(currentIndex) + 1} / {playlist?.videos?.length || 0}
        </span>
      </div>

      {/* Playlist Videos */}
      <div className="flex flex-col gap-4">
        {playlist?.videos?.length > 0 ? (
          playlist.videos.map((video, inde) => (
            <PlaylistComp
              dataa={video}
              key={`${playlistId}-${inde}-${currentIndex}`}
              id={video._id}
              pId={playlistId}
              index={inde}
              ino={Number(currentIndex) === inde}
            />
          ))
        ) : (
          <p className="text-gray-600">No videos in this playlist.</p>
        )}
      </div>
    </div>
  );
}

export default VideoPagePlaylist;
