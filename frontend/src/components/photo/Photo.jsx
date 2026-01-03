import React, { useState, useEffect } from "react";
import { onSubmitAxios } from "../../utils/axios";
import Avatar from "../uni/Avatar";
import { FaThumbsUp, FaThumbsDown, FaCommentDots, FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import { handleDislike, handleLike, likeInfo } from "../../utils/likeDislike";
import Comment from "../uni/Comment";

const Photo = ({
  photo,
  morePhoto,
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
  const [isPhotoClicked, setIsPhotoClicked] = useState(false);
  const [action, setAction] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePhotoClick = () => {
    setIsPhotoClicked(!isPhotoClicked);
  };

  const handleDoubleClick = () => {
    handleLike("p", id, "Photo", setDislikes, setLikes, setAction, action);
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prevIndex) =>
      (prevIndex + 1) % (morePhoto ? morePhoto.length + 1 : 1)
    );
  };

  const handlePreviousPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prevIndex) =>
      (prevIndex - 1 + (morePhoto ? morePhoto.length + 1 : 1)) %
      (morePhoto ? morePhoto.length + 1 : 1)
    );
  };

  useEffect(() => {
    const fetchDetails = async () => {
      const comment = await onSubmitAxios(
        "get",
        `comments/${id}`,
        {},
        {},
        { type: "photo" }
      );

      setComments(comment.data.data.comments);
      likeInfo("p", id, "photo", setDislikes, setLikes, setAction);
    };
    fetchDetails();
  }, [id]);

  const currentPhoto =
    currentPhotoIndex === 0 ? photo : morePhoto[currentPhotoIndex - 1];
  
  const totalPhotos = morePhoto ? morePhoto.length + 1 : 1;

  return (
    <div
      className={`rounded-xl  shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white transition-all duration-500 ease-in-out border border-gray-700/50 hover:border-gray-600 overflow-hidden ${
        isPhotoClicked 
          ? "w-full max-w-5xl" 
          : "w-full max-w-xl"
      }`}
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Comments Section */}
        {isPhotoClicked && (
          <div className="w-full md:w-2/5 bg-gray-900/50 backdrop-blur-sm border-b md:border-b-0 md:border-r border-gray-700/50">
            <div className="sticky top-0 bg-gray-800/90 backdrop-blur-sm p-4 border-b border-gray-700/50 flex items-center justify-between z-10">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FaCommentDots className="text-blue-400" />
                Comments ({comments?.length || 0})
              </h3>
              <button
                onClick={handlePhotoClick}
                className="md:hidden p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="h-[400px] md:h-[600px] overflow-y-auto p-4 space-y-3">
              {comments ? (
                <Comment commen={comments} id={id} type="photo" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">Loading comments...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Photo Section */}
        <div className={`flex-1 flex flex-col ${isPhotoClicked ? "p-4 md:p-6" : "p-4 md:p-5"}`}>
          {/* User Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar avatar={avatar} id={ownerId} />
              <div>
                <p className="font-bold text-white text-sm md:text-base">{fullName}</p>
              </div>
            </div>
            {totalPhotos > 1 && (
              <div className="bg-gray-700/50 px-3 py-1 rounded-full text-xs font-medium">
                {currentPhotoIndex + 1} / {totalPhotos}
              </div>
            )}
          </div>

          {/* Photo Container */}
          <div className="relative mb-4 rounded-lg overflow-hidden group flex-1 flex items-center justify-center bg-black/20">
            <img
              src={currentPhoto}
              alt={title}
              onDoubleClick={handleDoubleClick}
              className="max-w-full max-h-[400px] md:max-h-[500px] object-contain cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            />
            
            {/* Navigation Arrows */}
            {totalPhotos > 1 && (
              <>
                <button
                  onClick={handlePreviousPhoto}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm p-2 md:p-3 rounded-full hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border border-gray-700"
                >
                  <FaArrowLeft className="text-white text-sm md:text-base" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm p-2 md:p-3 rounded-full hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border border-gray-700"
                >
                  <FaArrowRight className="text-white text-sm md:text-base" />
                </button>
              </>
            )}
          </div>

          {/* Photo Details */}
          <div className="mb-4">
            <h2 className="font-bold text-base md:text-lg text-white mb-1">{title}</h2>
            <p className="text-gray-400 text-xs md:text-sm line-clamp-2">{description}</p>
          </div>

          {/* Interaction Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-700/50">
            <div className="flex gap-4 md:gap-6">
              <button
                onClick={() =>
                  handleLike(
                    "p",
                    id,
                    "Photo",
                    setDislikes,
                    setLikes,
                    setAction,
                    action
                  )
                }
                className={`flex items-center gap-2 text-sm md:text-base font-medium transition-all hover:scale-110 ${
                  action === "like"
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-blue-400"
                }`}
              >
                <FaThumbsUp />
                <span className="font-semibold">{likes}</span>
              </button>
              
              <button
                onClick={() =>
                  handleDislike(
                    "p",
                    id,
                    "Photo",
                    setDislikes,
                    setLikes,
                    setAction,
                    action
                  )
                }
                className={`flex items-center gap-2 text-sm md:text-base font-medium transition-all hover:scale-110 ${
                  action === "dislike"
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-400"
                }`}
              >
                <FaThumbsDown />
                <span className="font-semibold">{dislikes}</span>
              </button>
            </div>

            <button
              onClick={handlePhotoClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all text-sm font-medium hover:scale-105"
            >
              <FaCommentDots />
              <span className="hidden sm:inline">{isPhotoClicked ? "Close" : "View"}</span>
              <span>{comments?.length || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photo;