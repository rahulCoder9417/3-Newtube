import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { action } = req.body;

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        if (existingLike.action === action) {
            await Like.deleteOne({ _id: existingLike._id });
            return res.status(200).json(new ApiResponse(200, null, `Video already ${action}d`));
        }
        await Like.deleteOne({ _id: existingLike._id });
    }

    const newLike = new Like({
        video: videoId,
        likedBy: req.user._id,
        action: action,
    });

    await newLike.save();
    return res.status(200).json(new ApiResponse(200, newLike, `Video ${action}d`));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { action } = req.body;

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingLike) {
        if (existingLike.action === action) {
            await Like.deleteOne({ _id: existingLike._id });
            return res.status(200).json(new ApiResponse(200, null, `Comment already ${action}d`));
        }
        await Like.deleteOne({ _id: existingLike._id });
    }

    const newLike = new Like({
        comment: commentId,
        likedBy: req.user._id,
        action: action,
    });

    await newLike.save();
    return res.status(200).json(new ApiResponse(200, newLike, `Comment ${action}d`));
});

const togglePhotoLike = asyncHandler(async (req, res) => {
    const { photoId } = req.params;
    const { action } = req.body;

    const existingLike = await Like.findOne({
        photo: photoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        if (existingLike.action === action) {
            await Like.deleteOne({ _id: existingLike._id });
            return res.status(200).json(new ApiResponse(200, null, `Photo already ${action}d`));
        }
        await Like.deleteOne({ _id: existingLike._id });
    }

    const newLike = new Like({
        photo: photoId,
        likedBy: req.user._id,
        action: action,
    });

    await newLike.save();
    return res.status(200).json(new ApiResponse(200, newLike, `Photo ${action}d`));
});
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { action } = req.body;

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        if (existingLike.action === action) {
            await Like.deleteOne({ _id: existingLike._id });
            return res.status(200).json(new ApiResponse(200, null, `Tweet already ${action}d`));
        }
        await Like.deleteOne({ _id: existingLike._id });
    }

    const newLike = new Like({
        tweet: tweetId,
        likedBy: req.user._id,
        action: action,
    });

    await newLike.save();
    return res.status(200).json(new ApiResponse(200, newLike, `Tweet ${action}d`));
});

const calculatePhotoLikesDislikes = asyncHandler(async (req, res) => {
    const { photoId } = req.params;
    
    const likesCount = await Like.countDocuments({ photo: photoId, action: "like" });
    const dislikesCount = await Like.countDocuments({ photo: photoId, action: "dislike" });

    return res.status(200).json(new ApiResponse(200, { likes: likesCount, dislikes: dislikesCount }, "Likes and dislikes for photo calculated"));
});
const calculateVideoLikesDislikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const likesCount = await Like.countDocuments({ video: videoId, action: "like" });
    const dislikesCount = await Like.countDocuments({ video: videoId, action: "dislike" });

    return res.status(200).json(new ApiResponse(200, { likes: likesCount, dislikes: dislikesCount }, "Likes and dislikes for video calculated"));
});

const calculateCommentLikesDislikes = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const likesCount = await Like.countDocuments({ comment: commentId, action: "like" });
    const dislikesCount = await Like.countDocuments({ comment: commentId, action: "dislike" });

    return res.status(200).json(new ApiResponse(200, { likes: likesCount, dislikes: dislikesCount }, "Likes and dislikes for comment calculated"));
});

const calculateTweetLikesDislikes = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const likesCount = await Like.countDocuments({ tweet: tweetId, action: "like" });
    const dislikesCount = await Like.countDocuments({ tweet: tweetId, action: "dislike" });

    return res.status(200).json(new ApiResponse(200, { likes: likesCount, dislikes: dislikesCount }, "Likes and dislikes for tweet calculated"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.aggregate([
        {
            $match: { 
                likedBy: new mongoose.Types.ObjectId(userId), 
                video: { $ne: null } 
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails" 
        },
        {
            $project: {
                _id: 0, 
                videoDetails: 1 
            }
        }
    ]);

    if (!likedVideos || likedVideos.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No liked videos found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos.map(v => v.videoDetails), "Liked videos fetched successfully"));
});

const isLikedOrDisliked = asyncHandler(async (req, res) => {
    const { type, id } = req.params; // type: "video", "photo", "comment", etc.
    const userId = req.user._id;

    const likedDocument = await Like.findOne({
        likedBy: userId,
        [type]: id, // Dynamically match the type field (e.g., video, photo, etc.)
    });

    if (likedDocument) {
        return res.status(200).json(
            new ApiResponse(200, 
                { 
                    action: likedDocument.action 
                },
                `${type.charAt(0).toUpperCase() + type.slice(1)} has been ${likedDocument.action}d by the user`
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(200, 
            { isLiked: false, isDisliked: false },
            `no`
        )
    );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    calculateVideoLikesDislikes,
    calculateCommentLikesDislikes,
    calculateTweetLikesDislikes,
    getLikedVideos,
    calculatePhotoLikesDislikes,
    togglePhotoLike,
    isLikedOrDisliked
};
