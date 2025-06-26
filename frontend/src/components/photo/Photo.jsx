import React, { useState, useEffect } from "react";
import { onSubmitAxios } from "../../utils/axios";
import Avatar from "../uni/Avatar";
import { FaThumbsUp, FaThumbsDown, FaCommentDots, FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Added arrow icons
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

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      (prevIndex + 1) % (morePhoto ? morePhoto.length + 1 : 1)
    );
  };

  const handlePreviousPhoto = () => {
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

  return (
    <div
      className={`border-gray-950 rounded-lg  h-[670px] shadow-lg p-4 bg-gray-800 text-white transition-all duration-300 hover:shadow-2xl flex ${isPhotoClicked ? "w-[800px]" : "w-[500px]"}`}
    >
      {/* Comments Section */}
      {isPhotoClicked && (
        <div className="w-[45%] overflow-y-auto pr-4 border-r border-gray-700 custom-scrollbar">
          {comments ? (
            <Comment commen={comments} id={id} type="photo" />
          ) : (
            <p className="text-gray-400 text-sm">Loading comments...</p>
          )}
        </div>
      )}

      {/* Main Photo Section */}
      <div className={`flex-1 ${isPhotoClicked ? "pl-4" : ""}`}>
        {/* User Info */}
        <div className="flex items-center mb-4">
          <Avatar avatar={avatar} id={ownerId} />
          <div className="ml-3">
            <p className="font-bold text-white">{fullName}</p>
          </div>
        </div>

        {/* Photo and Navigation */}
        <div className="relative mb-4 flex justify-center items-center" onDoubleClick={handleDoubleClick}>
          <img
            src={currentPhoto}
            alt={title}
            className="w-[400px] h-[400px] rounded-md cursor-pointer object-cover"
          />
          {morePhoto && morePhoto.length > 0 && (
            <>
              <button
                onClick={handlePreviousPhoto}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-600 p-2 rounded-full hover:bg-gray-500"
              >
                <FaArrowLeft className="text-white" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-600 p-2 rounded-full hover:bg-gray-500"
              >
                <FaArrowRight className="text-white" />
              </button>
            </>
          )}
        </div>

        {/* Photo Details */}
        <div>
          <h2 className="font-semibold text-lg text-white mb-1">{title}</h2>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>

        {/* Like/Dislike and Comment Section */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex space-x-6">
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
              className={`flex items-center space-x-2 text-lg font-medium ${
                action === "like"
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-blue-400"
              }`}
            >
              <FaThumbsUp />
              <span>{likes}</span>
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
              className={`flex items-center space-x-2 text-lg font-medium ${
                action === "dislike"
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-400"
              }`}
            >
              <FaThumbsDown />
              <span>{dislikes}</span>
            </button>
          </div>

          <button
            onClick={handlePhotoClick}
            className="flex items-center space-x-2 text-gray-400 hover:text-gray-200"
          >
            <span>{comments?.length}</span>
            <FaCommentDots />
            <span className="text-sm font-medium">
              {isPhotoClicked ? "Close Comments" : "View Comments"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Photo;
