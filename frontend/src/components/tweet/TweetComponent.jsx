import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
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
}) => {
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [action, setAction] = useState(null); // Tracks whether the user has liked or disliked the tweet
  const navigate = useNavigate();
  const [retweetForm, setRetweetForm] = useState({ content: "", photo: null });
  const [showRetweetForm, setShowRetweetForm] = useState(false);

  useEffect(() => {
    const fetchTweetData = async () => {
      try {
        likeInfo(
          "t",
          tweetId,
          "Tweet",
          setDislikeCount,
          setLikeCount,
          setAction
        );
      } catch (error) {
        console.error("Error fetching tweet data", error);
      }
    };

    fetchTweetData();
  }, [tweetId]);
  const handleRetweetSubmit = async (e) => {
    e.preventDefault();

    // Prepare FormData
    const formData = new FormData();
    formData.append("data", retweetForm.content);
    formData.append("type", "retweet");
    formData.append("parentTweetId", tweetId);
    if (retweetForm.photo) formData.append("photo", retweetForm.photo);

    try {
      const response = await onSubmitAxios("post", "tweets/", formData);
      const newRetweet = response.data.data;
      setChildren((prev)=>prev.map(i=>(i._id===tweetId ? {...i,children:[...i.children,newRetweet]}:i)))
      setShowRetweetForm(false);
      setRetweetForm({ content: "", photo: null });
    } catch (error) {
      console.error("Error posting retweet:", error);
    }
  };

  const nav = () => {
    navigate(`/tweet/${tweetId}`); // Replace with your intended route
  };

  return (
    <div className="bg-gray-950 cursor-pointer text-white p-6 rounded-lg max-w-lg mx-auto my-4 shadow-md">
      <div className="flex items-center space-x-4">
        <Avatar avatar={avatar} id={userId} />
        <div>
          <p className="text-base font-semibold">{fullName}</p>
          <p className="text-gray-400 text-xs">@{username}</p>
        </div>
      </div>

      <p onClick={nav} className="mt-4 text-sm">
        {content}
      </p>

      {image && (
        <img
          src={image}
          alt="Tweet"
          className="mt-4 w-full h-auto rounded-md"
        />
      )}

      <div className="mt-4 flex items-center justify-start space-x-6">
        <div className="flex items-center space-x-1">
          <span className="text-sm">{likeCount}</span>
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
            className={`p-2 rounded-full transition-transform transform ${
              action === "like"
                ? "text-blue-500 scale-110"
                : "text-gray-400 hover:scale-110"
            }`}
          >
            <FaThumbsUp />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-sm">{dislikeCount}</span>
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
            className={`p-2 rounded-full transition-transform transform ${
              action === "dislike"
                ? "text-red-500 scale-110"
                : "text-gray-400 hover:scale-110"
            }`}
          >
            <FaThumbsDown />
          </button>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowRetweetForm((prev) => !prev)}
            className={`p-2 rounded-full text-blue-400 hover:scale-110`}
          >
            Retweet
          </button>
          {showRetweetForm && (
            <form
              onSubmit={handleRetweetSubmit}
              className="mt-4 bg-gray-900 p-4 rounded-lg"
            >
              <textarea
                value={retweetForm.content}
                onChange={(e) =>
                  setRetweetForm({ ...retweetForm, content: e.target.value })
                }
                className="w-full p-2 bg-gray-800 text-white rounded"
                placeholder="Add a comment..."
                required
              />
              <input
                type="file"
                onChange={(e) =>
                  setRetweetForm({ ...retweetForm, photo: e.target.files[0] })
                }
                className="mt-2 w-full text-white"
              />
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Post Retweet
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetComponent;
