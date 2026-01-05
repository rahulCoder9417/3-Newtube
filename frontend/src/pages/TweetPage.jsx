import React, { useEffect, useState, useRef, useCallback } from "react";
import TweetComponent from "../components/tweet/TweetComponent";
import Notifier from "../components/uni/Notifier";
import { onSubmitAxios } from "../utils/axios";
import { FaPlus, FaTimes, FaImage } from "react-icons/fa";
import { uploadToCloudinary } from "../utils/cloudinary";
const TweetPage = () => {
  const [tweets, setTweets] = useState([]);
  const [tweetContent, setTweetContent] = useState("");
  const [tweetFile, setTweetFile] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [addPanel, setAddPanel] = useState(false);
  const [load, setLoad] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const observerRef = useRef();
  const lastTweetRef = useRef();
  const fileInputRef = useRef();

  // Fetch tweets from the server
  const fetchTweets = async (currentPage) => {
    setIsLoading(true);
    try {
      const response = await onSubmitAxios("get", "tweets/", {}, {}, { page: currentPage });
      if (response.data.success) {
        const fetchedTweets = response.data.data;
        if (fetchedTweets.length === 0) {
          setHasMore(false);
        } else {
          setTweets((prevTweets) => [...prevTweets, ...fetchedTweets]);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching tweets:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoading]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "200px",
      threshold: 0
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    if (lastTweetRef.current) {
      observerRef.current.observe(lastTweetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    fetchTweets(page);
  }, [page]);

  // Handle file selection with preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTweetFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setTweetFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit tweet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tweetContent.trim() && !tweetFile) return;


    try {
      setVisible(true);
      setLoad(true);

      let photo = null;
      if (tweetFile) {
        const cloudinaryResponse = await uploadToCloudinary(tweetFile, "image");
        photo = cloudinaryResponse.secure_url;
      }
      
    const formData = new FormData();
    formData.append("data", tweetContent);
    if (photo) formData.append("photo", photo || null);
      const response = await onSubmitAxios("post", "tweets/", formData);
      setLoad(false);
      
      if (response.data.success) {
        setMessage("success");
        setTweets((prevTweets) => [response.data.data, ...prevTweets]);
        setTweetContent("");
        setTweetFile(null);
        setPreviewImage(null);
        setAddPanel(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setMessage("error");
        console.error("Failed to post tweet");
      }
    } catch (error) {
      setLoad(false);
      setMessage("error");
      console.error("Error posting tweet:", error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      {visible && (
        <Notifier
          type={message}
          message={
            message === "error"
              ? "Error in uploading Tweet"
              : "Tweet posted successfully!"
          }
          loading={load}
          setV={setVisible}
        />
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Tweets
            </span>
           
          </h1>
          
          {/* Add Tweet Button */}
          <button
            onClick={() => setAddPanel(!addPanel)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all hover:scale-105 shadow-lg"
          >
            {addPanel ? <FaTimes /> : <FaPlus />}
            <span className="hidden sm:inline">{addPanel ? "Close" : "New Tweet"}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tweet Submission Form */}
        {addPanel && (
          <div className="mb-6 animate-slide-down">
            <form
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl shadow-2xl border border-gray-700/50"
            >
              <textarea
                value={tweetContent}
                onChange={(e) => setTweetContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full p-4 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 resize-none"
                rows="4"
              />

              {/* Image Preview */}
              {previewImage && (
                <div className="mt-4 relative inline-block">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-64 rounded-lg border-2 border-gray-600"
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
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-all">
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
                  disabled={!tweetContent.trim() && !tweetFile}
                  className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105"
                >
                  Tweet
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tweet List */}
        <div className="space-y-4">
          {tweets.map((tweet, index) => (
            <div
              key={tweet._id}
              ref={index === tweets.length - 1 ? lastTweetRef : null}
              className="animate-fade-in"
            >
              <TweetComponent
                userId={tweet.owner._id}
                tweetId={tweet._id}
                avatar={tweet.owner.avatar}
                fullName={tweet.owner.fullName}
                username={tweet.owner.username}
                content={tweet.content}
                image={tweet.photo}
                doRetweet={false}
              />
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium">Loading tweets...</p>
            </div>
          )}

          {/* End of Feed */}
          {!hasMore && tweets.length > 0 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-gray-300 font-semibold text-lg">You're all caught up!</p>
                <p className="text-gray-500 text-sm mt-1">No more tweets to load</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && tweets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-gray-400 font-medium text-lg">No tweets yet</p>
                <p className="text-gray-600 text-sm mt-1">Be the first to share your thoughts!</p>
              </div>
            </div>
          )}
        </div>
      </div>

     
    </div>
  );
};

export default TweetPage;