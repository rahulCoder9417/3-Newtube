import { onSubmitAxios } from "./axios";

export const toggleLikeDislike = async (type, id, action) => {
  try {
    const response = await onSubmitAxios("post", `likes/toggle/${type}/${id}`, {
      action,
    });
    return response?.data;
  } catch (error) {
    console.error(`Error toggling ${action} for ${type}:`, error);
    throw error;
  }
};


export const handleLike = async (typeS,id,typeL,setDislikes,setLikes,setAction,action) => {
  try {
    const response = await toggleLikeDislike(typeS, id, "like");
    if (response.message !== `${typeL} already liked`) {
      if (action === "dislike") setDislikes((prev) => Math.max(0, prev - 1));
      setLikes((prev) => prev + 1);
      setAction("like");
    } else {
      setLikes((prev) => Math.max(0, prev - 1));
      setAction("");
    }
  } catch (error) {
    console.error(`Error liking the ${typeL}:`, error);
  }
};

export const handleDislike = async (typeS,id,typeL,setDislikes,setLikes,setAction,action) => {
  try {
    const response = await toggleLikeDislike(typeS, id, "dislike");
    if (response.message !== `${typeL} already disliked`) {
      if (action === "like") setLikes((prev) => Math.max(0, prev - 1));
      setDislikes((prev) => prev + 1);
      setAction("dislike");
    } else {
      setDislikes((prev) => Math.max(0, prev - 1));
      setAction("");
    }
  } catch (error) {
    console.error(`Error disliking the ${typeL}:`, error);
  }
}

export const likeInfo = async (typeS,id,typeL,setDislikes,setLikes,setAction) => {
  const response = await onSubmitAxios("get", `likes/get/${typeS}/${id}`);
      setDislikes(response.data.data.dislikes);
      setLikes(response.data.data.likes);
      const isLiked = await onSubmitAxios("get", `likes/isLiked/${typeL.toLowerCase()}/${id}`);
      if (isLiked.data.message !== "no") {
        setAction(isLiked.data.data.action);
      }
}
