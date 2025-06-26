import mongoose from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params 
    const userId = req.user._id

    if (!userId || !channelId) {
        throw new ApiError(400, "User ID and Channel ID are required");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        await Subscription.deleteOne({
            subscriber: userId,
            channel: channelId,
        });

        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        const newSubscription = new Subscription({
            subscriber: userId,
            channel: channelId,
        });

        await newSubscription.save();
        return res.status(200).json(new ApiResponse(200, null, "Subscribed successfully"));
    }
});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.aggregate([
        {
            $match : {
                channel :  new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users", 
                localField: "subscriber",  
                foreignField: "_id", 
                as: "subscriberDetails"  
            }  
        },
        {
            $unwind: "$subscriberDetails" 
        },
        {
            $project: {
                "subscriberDetails._id": 1,  
                "subscriberDetails.fullName": 1, 
                "subscriberDetails.username": 1, 
                "subscriberDetails.avatar": 1  
            }
        }
    ])

    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscribers found for this channel");
    }

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.aggregate([
        {
            $match : {
                subscriber :  new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users", 
                localField: "subscriber",  
                foreignField: "_id", 
                as: "subscriberToDetails"  
            }  
        },
        {
            $unwind: "$subscriberToDetails" 
        },
        {
            $project: {
                "subscriberToDetails._id": 1,  
                "subscriberToDetails.fullName": 1, 
                "subscriberToDetails.username": 1, 
                "subscriberToDetails.avatar": 1  
            }
        }
    ])

    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscribers he subscribed found for this channel");
    }

    return res.status(200).json(
        new ApiResponse(200, subscribers, "SubscribersTo fetched successfully")
    );
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}