import React, { useEffect, useState } from "react";
import TweetComponent from "../components/tweet/TweetComponent";
import Notifier from "../components/uni/Notifier";
import { onSubmitAxios } from "../utils/axios";

const TweetPage = () => {
  const [tweets, setTweets] = useState([]);
  const [tweetContent, setTweetContent] = useState("");
  const [tweetFile, setTweetFile] = useState(null); // State for the uploaded file
  const [page, setPage] = useState(1); // Page state for pagination
  const [hasMore, setHasMore] = useState(true); // Flag to check if there are more tweets
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [addPanel, setAddPanel] = useState(false)
  const [load, setLoad] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  // Fetch tweets from the server
  useEffect(() => {
    const fetchTweets = async () => {
      setIsLoading(true); // Start loading
      try {
        const response = await onSubmitAxios("get", "tweets/", {}, {}, { page });
        if (response.data.success) {
          const fetchedTweets = response.data.data;
          if (fetchedTweets.length ===0) {
            setHasMore(false); // No more tweets to fetch
          } else {
            setTweets((prevTweets) => [...prevTweets, ...fetchedTweets]); // Append new tweets
          }
        } else {
          setHasMore(false); 
        }
      } catch (error) {
        
        setHasMore(false); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchTweets();
  }, [page]); // Re-fetch when page changes

  // Submit tweet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tweetContent.trim() && !tweetFile) return; // Prevent empty tweets and file

    const formData = new FormData();
    formData.append("data", tweetContent);
    if (tweetFile) formData.append("photo", tweetFile); // Append the file to FormData

    try {
      setVisible(true);
      setLoad(true);
      const response = await onSubmitAxios("post", "tweets/", formData);
      setLoad(false);
      setMessage("success");
      if (response.data.success) {
        setTweets((prevTweets) => [response.data.data, ...prevTweets]); // Add new tweet to the top
        setTweetContent(""); // Clear the input
        setTweetFile(null); // Clear the file input
      } else {
        setLoad(false);
        setMessage("error");
        console.error("Failed to post tweet");
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
    }
  };

  // Handle scroll to fetch next page
  const handleScroll = (e) => {
    const container = e.target;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50 && hasMore && !isLoading) {
      setPage((prev) => prev + 1); // Increment page when scrolled to the bottom
    }
  };

  return (<div
    className="bg-gray-900 min-h-screen py-6 px-4 sm:px-6 lg:px-8"
  >
    {visible && (
      <Notifier
        type={message}
        message={
          message === "error"
            ? "Error in uploading Tweet"
            : " Success in Uploading"
        }
        loading={load}
        setV={setVisible}
      />
    )}
    <div className="max-w-4xl mx-auto">
        <button 
        className="bg-slate-900 border-2 border-black rounded-lg py-2 text-white px-2 fixed left-2"
        onClick={()=>setAddPanel(!addPanel)}>Click to add Tweet</button>
      {/* Tweet Submission Form */}
      {addPanel && (<form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-4 rounded-lg shadow-md mb-6"
      >
        <textarea
          value={tweetContent}
          onChange={(e) => setTweetContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
        />
        <input
          type="file"
          onChange={(e) => setTweetFile(e.target.files[0])} // Update state with selected file
          className="mt-3"
        />
        <button
          type="submit"
          className="mt-3 px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Tweet
        </button>
      </form>)}
  
      {/* Scrollable Tweet List */}
      <div
        onScroll={handleScroll}
        className="space-y-4 h-[90vh] overflow-y-auto  scrollbar-hide  p-4"
      >
        {tweets.map((tweet) => (
          <TweetComponent
            userId={tweet.owner._id}
            key={tweet._id}
            tweetId={tweet._id}
            avatar={tweet.owner.avatar}
            fullName={tweet.owner.fullName}
            username={tweet.owner.username}
            content={tweet.content}
            image={tweet.photo}
          />
        ))}
        {isLoading && <p className="text-center text-gray-500">Loading...</p>}
      </div>
    </div>
  </div>
  );
};

export default TweetPage;
