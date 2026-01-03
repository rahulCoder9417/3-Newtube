import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaThumbsUp, FaThumbsDown, FaRetweet, FaArrowLeft, FaChevronDown, FaChevronUp, FaTimes, FaImage } from "react-icons/fa";
import { onSubmitAxios } from "../utils/axios";
import { handleDislike, handleLike, likeInfo } from "../utils/likeDislike";
import TweetComponent from "../components/tweet/TweetComponent";
import Avatar from "../components/uni/Avatar";

const Tweets = () => {
  const { id: tweetId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  
  const [tweet, setTweet] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [action, setAction] = useState(null);
  const [children, setChildren] = useState([]);
  const [retweetForm, setRetweetForm] = useState({ content: "", photo: null });
  const [showRetweetForm, setShowRetweetForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchedIds = new Set();

  useEffect(() => {
    const fetchTweet = async () => {
      setIsLoading(true);
      try {
        const response = await onSubmitAxios("get", `tweets/tweet/${tweetId}`);
        setTweet(response.data.data);

        likeInfo("t", tweetId, "Tweet", setDislikeCount, setLikeCount, setAction);

        const fetchChildren = async (parentId) => {
          if (fetchedIds.has(parentId)) return [];
          fetchedIds.add(parentId);

          const childResponse = await onSubmitAxios("get", `tweets/child/${parentId}`);
          const children = childResponse.data.data || [];
          
          for (const child of children) {
            child.children = await fetchChildren(child._id);
            child.showChildren = false;
          }
          return children;
        };

        const nestedChildren = await fetchChildren(tweetId);
        setChildren(nestedChildren);
      } catch (error) {
        console.error("Error fetching tweet details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTweet();
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
      setChildren((prevChildren) => [
        ...prevChildren,
        { ...newRetweet, children: [], showChildren: false },
      ]);

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

  const toggleChildrenVisibility = (tweetId) => {
    setChildren((prevChildren) =>
      prevChildren.map((tweet) =>
        tweet._id === tweetId
          ? { ...tweet, showChildren: !tweet.showChildren }
          : tweet
      )
    );
  };

  const renderNestedTweets = (tweets, depth = 0) => {
    return tweets.map((tweet) => (
      <div
        key={tweet._id}
        className={`${depth > 0 ? "ml-4 md:ml-8 pl-4 border-l-2 border-gray-700/50" : ""} mt-4 animate-fade-in`}
      >
        <TweetComponent
          setChildren={setChildren}
          userId={tweet.owner?._id}
          tweetId={tweet._id}
          avatar={tweet.owner?.avatar}
          fullName={tweet.owner?.fullName}
          username={tweet.owner?.username}
          content={tweet.content}
          image={tweet.photo}
          doRetweet={true}
        />
        
        {tweet.children && tweet.children.length > 0 && (
          <div className="mt-2 ml-4">
            <button
              onClick={() => toggleChildrenVisibility(tweet._id)}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              {tweet.showChildren ? (
                <>
                  <FaChevronUp />
                  Hide {tweet.children.length} {tweet.children.length === 1 ? "reply" : "replies"}
                </>
              ) : (
                <>
                  <FaChevronDown />
                  Show {tweet.children.length} {tweet.children.length === 1 ? "reply" : "replies"}
                </>
              )}
            </button>
          </div>
        )}
        
        {tweet.showChildren && tweet.children && tweet.children.length > 0 && (
          <div className="mt-2">{renderNestedTweets(tweet.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 font-medium">Loading tweet...</p>
        </div>
      </div>
    );
  }

  if (!tweet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-lg">Tweet not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { content, photo, owner } = tweet;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-white text-xl" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white">Tweet</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Main Tweet */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-6">
            {/* User Info */}
            <div className="flex items-center space-x-4 mb-6">
              <Avatar avatar={owner?.avatar} id={owner?._id} />
              <div>
                <p className="text-lg font-bold text-white">{owner?.fullName}</p>
                <p className="text-gray-400 text-sm">@{owner?.username}</p>
              </div>
            </div>

            {/* Tweet Content */}
            <p className="text-base text-gray-200 mb-6 leading-relaxed">{content}</p>

            {/* Tweet Image */}
            {photo && (
              <div className="mb-6 rounded-lg overflow-hidden bg-black/20">
                <img
                  src={photo}
                  alt="Tweet"
                  className="w-full max-h-[500px] object-contain"
                />
              </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-700/50">
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
                <FaThumbsUp className="text-xl" />
                <span className="text-base font-semibold">{likeCount}</span>
              </button>

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
                <FaThumbsDown className="text-xl" />
                <span className="text-base font-semibold">{dislikeCount}</span>
              </button>

              <button
                onClick={() => setShowRetweetForm((prev) => !prev)}
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-all hover:scale-110"
              >
                <FaRetweet className="text-xl" />
                <span className="text-base font-medium">Retweet</span>
              </button>
            </div>
          </div>

          {/* Retweet Form */}
          {showRetweetForm && (
            <div className="border-t border-gray-700/50 bg-gray-900/50 p-6 animate-slide-down">
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
                  className="w-full p-4 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 resize-none"
                  placeholder="Add a comment..."
                  rows="3"
                  required
                />

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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg cursor-pointer transition-all">
                    <FaImage />
                    <span className="text-sm">Add Image</span>
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

        {/* Replies Section */}
        {children.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Replies
              </span>
              <span className="text-sm font-normal text-gray-400">
                ({children.length})
              </span>
            </h2>
            {renderNestedTweets(children)}
          </div>
        )}

        {/* No Replies State */}
        {children.length === 0 && !isLoading && (
          <div className="mt-8 text-center py-12">
            <p className="text-gray-500">No replies yet. Be the first to reply!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Tweets;