import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { onSubmitAxios } from "../utils/axios";
import { handleDislike, handleLike, likeInfo } from "../utils/likeDislike";
import TweetComponent from "../components/tweet/TweetComponent";
import Avatar from "../components/uni/Avatar";

const  Tweets = () => {
  const { id: tweetId } = useParams();
  const [tweet, setTweet] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [action, setAction] = useState(null);
  const [children, setChildren] = useState([]);
  const [retweetForm, setRetweetForm] = useState({ content: "", photo: null });
  const [showRetweetForm, setShowRetweetForm] = useState(false);

  const fetchedIds = new Set(); // To track fetched tweet IDs

  // Fetch tweet and nested children
  useEffect(() => {
    const fetchTweet = async () => {
      try {
        const response = await onSubmitAxios("get", `tweets/tweet/${tweetId}`);
        setTweet(response.data.data);

        likeInfo(
          "t",
          tweetId,
          "Tweet",
          setDislikeCount,
          setLikeCount,
          setAction
        );

        const fetchChildren = async (parentId) => {
          if (fetchedIds.has(parentId)) return [];
          fetchedIds.add(parentId);

          const childResponse = await onSubmitAxios(
            "get",
            `tweets/child/${parentId}`
          );
          const children = childResponse.data.data || [];
          for (const child of children) {
            child.children = await fetchChildren(child._id);
            child.showChildren = false; // Ensure showChildren is part of each child tweet
          }
          return children;
        };

        const nestedChildren = await fetchChildren(tweetId);
        setChildren(nestedChildren);
      } catch (error) {
        console.error("Error fetching tweet details:", error);
      }
    };

    fetchTweet();
  }, [tweetId]);

  // Recursive function to render nested tweets
  const renderNestedTweets = (tweets, parentId = null) => {
    return tweets.map((tweet, index) => (
      <div key={tweet._id} className="pl-4 border-l-2 border-gray-700">
        <TweetComponent
          setChildren={setChildren}
          userId={tweet.owner?._id}
          tweetId={tweet._id}
          avatar={tweet.owner?.avatar}
          fullName={tweet.owner?.fullName}
          username={tweet.owner?.username}
          content={tweet.content}
          image={tweet.photo}
        />
        {tweet.children && tweet.children.length > 0 && parentId === null && (
          <div className="mt-2">
            <button
              onClick={() => toggleChildrenVisibility(tweet._id)}
              className="text-blue-500 hover:underline"
            >
              {tweet.showChildren ? "Hide Replies" : "Show Replies"}
            </button>
          </div>
        )}
        {tweet.children && tweet.children.length > 0 && tweet.showChildren && (
          <div className="pl-4">{renderNestedTweets(tweet.children, tweet._id)}</div>
        )}
      </div>
    ));
  };

  const toggleChildrenVisibility = (tweetId) => {
    setChildren((prevChildren) =>
      prevChildren.map((tweet) =>
        tweet._id === tweetId ? { ...tweet, showChildren: !tweet.showChildren } : tweet
      )
    );
  };

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
      setChildren((prevChildren) => [
        ...prevChildren,
        { ...newRetweet, children: [] },
      ]);

      setShowRetweetForm(false);
      setRetweetForm({ content: "", photo: null });
    } catch (error) {
      console.error("Error posting retweet:", error);
    }
  };
  if (!tweet) return <div className="text-white text-center mt-8">Loading...</div>;

  const { content, photo, owner } = tweet;

  return (<div className="w-full min-h-screen bg-gray-900">
    <div className="w-3/4 mx-auto  bg-black text-gray-200 p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <Avatar avatar={owner?.avatar} id={owner?._id} />
        <div>
          <p className="text-base font-semibold">{owner?.fullName}</p>
          <p className="text-gray-400 text-xs">@{owner?.username}</p>
        </div>
      </div>

      <p className="mt-4 text-sm">{content}</p>

      {photo && (
        <div className="mt-4 flex justify-center items-center bg-gray-800 rounded-md overflow-hidden">
          <img src={photo} alt="Tweet" className="max-h-[400px] object-contain" />
        </div>
      )}

      <div className="mt-4 flex items-center space-x-6">
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
            className={`p-2 rounded-full transition-transform ${
              action === "like" ? "text-blue-500 scale-110" : "text-gray-400"
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
            className={`p-2 rounded-full transition-transform ${
              action === "dislike" ? "text-red-500 scale-110" : "text-gray-400"
            }`}
          >
            <FaThumbsDown />
          </button>
        </div>
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
      {/* Render nested tweets */}
      <div className="mt-6">{renderNestedTweets(children)}</div>
    </div>
    </div>);
};

export default Tweets;
