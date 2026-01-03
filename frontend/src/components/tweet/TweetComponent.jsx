import React, { useState, useEffect, useRef } from "react";
import { FaThumbsUp, FaThumbsDown, FaRetweet, FaTimes, FaImage } from "react-icons/fa";
import Avatar from "../uni/Avatar";
import { handleDislike, handleLike, likeInfo } from "../../utils/likeDislike";
import { useNavigate } from "react-router-dom";
import { onSubmitAxios } from "../../utils/axios";

const TweetComponent = ({
  tweetId,
  avatar,
  fullName,
  username,
  userId,
  content,
  image = null,
  setChildren,
  doRetweet = true,
}) => {
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [action, setAction] = useState(null);
  const [retweetForm, setRetweetForm] = useState({ content: "", photo: null });
  const [showRetweetForm, setShowRetweetForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchTweetData = async () => {
      try {
        likeInfo("t", tweetId, "Tweet", setDislikeCount, setLikeCount, setAction);
      } catch (error) {
        console.error("Error fetching tweet data", error);
      }
    };
    fetchTweetData();
  }, [tweetId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRetweetForm({ ...retweetForm, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setRetweetForm({ ...retweetForm, photo: null });
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRetweetSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("data", retweetForm.content);
    formData.append("type", "retweet");
    formData.append("parentTweetId", tweetId);
    if (retweetForm.photo) formData.append("photo", retweetForm.photo);

    try {
      const response = await onSubmitAxios("post", "tweets/", formData);
      const newRetweet = response.data.data;
      setChildren((prev) =>
        prev.map((i) =>
          i._id === tweetId ? { ...i, children: [...i.children, newRetweet] } : i
        )
      );
      setShowRetweetForm(false);
      setRetweetForm({ content: "", photo: null });
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error posting retweet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nav = () => {
    navigate(`/tweet/${tweetId}`);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 overflow-hidden">
      {/* Tweet Header */}
      <div className="p-5">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar avatar={avatar} id={userId} />
          <div className="flex-1">
            <p className="text-base font-bold text-white">{fullName}</p>
            <p className="text-gray-400 text-xs">@{username}</p>
          </div>
        </div>

        {/* Tweet Content */}
        <p
          onClick={nav}
          className="text-sm text-gray-200 mb-4 cursor-pointer hover:text-white transition-colors leading-relaxed"
        >
          {content}
        </p>

        {/* Tweet Image */}
        {image && (
          <div className="mb-4 rounded-lg overflow-hidden bg-black/20">
            <img
              src={image}
              alt="Tweet"
              className="w-full h-auto max-h-96 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={nav}
            />
          </div>
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center justify-start space-x-6 pt-4 border-t border-gray-700/50">
          {/* Like Button */}
          <button
            onClick={() =>
              handleLike(
                "t",
                tweetId,
                "Tweet",
                setDislikeCount,
                setLikeCount,
                setAction,
                action
              )
            }
            className={`flex items-center space-x-2 transition-all hover:scale-110 ${
              action === "like"
                ? "text-blue-500"
                : "text-gray-400 hover:text-blue-400"
            }`}
          >
            <FaThumbsUp />
            <span className="text-sm font-semibold">{likeCount}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={() =>
              handleDislike(
                "t",
                tweetId,
                "Tweet",
                setDislikeCount,
                setLikeCount,
                setAction,
                action
              )
            }
            className={`flex items-center space-x-2 transition-all hover:scale-110 ${
              action === "dislike"
                ? "text-red-500"
                : "text-gray-400 hover:text-red-400"
            }`}
          >
            <FaThumbsDown />
            <span className="text-sm font-semibold">{dislikeCount}</span>
          </button>

          {/* Retweet Button */}
          <button
            onClick={() => {
              if (doRetweet) {
                setShowRetweetForm((prev) => !prev);
              } else {
                navigate(`/tweet/${tweetId}`);
              }
            }}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-all hover:scale-110"
          >
            <FaRetweet />
            <span className="text-sm font-medium">
              {doRetweet ? "Retweet" : "View Thread"}
            </span>
          </button>
        </div>
      </div>

      {/* Retweet Form */}
      {showRetweetForm && (
        <div className="border-t border-gray-700/50 bg-gray-900/50 p-5 animate-slide-down">
          <form onSubmit={handleRetweetSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FaRetweet className="text-blue-400" />
                Add your thoughts
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowRetweetForm(false);
                  setRetweetForm({ content: "", photo: null });
                  setPreviewImage(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <textarea
              value={retweetForm.content}
              onChange={(e) =>
                setRetweetForm({ ...retweetForm, content: e.target.value })
              }
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 resize-none"
              placeholder="Add a comment..."
              rows="3"
              required
            />

            {/* Image Preview */}
            {previewImage && (
              <div className="relative inline-block">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-h-48 rounded-lg border-2 border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg cursor-pointer transition-all text-sm">
                <FaImage />
                <span>Add Image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !retweetForm.content.trim()}
                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <FaRetweet />
                    Post Retweet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

   
    </div>
  );
};

export default TweetComponent;