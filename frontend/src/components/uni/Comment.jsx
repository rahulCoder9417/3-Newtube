import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { onSubmitAxios } from "../../utils/axios";
import { handleDislike, handleLike, likeInfo, toggleLikeDislike } from "../../utils/likeDislike";
import Avatar from "./Avatar";
import Notifier from "./Notifier";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function Comment({ commen, id, type }) {
  const [newComment, setNewComment] = useState("");
  const [comment, setComment] = useState([]);
  const username = useSelector((state) => state.auth.username);
  const avatar = useSelector((state) => state.auth.avatar);
  const userId = useSelector((state) => state.auth.id);

  useEffect(() => {
    setComment(commen);
  }, [commen]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await onSubmitAxios("post", `comments/${id}`, {
        content: newComment,
        type,
      });
      const addedComment = response?.data?.data;
      addedComment["userDetails"] = { _id: userId, username, avatar };
      setComment([addedComment, ...comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error while adding comment:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <div className="flex gap-3">
          <Avatar avatar={avatar} id={userId} />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 resize-none"
              placeholder="Add a comment..."
              rows="3"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comment?.length > 0 ? (
          comment.map((comment) => (
            <CommentItem
              key={comment._id}
              setComment={setComment}
              comment={comment}
              typeId={id}
              type={type}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, setComment, typeId, type }) {
  const [showReplies, setShowReplies] = useState({});
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userAction, setUserAction] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyActions, setReplyActions] = useState({});
  const [load, setLoad] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [editPanel, setEditPanel] = useState(false);
  const [replyEditPanel, setReplyEditPanel] = useState(false);
  const [replyIdEdition, setReplyIdEdition] = useState(0);
  const [editableContent, setEditableContent] = useState("");
  const [ownerComment, setOwnerComment] = useState(false);
  const [ownerReply, setOwnerReply] = useState({});
  
  const stateUsername = useSelector((state) => state.auth.username);
  const _id = useSelector((state) => state.auth.id);
  const stateAvatar = useSelector((state) => state.auth.avatar);

  useEffect(() => {
    setOwnerComment(comment["userDetails"]._id === _id);
    likeInfo("c", comment._id, "Comment", setDislikes, setLikes, setUserAction);
    
    const fetchRepliesAction = async (reply) => {
      try {
        const likesResponse = await onSubmitAxios("get", `likes/get/c/${reply}`);
        const actionResponse = await onSubmitAxios("get", `likes/isLiked/comment/${reply}`);
        setReplyActions((prev) => ({
          ...prev,
          [reply]: {
            likes: likesResponse?.data?.data.likes || 0,
            dislikes: likesResponse?.data?.data.dislikes || 0,
            userAction: actionResponse?.data?.data.action || "",
          },
        }));
      } catch (error) {
        console.log("error while getting likes for replies", error);
      }
    };
    
    comment.replies.forEach((i) => fetchRepliesAction(i));
  }, [comment._id, comment, replies]);

  const handleReplyAction = async (replyId, action) => {
    try {
      const response = await toggleLikeDislike("c", replyId, action);
      if (response.message === `Comment ${action}d`) {
        setReplyActions((prev) => ({
          ...prev,
          [replyId]: {
            ...prev[replyId],
            likes:
              action === "like"
                ? prev[replyId]?.likes + 1
                : prev[replyId]?.userAction === "like"
                ? Math.max(0, prev[replyId]?.likes - 1)
                : prev[replyId]?.likes,
            dislikes:
              action === "dislike"
                ? prev[replyId]?.dislikes + 1
                : prev[replyId]?.userAction === "dislike"
                ? Math.max(0, prev[replyId]?.dislikes - 1)
                : prev[replyId]?.dislikes,
            userAction: action,
          },
        }));
      } else {
        setReplyActions((prev) => ({
          ...prev,
          [replyId]: {
            ...prev[replyId],
            [action === "like" ? "likes" : "dislikes"]: Math.max(
              0,
              prev[replyId][action === "like" ? "likes" : "dislikes"] - 1
            ),
            userAction: "",
          },
        }));
      }
    } catch (error) {
      console.error(`Error ${action}ing the reply:`, error);
    }
  };

  const toggleReplies = async () => {
    if (showReplies[comment._id]) {
      setShowReplies((prev) => ({ ...prev, [comment._id]: false }));
    } else {
      try {
        const response = await onSubmitAxios("get", `comments/replies/${comment._id}`);
        setReplies(response?.data?.data.replies || []);
        const newOwnerReply = {};
        response?.data?.data.replies.forEach((i) => {
          newOwnerReply[i._id] = i.owner._id === _id;
        });
        setOwnerReply(newOwnerReply);
        setShowReplies((prev) => ({ ...prev, [comment._id]: true }));
      } catch (error) {
        console.error("Error fetching replies:", error);
      }
    }
  };

  const handleReplySubmit = async (username) => {
    if (!replyContent.trim()) return;
    try {
      const response = await onSubmitAxios(
        "post",
        `comments/replies/${typeId}/${comment._id}`,
        { content: replyContent, username: username, type }
      );
      const addedReply = response?.data?.data;
      addedReply["owner"] = { _id, username: stateUsername, avatar: stateAvatar };
      setReplies((prev) => [...prev, addedReply]);
      if (!showReplies[comment._id]) toggleReplies();
      setReplyContent("");
      setShowReplyInput(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const manipulateComment = async (commentId, newContent = null, commentType = "comment") => {
    try {
      setVisible(true);
      setLoad(true);
      
      if (newContent) {
        await onSubmitAxios("patch", `comments/c/${commentId}`, { content: newContent });
      } else {
        await onSubmitAxios("delete", `comments/c/${commentId}`);
      }
      
      setLoad(false);
      setMessage("success");
      
      if (newContent === null) {
        if (commentType === "comment") {
          setComment((prev) => prev.filter((i) => i._id !== commentId));
        } else {
          setReplies((prev) => prev.filter((i) => i._id !== commentId));
        }
      } else {
        if (commentType === "comment") {
          setComment((prevComments) =>
            prevComments.map((c) =>
              c._id === commentId ? { ...c, content: newContent } : c
            )
          );
        } else {
          setReplies((prevReplies) =>
            prevReplies.map((r) =>
              r._id === commentId ? { ...r, content: newContent } : r
            )
          );
        }
      }
    } catch (error) {
      setLoad(false);
      setMessage("error");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/50 transition-all">
      {visible && (
        <Notifier
          type={message}
          message={message === "error" ? "Error in updation" : "Update successful!"}
          loading={load}
          setV={setVisible}
        />
      )}

      {/* Comment Header */}
      <div className="flex gap-3 mb-3">
        <Avatar avatar={comment.userDetails?.avatar} id={comment.userDetails?._id} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white">
              @{comment.userDetails?.username || "Anonymous"}
            </p>
            <span className="text-gray-500 text-xs">•</span>
            <p className="text-sm text-gray-400">
              {dayjs(comment.createdAt).fromNow()}
            </p>
          </div>
        </div>
      </div>

      {/* Comment Content */}
      <p className="text-gray-200 mb-4 leading-relaxed ml-14">{comment.content}</p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 ml-14">
        <button
          onClick={() =>
            handleLike("c", comment._id, "Comment", setDislikes, setLikes, setUserAction, userAction)
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${
            userAction === "like"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <FaThumbsUp className="text-xs" />
          <span>{likes}</span>
        </button>

        <button
          onClick={() =>
            handleDislike("c", comment._id, "Comment", setDislikes, setLikes, setUserAction, userAction)
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${
            userAction === "dislike"
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <FaThumbsDown className="text-xs" />
          <span>{dislikes}</span>
        </button>

        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all hover:scale-105"
        >
          <FaReply className="text-xs" />
          <span>Reply</span>
        </button>

        {ownerComment && (
          <>
            <button
              onClick={() => {
                setEditPanel(!editPanel);
                setEditableContent(comment.content);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all hover:scale-105"
            >
              <FaEdit className="text-xs" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => manipulateComment(comment._id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all hover:scale-105"
            >
              <FaTrash className="text-xs" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      {/* Edit Comment Panel */}
      {editPanel && (
        <div className="mt-4 ml-14 animate-slide-down">
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Edit Comment</h4>
              <button
                onClick={() => setEditPanel(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 resize-none"
              rows="3"
            />
            <button
              onClick={() => {
                manipulateComment(comment._id, editableContent);
                setEditableContent("");
                setEditPanel(false);
              }}
              className="mt-3 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Reply Input */}
      {showReplyInput && (
        <div className="mt-4 ml-14 animate-slide-down">
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
              placeholder={`Replying to @${comment.userDetails?.username}...`}
              rows="3"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleReplySubmit(comment.userDetails.username)}
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
              >
                Reply
              </button>
              <button
                onClick={() => setShowReplyInput(false)}
                className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reply Panel */}
      {replyEditPanel && (
        <div className="mt-4 ml-14 animate-slide-down">
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Edit Reply</h4>
              <button
                onClick={() => setReplyEditPanel(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 resize-none"
              rows="3"
            />
            <button
              onClick={() => {
                manipulateComment(replyIdEdition, editableContent, "reply");
                setEditableContent("");
                setReplyEditPanel(false);
              }}
              className="mt-3 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Replies Section */}
      {(comment?.replies.length > 0 || replies.length > 0) && (
        <div className="mt-4 ml-14">
          <button
            onClick={toggleReplies}
            className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showReplies[comment._id] ? (
              <>
                <FaChevronUp className="text-xs" />
                <span>Hide Replies</span>
              </>
            ) : (
              <>
                <FaChevronDown className="text-xs" />
                <span>
                  Show {comment.replies.length < replies.length ? replies.length : comment.replies.length} {(comment.replies.length < replies.length ? replies.length : comment.replies.length) === 1 ? "Reply" : "Replies"}
                </span>
              </>
            )}
          </button>

          {showReplies[comment._id] && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-700">
              {replies?.map((reply) => (
                <div key={reply._id} className="bg-gray-800/30 rounded-lg p-4">
                  <div className="flex gap-3 mb-2">
                    <Avatar avatar={reply.owner?.avatar} id={reply.owner?._id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white text-sm">
                          @{reply.owner?.username}
                        </p>
                        <span className="text-gray-500 text-xs">•</span>
                        <p className="text-xs text-gray-400">
                          {dayjs(reply.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-200 text-sm mb-3 ml-11">{reply.content}</p>

                  <div className="flex flex-wrap items-center gap-2 ml-11">
                    <button
                      onClick={() => handleReplyAction(reply._id, "like")}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                        replyActions[reply._id]?.userAction === "like"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <FaThumbsUp className="text-[10px]" />
                      <span>{replyActions[reply._id]?.likes || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReplyAction(reply._id, "dislike")}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                        replyActions[reply._id]?.userAction === "dislike"
                          ? "bg-red-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <FaThumbsDown className="text-[10px]" />
                      <span>{replyActions[reply._id]?.dislikes || 0}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowReplyInput(true);
                        setReplyContent(`@${reply.owner?.username} `);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                    >
                      <FaReply className="text-[10px]" />
                      <span>Reply</span>
                    </button>

                    {ownerReply[reply._id] && (
                      <>
                        <button
                          onClick={() => {
                            setReplyEditPanel(true);
                            setReplyIdEdition(reply._id);
                            setEditableContent(reply.content);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                        >
                          <FaEdit className="text-[10px]" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => manipulateComment(reply._id, null, "reply")}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          <FaTrash className="text-[10px]" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      
    </div>
  );
}

export default Comment;