import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaCommentAlt,
} from "react-icons/fa";
import dayjs from "dayjs";

import { onSubmitAxios } from "../../utils/axios";
import {
  handleDislike,
  handleLike,
  likeInfo,
} from "../../utils/likeDislike";

import Comment from "../uni/Comment";
import Avatar from "../uni/Avatar";

/* -------------------- Utils -------------------- */

const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return (
      (num / 1_000_000)
        .toFixed(1)
        .replace(/\.0$/, "") + "M"
    );
  }

  if (num >= 1_000) {
    return (
      (num / 1_000)
        .toFixed(1)
        .replace(/\.0$/, "") + "k"
    );
  }

  return num;
};

/* -------------------- Component -------------------- */

const ShotPlayer = ({
  owner,
  id,
  videoFile,
  title,
  tags = [],
  views,
  createdAt,
  description,
  setCanScroll,
  canScroll,
}) => {
  /* ---------- State ---------- */

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState("");

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);

  const [showTags, setShowTags] = useState(false);

  const [user, setUser] = useState({
    avatar: "",
    username: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  /* ---------- Refs ---------- */

  const videoRef = useRef(null);
  const commentsRef = useRef(null);

  /* ---------- Fetch video data ---------- */

  useEffect(() => {
    const fetchVideoData = async () => {
      setIsLoading(true);

      try {
        const [commentResponse, userResponse] =
          await Promise.all([
            onSubmitAxios(
              "get",
              `comments/${id}`,
              {},
              {},
              { type: "video" }
            ),
            onSubmitAxios(
              "get",
              `users/getUser/${owner}`
            ),
          ]);

        // increment views
        await onSubmitAxios("get", `videos/${id}`);

        setComments(
          commentResponse.data.data.comments
        );

        setUser({
          avatar:
            userResponse.data.data.avatar,
          username:
            userResponse.data.data.username,
        });

        likeInfo(
          "v",
          id,
          "Video",
          setDislikes,
          setLikes,
          setAction
        );
      } catch (error) {
        console.error(
          "Error fetching video data:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchVideoData();
    }
  }, [id, owner]);

  /* ---------- Toggle comments ---------- */

  const toggleComments = useCallback(() => {
    setShowComments((prev) => {
      const next = !prev;
      setCanScroll(!next);
      return next;
    });
  }, [setCanScroll]);

  /* ---------- Close comments on outside click ---------- */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showComments &&
        commentsRef.current &&
        !commentsRef.current.contains(
          event.target
        ) &&
        !event.target.closest(
          '[aria-label="Toggle comments"]'
        )
      ) {
        setShowComments(false);
        setCanScroll(true);
      }
    };

    if (showComments) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [showComments, setCanScroll]);

  /* ---------- Like / Dislike ---------- */

  const onLike = useCallback(() => {
    handleLike(
      "v",
      id,
      "Video",
      setDislikes,
      setLikes,
      setAction,
      action
    );
  }, [id, action]);

  const onDislike = useCallback(() => {
    handleDislike(
      "v",
      id,
      "Video",
      setDislikes,
      setLikes,
      setAction,
      action
    );
  }, [id, action]);

  if (!id) return null;

  /* -------------------- JSX -------------------- */

  return (
    <div className="relative w-[360px] aspect-[9/16] bg-gray-900 rounded-lg shadow-lg">
      {/* Video */}
      <video
        ref={videoRef}
        loop
        autoPlay
        controls
        playsInline
        className="w-full h-full rounded-lg"
      >
        <source
          src={videoFile}
          type="video/mp4"
        />
        Your browser does not support
        the video tag.
      </video>

      {/* Video Info */}
      <div className="absolute bottom-4 left-4 right-16 text-gray-300 z-10">
        <h3 className="text-xl font-bold text-white mb-1">
          {title}
        </h3>

        <p className="text-sm mb-2">
          {description}
        </p>

        {/* User */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar
            avatar={user.avatar}
            id={owner}
            dimension="w-10 h-10"
          />
          <p className="text-sm text-white">
            @{user.username}
          </p>
        </div>

        {/* Tags */}
        <div className="mb-1">
          <button
            onClick={() =>
              setShowTags(!showTags)
            }
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Tags {showTags ? "▼" : "▶"}
          </button>

          {showTags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="bg-gray-700 hover:bg-gray-600 text-xs rounded-xl px-3 py-1 cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Meta */}
        <p className="text-xs text-gray-400">
          {dayjs(createdAt).format(
            "MMMM D, YYYY"
          )}{" "}
          • {formatNumber(views)} views
        </p>
      </div>

      {/* Actions */}
      <div className="absolute right-5 bottom-[25%] z-10 flex flex-col gap-6">
        <button
          onClick={onLike}
          disabled={isLoading}
          aria-label="Like video"
          className={`flex flex-col items-center gap-1 transition-colors ${
            action === "like"
              ? "text-blue-500"
              : "text-white hover:text-blue-400"
          }`}
        >
          <FaThumbsUp size={28} />
          <span className="text-sm">
            {formatNumber(likes)}
          </span>
        </button>

        <button
          onClick={onDislike}
          disabled={isLoading}
          aria-label="Dislike video"
          className={`flex flex-col items-center gap-1 transition-colors ${
            action === "dislike"
              ? "text-red-500"
              : "text-white hover:text-red-400"
          }`}
        >
          <FaThumbsDown size={28} />
          <span className="text-sm">
            {formatNumber(dislikes)}
          </span>
        </button>

        <button
          onClick={toggleComments}
          aria-label="Toggle comments"
          className="flex flex-col items-center gap-1 text-white hover:text-gray-300 transition-colors"
        >
          <FaCommentAlt size={28} />
          <span className="text-sm">
            {comments.length}
          </span>
        </button>
      </div>

      {/* Comments Overlay */}
      {showComments && (
        <>
        <div
        
          className="absolute md:hidden inset-0 z-20 bg-black bg-opacity-75 rounded-lg flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h4 className="text-lg font-semibold text-white">
              Comments ({comments.length})
            </h4>

            <button
              onClick={toggleComments}
              aria-label="Close comments"
              className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar p-4"
            onWheel={(e) =>
              e.stopPropagation()
            }
          >
            <Comment
              commen={comments}
              id={id}
              type="video"
            />
          </div>
        </div>
        <div
        ref={commentsRef}
          className="absolute hidden md:block left-[110%] top-40 h-[300px] w-[460px] custom-scrollbar bg-gray-800 rounded-lg shadow-lg p-4 overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg text-white">
              Comments ({comments.length})
            </h4>
            <button
              onClick={toggleComments}
              className="text-gray-400 hover:text-white text-xl"
              aria-label="Close comments"
            >
              ✕
            </button>
          </div>

          <Comment commen={comments} id={id} type="video" />
        </div>
        </>
      )}
    </div>
  );
};

export default ShotPlayer;


