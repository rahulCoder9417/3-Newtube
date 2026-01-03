import React, { useState, useEffect, useRef, useCallback } from "react";
import { onSubmitAxios } from "../../utils/axios";
import Avatar from "../uni/Avatar";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaCommentDots,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import { handleDislike, handleLike, likeInfo } from "../../utils/likeDislike";
import Comment from "../uni/Comment";

const Photo = ({
  photo,
  morePhoto = [],
  fullName,
  avatar,
  title,
  description,
  id,
  ownerId,
}) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comments, setComments] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [action, setAction] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const modalRef = useRef(null);

  const totalPhotos = morePhoto.length + 1;
  const currentPhoto =
    currentPhotoIndex === 0 ? photo : morePhoto[currentPhotoIndex - 1];

  // Fetch photo details
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const [commentResponse] = await Promise.all([
          onSubmitAxios("get", `comments/${id}`, {}, {}, { type: "photo" }),
        ]);

        setComments(commentResponse.data.data.comments);
        likeInfo("p", id, "photo", setDislikes, setLikes, setAction);
      } catch (error) {
        console.error("Error fetching photo details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  // Handle outside click to close expanded view
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isExpanded &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isExpanded]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleDoubleClick = useCallback(() => {
    handleLike("p", id, "Photo", setDislikes, setLikes, setAction, action);
  }, [id, action]);

  const handleNextPhoto = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos);
    },
    [totalPhotos]
  );

  const handlePreviousPhoto = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
    },
    [totalPhotos]
  );

  const onLike = useCallback(() => {
    handleLike("p", id, "Photo", setDislikes, setLikes, setAction, action);
  }, [id, action]);

  const onDislike = useCallback(() => {
    handleDislike("p", id, "Photo", setDislikes, setLikes, setAction, action);
  }, [id, action]);

  return (
    <>
      {/* Card View */}
      <div className="rounded-xl shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white transition-all duration-300 border border-gray-700/50 hover:border-gray-600 overflow-hidden hover:shadow-teal-500/20">
        {/* User Info */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <Avatar avatar={avatar} id={ownerId} dimension="w-10 h-10" />
            <div>
              <p className="font-bold text-white text-sm">{fullName}</p>
            </div>
          </div>
          {totalPhotos > 1 && (
            <div className="bg-gray-700/50 px-3 py-1 rounded-full text-xs font-medium">
              {currentPhotoIndex + 1} / {totalPhotos}
            </div>
          )}
        </div>

        {/* Photo Container */}
        <div className="relative group bg-black aspect-square">
          <img
            src={currentPhoto}
            alt={title}
            onDoubleClick={handleDoubleClick}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Navigation Arrows */}
          {totalPhotos > 1 && (
            <>
              <button
                onClick={handlePreviousPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 border border-gray-700"
                aria-label="Previous photo"
              >
                <FaArrowLeft className="text-white" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 border border-gray-700"
                aria-label="Next photo"
              >
                <FaArrowRight className="text-white" />
              </button>
            </>
          )}
        </div>

        {/* Photo Details */}
        <div className="p-4">
          <h2 className="font-bold text-lg text-white mb-1 line-clamp-1">
            {title}
          </h2>
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
            {description}
          </p>

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
            <div className="flex gap-4">
              <button
                onClick={onLike}
                disabled={isLoading}
                className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-110 ${
                  action === "like"
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-blue-400"
                }`}
                aria-label="Like photo"
              >
                <FaThumbsUp />
                <span className="font-semibold">{likes}</span>
              </button>

              <button
                onClick={onDislike}
                disabled={isLoading}
                className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-110 ${
                  action === "dislike"
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-400"
                }`}
                aria-label="Dislike photo"
              >
                <FaThumbsDown />
                <span className="font-semibold">{dislikes}</span>
              </button>
            </div>

            <button
              onClick={toggleExpanded}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all text-sm font-medium hover:scale-105"
            >
              <FaCommentDots />
              <span>{comments?.length || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Modal View */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Photo Section */}
            <div className="flex-1 flex flex-col bg-black">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <Avatar avatar={avatar} id={ownerId} dimension="w-10 h-10" />
                  <p className="font-bold text-white">{fullName}</p>
                </div>
                <button
                  onClick={toggleExpanded}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Photo */}
              <div className="flex-1 relative group flex items-center justify-center">
                <img
                  src={currentPhoto}
                  alt={title}
                  onDoubleClick={handleDoubleClick}
                  className="max-h-full max-w-full object-contain"
                />

                {/* Navigation */}
                {totalPhotos > 1 && (
                  <>
                    <button
                      onClick={handlePreviousPhoto}
                      className="absolute left-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-full hover:bg-gray-800 transition-all border border-gray-700"
                    >
                      <FaArrowLeft className="text-white" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-full hover:bg-gray-800 transition-all border border-gray-700"
                    >
                      <FaArrowRight className="text-white" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                      {currentPhotoIndex + 1} / {totalPhotos}
                    </div>
                  </>
                )}
              </div>

              {/* Photo Info & Actions */}
              <div className="p-4 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700">
                <h2 className="font-bold text-xl text-white mb-2">{title}</h2>
                <p className="text-gray-400 text-sm mb-4">{description}</p>

                <div className="flex items-center gap-6">
                  <button
                    onClick={onLike}
                    className={`flex items-center gap-2 font-medium transition-all hover:scale-110 ${
                      action === "like"
                        ? "text-blue-500"
                        : "text-gray-400 hover:text-blue-400"
                    }`}
                  >
                    <FaThumbsUp size={20} />
                    <span>{likes}</span>
                  </button>

                  <button
                    onClick={onDislike}
                    className={`flex items-center gap-2 font-medium transition-all hover:scale-110 ${
                      action === "dislike"
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-400"
                    }`}
                  >
                    <FaThumbsDown size={20} />
                    <span>{dislikes}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Sidebar */}
            <div className="w-full md:w-96 bg-gray-800/50 backdrop-blur-sm flex flex-col border-l border-gray-700">
              <div className="p-4 border-b border-gray-700 bg-gray-800/90">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FaCommentDots className="text-blue-400" />
                  Comments ({comments?.length || 0})
                </h3>
              </div>

              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ maxHeight: "calc(90vh - 200px)" }}
              >
                {comments ? (
                  <Comment commen={comments} id={id} type="photo" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">Loading comments...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Photo;