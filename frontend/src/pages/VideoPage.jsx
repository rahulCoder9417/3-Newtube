import React, { useEffect, useState } from "react";
import VideoPlayer from "../components/videoPage/VideoPlayer";
import VideoP from "../components/uni/Video";
import { useLocation, useParams } from "react-router-dom";
import { onSubmitAxios } from "../utils/axios";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import Comment from "../components/uni/Comment";
import { handleDislike, handleLike, likeInfo } from "../utils/likeDislike";
import Avatar from "../components/uni/Avatar";
import VideoPagePlaylist from "../components/playlist/VideoPagePlaylist";
import VideoThreeDots from "../components/playlist/VideoThreeDots";
const VideoPage = () => {
  const { id } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [des, setDes] = useState(false)
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState("");
  const [comment, setComment] = useState(null);
  const [playlist, setPlaylist] = useState(false);
  const [playData, setPlayData] = useState(null);
  const [recomendVideo, setRecomendVideo] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  useEffect(() => {
    async function fetchVideo() {
      try {
        const response = await onSubmitAxios(
          "get",
          `videos/videoManupulate/${id}`
        );
        setVideoData(response?.data?.data);

        const subs = await onSubmitAxios(
          "get",
          `users/c/${response?.data?.data.owner._id}`
        );
        setUserDetails(subs.data.data);
        // recommend
        const recommend = await onSubmitAxios("get", `videos/getrandom/7`);
        setRecomendVideo(recommend.data.data);
        const comments = await onSubmitAxios(
          "get",
          `comments/${id}`,
          {},
          {},
          { type: "video" }
        );
        setComment(comments.data.data.comments);

        if (queryParams.size !== 0) {
          const t = queryParams.get("t");
          const pId = queryParams.get("pId");
          const index = queryParams.get("index");

          setPlaylist(true);
          const op = { t, pId, index };
          setPlayData(op);
        } else {
          setPlaylist(false);
        }
        likeInfo("v", id, "Video", setDislikes, setLikes, setAction);
      } catch (error) {
        console.error("Error while fetching video data:", error);
      }
    }
    fetchVideo();
  }, [id]);

  const handleSubscribeToggle = async () => {
    try {
      const response = await onSubmitAxios("post", `subscriptions/c/${videoData.owner._id}`);
      if (response.data.message === "Subscribed successfully") {
        setUserDetails((prevState) => ({
          ...prevState,
          isSubscribed: true,
          subscribersCount: prevState.subscribersCount + 1,
        }));
      } else if (response.data.message === "Unsubscribed successfully") {
        setUserDetails((prevState) => ({
          ...prevState,
          isSubscribed: false,
          subscribersCount: prevState.subscribersCount - 1,
        }));
      }
    } catch (error) {
      console.error("Error while toggling subscription:", error);
      alert("Failed to toggle subscription. Please try again.");
    }
  };

  return (
    <div className="flex flex-row bg-gray-800">
      <div className="w-3/4 p-4">
        {videoData ? (
          <VideoPlayer
            key={videoData?.videoFile}
            id={id}
            videoUrl={videoData.videoFile}
          />
        ) : (
          <p>Loading video...</p>
        )}<div className="flex flex-col gap-4 w-full relative mt-4">
         <h2 className="text-5xl mt-3 font-bold text-black">
              {videoData?.title}
            </h2>

          <VideoThreeDots videoId={id} />
          </div>
        <div className="flex items-center justify-between gap-5 p-4 bg-gray-700 mt-10 shadow rounded-lg">
          {/* Avatar Section */}<div className="flex gap-5">
          <Avatar
            avatar={videoData?.owner?.avatar}
            id={videoData?.owner?._id}
          />

          {/* Content Section */}
       
            <p className="text-2xl mt-1 text-gray-950 font-medium">
              {videoData?.owner?.fullName || "Unknown"}
            </p>
            </div><div className="flex gap-5">
            <p className="text-xl mt-3 text-gray-950 font-medium">
              Subscribers: {userDetails?.subscribersCount || 0}
            </p>

            {/* Subscribe Button */}
            <button
              onClick={handleSubscribeToggle}
              className={`mt-2 px-4 py-2 rounded ${
                userDetails?.isSubscribed
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
            >
              {userDetails?.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
            </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() =>
              handleLike(
                "v",
                id,
                "Video",
                setDislikes,
                setLikes,
                setAction,
                action
              )
            }
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              action === "like"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-black hover:bg-blue-500"
            }`}
          >
            <FaThumbsUp />
            {likes}
          </button>
          <button
            onClick={() =>
              handleDislike(
                "v",
                id,
                "Video",
                setDislikes,
                setLikes,
                setAction,
                action
              )
            }
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              action === "dislike"
                ? "bg-red-600 text-white"
                : "bg-gray-300 text-black hover:bg-red-500"
            }`}
          >
            <FaThumbsDown />
            {dislikes}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded bg-slate-500" onClick={()=>setDes((prev)=>!prev)}>Description</button>
        </div>
        {des && 
        <div className="bg-gray-700 rounded-lg p-3 mt-3" >
        <p className="mt-4 text-gray-300"> Tags - {videoData?.tags.map((i)=>i)} </p>
        <p className="mt-4 text-gray-300"> {videoData?.description} </p>
        </div>}
        {/* if playlist */}
        {playlist ? (
          <VideoPagePlaylist
            playlistId={playData.pId}
            videoIndex={playData.index}
          />
        ) : (
          <></>
        )}
        
        {/* comment */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>
          <Comment commen={comment} id={id} type={"video"} />
        </div>
      </div>
      <div className="w-1/4 p-4 bg-gray-800">
        <div className="space-y-4">
          {recomendVideo.map((video) => (
            <VideoP
              key={video._id}
              createdAt={video.createdAt}
              id={video._id}
              title={video.title}
              thumbnail={video.thumbnail}
              views={video.views}
              duration={video.duration}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
