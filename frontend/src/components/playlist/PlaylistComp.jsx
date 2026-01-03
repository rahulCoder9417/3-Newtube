import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaEye, FaClock, FaTrash } from "react-icons/fa";
import Avatar from "../uni/Avatar";

const PlaylistComp = ({
  removeHis = false,
  remove,
  id,
  pId,
  index,
  isPlaying = false,
  dataa,
}) => {
  const navigate = useNavigate();

  const formatDuration = (duration) => {
    const totalSeconds = Number(duration) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return "Unknown";

    const now = new Date();
    const videoDate = new Date(timestamp);
    const diff = now - videoDate;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
    if (months <= 12) return `${months} ${months === 1 ? "month" : "months"} ago`;
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  };

  const handleVideoClick = useCallback(() => {

    if(pId === "watch-history"){

      navigate(`/video/${id}`);
      return
    }
    const queryParams = new URLSearchParams({
      t: "playlist",
      pId,
      index,
    }).toString();
    navigate(`/video/${id}?${queryParams}`);
  }, [id, pId, index, navigate]);

  const handleRemove = useCallback(
    (e) => {
      e.stopPropagation();
      if (remove) {
        remove(id);
      }
    },
    [id, remove]
  );

  if (!dataa) {
    return null;
  }

  return (
    <div
      className={`group relative flex gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
        isPlaying
          ? "bg-blue-900/50 border-blue-500 shadow-lg shadow-blue-500/20"
          : "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600"
      }`}
    >
      {/* Thumbnail Section */}
      <div className="relative flex-shrink-0" onClick={handleVideoClick}>
        <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-black">
          <img
            src={dataa.thumbnail}
            alt={dataa.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 rounded-full p-2">
              <FaPlay className="text-gray-900 text-xl ml-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded">
            {formatDuration(dataa.duration)}
          </div>

          {/* Playing Indicator */}
          {isPlaying && (
            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <FaPlay className="text-[8px]" />
              Playing
            </div>
          )}
        </div>
      </div>

      {/* Video Details Section */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Title */}
        <div onClick={handleVideoClick}>
          <h3
            className={`text-base font-bold mb-2 line-clamp-2 transition-colors ${
              isPlaying ? "text-blue-400" : "text-white group-hover:text-blue-400"
            }`}
          >
            {dataa.title}
          </h3>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          {/* Owner Info */}
          <div className="flex items-center gap-2">
            <Avatar
              dimension="w-6 h-6"
              avatar={dataa.owner?.avatar}
              id={dataa.owner?._id}
            />
            <span className="text-sm font-medium text-gray-300 truncate">
              {dataa.owner?.fullName}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FaEye className="text-gray-500" />
              {dataa.views?.toLocaleString() || 0} views
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="text-gray-500" />
              {timeAgo(dataa.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Remove Button (for watch history) */}
      {removeHis && (
        <div className="flex-shrink-0 flex items-center">
          <button
            onClick={handleRemove}
            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-110 group/btn"
            title="Remove from history"
          >
            <FaTrash className="text-sm group-hover/btn:animate-pulse" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaylistComp;