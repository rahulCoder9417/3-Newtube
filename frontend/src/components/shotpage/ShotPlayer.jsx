import React, { useEffect, useRef, useState } from "react";
import { FaThumbsUp, FaThumbsDown, FaCommentAlt } from "react-icons/fa";
import { onSubmitAxios } from "../../utils/axios";
import { handleDislike, handleLike, likeInfo } from "../../utils/likeDislike";
import Comment from "../uni/Comment";
import dayjs from "dayjs";
import Avatar from "../uni/Avatar";

// Helper function to format numbers (e.g., views to '1k')
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num;
};

const ShotPlayer = ({
  owner,
  id,
  videoFile,
  title,
  tags,
  views,
  createdAt,
  description,
  setCanScroll,
  CanScroll,
}) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState("");
  const [see, setSee] = useState(false);
  const [comments, setComments] = useState([]);
  const [op, setOp] = useState(false)
  const [user, setUser] = useState({avatar:"",username:""})
  const videoRef = useRef(null);

  // Fetch video details (likes, dislikes, comments)
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const commentResponse = await onSubmitAxios(
          "get",
          `comments/${id}`,
          {},
          {},
          { type: "video" }
        );
        setComments(commentResponse.data.data.comments);

        likeInfo("v", id, "Video", setDislikes, setLikes, setAction);
        const user = await onSubmitAxios("get",`users/getUser/${owner}`)
        setUser((prev)=>({...prev,avatar:user.data.data.avatar,username:user.data.data.username}))
      } catch (error) {
        console.error("Error fetching video details:", error);
      }
    };
    fetchVideoDetails();
  }, [id]);

  const toggleComments = () => {
    setSee((prev) => !prev);
    setCanScroll(!CanScroll);
  };

  // Prevent scrolling on the body when comments are visible
  useEffect(() => {
    if (see) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [see]);
  const seeTag = () => {
    setOp(!op);
  };

  return (
    <>
      {id && (
        <div className="relative w-[360px] aspect-[9/16] bg-gray-900 rounded-lg shadow-lg ">
          {/* Video Player */}
          <video ref={videoRef} loop autoPlay controls className="w-full h-full">
            <source src={videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Info Overlay */}
          <div className="absolute bottom-4 left-4 text-gray-300">
            <h3 className="font-bold text-xl text-white">{title}</h3>
            <p className="text-sm">{description}</p>
            <div className="flex gap-4">
            <Avatar avatar={user.avatar} id={owner} dimension={"w-10 h-10"}/><p className="text-black mt-2"> @{user.username}</p></div>
            <p onClick={seeTag} className="text-lg ">
              {" "}
              Tags -{" "}
              {op && tags.map((i) => (
                <span className="rounded-xl bg-gray-700 text-sm border-none p-2 px-4 m-1 cursor-pointer">
                  {i}
                </span>
              ))}
            </p>
            <p className="text-xs mt-1 text-gray-400">
              {dayjs(createdAt).format("MMMM D, YYYY")} • {formatNumber(views)}{" "}
              views
            </p>
          </div>

          {/* Actions: Like, Dislike, Comment */}
          <div className="flex flex-col absolute bottom-[25%] gap-6 right-5">
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
              className={`flex flex-col items-center gap-1 ${
                action === "like"
                  ? "text-blue-700"
                  : "text-white hover:text-blue-400"
              }`}
            >
              <FaThumbsUp size={28} />
              <span className="text-sm font-medium">{formatNumber(likes)}</span>
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
              className={`flex flex-col items-center gap-1 ${
                action === "dislike"
                  ? "text-red-700"
                  : "text-white hover:text-red-400"
              }`}
            >
              <FaThumbsDown size={28} />
              <span className="text-sm font-medium">
                {formatNumber(dislikes)}
              </span>
            </button>
            <button
              onClick={toggleComments}
              className="flex flex-col items-center gap-1 text-white hover:text-gray-300"
            >
              <FaCommentAlt size={28} />
              <span className="text-sm font-medium">{comments.length}</span>
            </button>
          </div>

          {/* Comments Section */}
          {see && (
            <div
              className="absolute left-[110%] top-40 h-[300px] w-[460px] custom-scrollbar bg-gray-800 rounded-lg shadow-lg p-4 overflow-y-auto"
              onWheel={(e) => e.stopPropagation()} // Prevent click events from propagating to parent
            >
              <h4 className="text-lg text-white mb-4">Comments</h4>

              <Comment commen={comments} id={id} type={"video"} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShotPlayer;
