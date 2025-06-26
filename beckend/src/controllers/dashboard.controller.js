import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const stats = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(channelId) },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
            },
        },
        {
            $addFields: {
                totalSubscribers: { $size: "$subscribers" },
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" }
            },
        },
        {
            $project: {
                totalSubscribers: 1,
                totalVideos: 1,
                totalViews: 1
            },
        },
    ]);

    if (!stats.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json(
        new ApiResponse(200, stats[0], "Channel stats fetched successfully")
    );
});


const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videos = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId) },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: skip,
        },
        {
            $limit: parseInt(limit),
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $unwind: "$ownerDetails",
        },
        {
            $project: {
                title: 1,
                description: 1,
                views: 1,
                likesCount: 1,
                createdAt: 1,
                "ownerDetails.username": 1,
                "ownerDetails.avatar": 1,
            },
        },
    ]);

    const totalVideos = await Video.countDocuments({ owner: channelId });
    const totalPages = Math.ceil(totalVideos / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            totalVideos,
            totalPages,
            currentPage: parseInt(page),
        }, "Channel videos fetched successfully")
    );
});

export {
    getChannelStats, 
    getChannelVideos
    }