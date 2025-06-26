import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { useSelector } from "react-redux";
import { onSubmitAxios } from "../../utils/axios";
import {
  handleDislike,
  handleLike,
  likeInfo,
  toggleLikeDislike,
} from "../../utils/likeDislike";
import Avatar from "./Avatar";
import Notifier from "./Notifier";

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
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border text-black border-gray-300 rounded mb-2"
          placeholder="Add your comment..."
        />
        <button
          onClick={handleAddComment}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Comment
        </button>
      </div>

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
          <p>No comments yet. Be the first to comment!</p>
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
  const [replIdEdition, setReplIdEdition] = useState(0);
  const [replyPanel, setReplyPanel] = useState(false);
  const [editableContnent, setEditableContnent] = useState("");
  const [ownerComment, setOwnerComment] = useState(false);
  const [owwnerReply, setOwwnerReply] = useState({});
  const stateUsername = useSelector((state) => state.auth.username);
  const _id = useSelector((state) => state.auth.id);
  const stateAvatar = useSelector((state) => state.auth.avatar);
  useEffect(() => {
    comment["userDetails"]._id === _id
      ? setOwnerComment(true)
      : setOwnerComment(false);
    likeInfo("c", comment._id, "Comment", setDislikes, setLikes, setUserAction);
    const fetchRepliesAction = async (reply) => {
      try {
        const likesResponse = await onSubmitAxios(
          "get",
          `likes/get/c/${reply}`
        );
        const actionResponse = await onSubmitAxios(
          "get",
          `likes/isLiked/comment/${reply}`
        );
        setReplyActions((prev) => ({
          ...prev,
          [reply]: {
            likes: likesResponse?.data?.data.likes || 0,
            dislikes: likesResponse?.data?.data.dislikes || 0,
            userAction: actionResponse?.data?.data.action || "",
          },
        }));
      } catch (error) {
        console.log("error while getting rlikes for replies", error);
      }
    };
    comment.replies.map((i) => fetchRepliesAction(i));
  }, [comment._id, comment,replies]);

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
                : null,
            dislikes:
              action === "dislike"
                ? prev[replyId]?.dislikes + 1
                : prev[replyId]?.userAction === "dislike"
                ? Math.max(0, prev[replyId]?.dislikes - 1)
                : null,
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
            userAction: "", // Reset user action if it's removed
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
        const response = await onSubmitAxios(
          "get",
          `comments/replies/${comment._id}`
        );
        setReplies(response?.data?.data.replies || []);
        const newOwnerReply = {};
        response?.data?.data.replies.forEach((i) => {
          newOwnerReply[i._id] = i.owner._id === _id;
        });
        setOwwnerReply(newOwnerReply)
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
        {
          content: replyContent,
          username: username,
          type,
        }
      );
      const addedReply = response?.data?.data;
      addedReply["owner"] = {
        _id,
        username: stateUsername,
        avatar: stateAvatar,
      };
      setReplies((prev) => [...prev, addedReply]);
      !showReplies[comment._id] ? toggleReplies() : null;
      setReplyContent("");
      setShowReplyInput(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const theReply = (username) => {
    setShowReplyInput(!showReplyInput);
    handleReplySubmit(username);
    setReplyContent("");
  };

  const maniPulateComment = async (
    commentId,
    newContent = null,
    type = "comment"
  ) => {
    try {
      setVisible(true);
      setLoad(true);
      newContent
        ? await onSubmitAxios("patch", `comments/c/${commentId}`, {
            content: newContent,
          })
        : await onSubmitAxios("delete", `comments/c/${commentId}`);
      setLoad(false);
      setMessage("success");
      if (newContent === null) {
        type === "comment"
          ? setComment((prev) => prev.filter((i) => i._id !== commentId))
          : setReplies((prev) => prev.filter((i) => i._id !== commentId));
      } else {
        type === "comment"
          ? setComment((prevComments) =>
              prevComments.map((comment) =>
                comment._id === commentId
                  ? { ...comment, content: newContent }
                  : comment
              )
            )
          : setReplies((prevComments) =>
              prevComments.map((comment) =>
                comment._id === commentId
                  ? { ...comment, content: newContent }
                  : comment
              )
            );
      }
    } catch (error) {
      setLoad(false);
      setMessage("error");
    }
  };
  return (
    <div className="border-b pb-4">
      {visible && (
        <Notifier
          type={message}
          message={
            message === "error" ? "Error in updation" : "Updation Success"
          }
          loading={load}
          setV={setVisible}
        />
      )}
      <div className="flex gap-3">
        <Avatar
          avatar={comment.userDetails?.avatar}
          id={comment.userDetails?._id}
        />
        <p className="mt-2 font-semibold text-xl">
          @{comment.userDetails?.username || "Anonymous"}
        </p>
      </div>
      <p className="font-medium text-lg">{comment.content}</p>
      <p className="text-sm text-gray-500">
        {new Date(comment.createdAt).toLocaleString()}
      </p>

      <div className="flex gap-4 mt-2">
        <button
          onClick={() =>
            handleLike(
              "c",
              comment._id,
              "Comment",
              setDislikes,
              setLikes,
              setUserAction,
              userAction
            )
          }
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            userAction === "like"
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
              "c",
              comment._id,
              "Comment",
              setDislikes,
              setLikes,
              setUserAction,
              userAction
            )
          }
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            userAction === "dislike"
              ? "bg-red-600 text-white"
              : "bg-gray-300 text-black hover:bg-red-500"
          }`}
        >
          <FaThumbsDown />
          {dislikes}
        </button>
      </div>

      <div className="mt-4 ">
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="text-blue-500 hover:underline"
        >
          Reply
        </button>
        {ownerComment && (
          <>
            <button
              onClick={() => setEditPanel(!editPanel)}
              className="mt-2 text-green-500  px-2 m-2 rounded"
            >
              Edit
            </button>
            {editPanel && (
              <div className="mt-2">
                <input
                  type="text"
                  value={editableContnent}
                  onChange={(e) => setEditableContnent(e.target.value)}
                  className="w-full p-2 border border-gray-300 text-black rounded"
                  placeholder="Write your content..."
                />
                <button
                  onClick={() => {
                    maniPulateComment(comment._id, editableContnent);
                    setEditableContnent("");
                    setEditPanel(!editPanel);
                  }}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Submit Edition
                </button>
              </div>
            )}

            <button
              onClick={() => maniPulateComment(comment._id)}
              className="mt-2 text-red-500  m-2 rounded"
            >
              Delete
            </button>
          </>
        )}
        {showReplyInput && (
          <div className="mt-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-2 border border-gray-300 text-black rounded"
              placeholder="Write your reply..."
            />
            <button
              onClick={() => handleReplySubmit(comment.userDetails.username)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Submit Reply
            </button>
          </div>
        )}
        {replyPanel && (
          <div className="mt-2">
            <input
              type="text"
              value={editableContnent}
              onChange={(e) => setEditableContnent(e.target.value)}
              className="w-full p-2 border border-green-300 text-black rounded"
              placeholder="Write your content..."
            />
            <button
              onClick={() => {
                maniPulateComment(replIdEdition, editableContnent, "reply");
                setEditableContnent("");
                setReplyPanel(!setReplyPanel);
              }}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              Submit Edition
            </button>
          </div>
        )}

        {/* here arew replies */}

        {(comment?.replies.length > 0 || replies.length > 0) && (
          <>
            <button
              onClick={toggleReplies}
              className="mt-2 ml-2 text-sm text-gray-100"
            >
              {showReplies[comment._id]
                ? "Hide Replies"
                : `Show Replies (${
                    comment.replies.length < replies.length
                      ? replies.length
                      : comment.replies.length
                  })`}
            </button>
            {showReplies[comment._id] && (
              <div className="mt-4 bg-gray-800 pl-6 space-y-4">
                {replies?.map((reply, index) => (
                  <div key={reply._id || index} className="border-b py-2">
                    <div className="flex gap-3">
                      <Avatar
                        avatar={reply.owner?.avatar}
                        id={reply.owner?._id}
                      />
                      <p className="font-bold mt-2">@{reply.owner?.username}</p>
                    </div>
                    <p>{reply.content}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(reply.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleReplyAction(reply._id, "like")}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${
                          replyActions[reply._id]?.userAction === "like"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-black hover:bg-blue-500"
                        }`}
                      >
                        <FaThumbsUp />
                        {replyActions[reply._id]?.likes || 0}
                      </button>
                      <button
                        onClick={() => handleReplyAction(reply._id, "dislike")}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${
                          replyActions[reply._id]?.userAction === "dislike"
                            ? "bg-red-600 text-white"
                            : "bg-gray-300 text-black hover:bg-red-500"
                        }`}
                      >
                        <FaThumbsDown />
                        {replyActions[reply._id]?.dislikes || 0}
                      </button>
                      <button onClick={() => theReply(reply.owner?.username)}>
                        Reply
                      </button>
                     {owwnerReply[reply._id] && (<> <button
                        onClick={() => {
                          setReplyPanel(!replyPanel),
                            setReplIdEdition(reply._id);
                        }}
                        className="mt-2 text-green-500  px-2 m-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          maniPulateComment(reply._id, null, "reply")
                        }
                        className="mt-2 text-red-500  m-2 rounded"
                      >
                        Delete
                      </button></>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Comment;
