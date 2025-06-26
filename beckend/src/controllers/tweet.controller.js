import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { deleteLikes } from "../utils/comment_like_delete.js"
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
const createTweet = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { data, type, parentTweetId } = req.body; 
    const photo = req.file?.path;
    let photoUrl = null;

    if (photo) {
        photoUrl = await uploadOnCloudinary(photo);
    }

    try {
        if (type === "retweet" && !parentTweetId) {
            throw new ApiError(400, "Parent tweet ID is required for retweets");
        }

        // Create the new tweet
        const tweet = await Tweet.create({
            content: data,
            owner: userId,
            type: type || "parent",
            parentTweetId: parentTweetId || null, // Only set if retweet
            photo: photoUrl?.url || null, // Set the photo if provided
        });

        // If this is a retweet, associate it with its parent tweet
        if (type === "retweet") {
            const parentTweet = await Tweet.findById(parentTweetId);
            if (!parentTweet) {
                throw new ApiError(404, "Parent tweet not found");
            }

            // Add this retweet to the parent tweet's children
            parentTweet.children.push(tweet._id);
            await parentTweet.save();
        }

        // Populate the owner field with required details
        const populatedTweet = await tweet.populate({
            path: "owner",
            select: "_id fullName username avatar", // Select specific fields
        })

        return res
            .status(201)
            .json(
                new ApiResponse(200, populatedTweet, "Tweet registered successfully")
            );
    } catch (error) {
        throw new ApiError(400, error, "Something went wrong creating the tweet");
    }
});


const getTweetChildren = asyncHandler(async (req, res) => {
const { tweetId } = req.params; // Get tweetId from params

try {
    // Find the tweet by ID and populate the 'children' and 'owner' fields
    const tweet = await Tweet.findById(tweetId)
        .populate({
            path: "children", // Populate children (retweets)
            populate: { // Populate the 'owner' of each child tweet with 'avatar', 'fullname', and 'username'
                path: "owner",
                select: "avatar fullName username _id"
            }
        });

    // If the tweet doesn't exist
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Return the children (retweets) of the tweet along with their owner's details
    return res.status(200).json(
        new ApiResponse(200, tweet.children, "Retweets fetched successfully")
    );
} catch (error) {
    throw new ApiError(400, "Something went wrong fetching retweets", error);
}
});  
const getTweetById = asyncHandler(async (req, res) => {
    const { id } = req.params; 
    try {
       
        const tweets = await Tweet.findById(id).populate("owner", "avatar _id fullName username");

        if (tweets) {

            return res.status(200).json(
                new ApiResponse(200, tweets, "Tweets fetched successfully")
            );
        } else {
            return res.status(404).json(
                new ApiResponse(404, null, "No tweets found")
            );
        }
    } catch (error) {
        throw new ApiError(400, "Something went wrong fetching tweets", error);
    }
});
const getPaginatedTweets = asyncHandler(async (req, res) => {
    const { type, userId, page = 1, limit = 10 } = req.query; // Accept 'type', 'userId', 'page', 'limit' as query parameters

    try {
        const skip = (page - 1) * limit;

        // Filter criteria
        const filter = {
            type: type || "parent", // Default to "parent" if no type is provided
        };

        // Aggregation pipeline
        const pipe = [
            { $match: filter }, // Apply the filter for type
            {
                $lookup: {
                    from: "users", // Assuming your user model is in the 'users' collection
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner" // Join the owner field with user details
                }
            },
            { $unwind: "$owner" }, // Unwind the owner array
            { $sort: { createdAt: -1 } }, // Sort by creation date, descending
            { $skip: skip }, // Skip the appropriate number of tweets based on page and limit
            { $limit: parseInt(limit) }, // Limit the results to the provided 'limit'
            {
                $project: { // Project specific fields
                    content: 1,
                    owner: { avatar: 1, fullName: 1, username: 1, _id: 1 },
                    type: 1,
                    photo: 1,
                    createdAt: 1
                }
            }
        ];

        // Dynamic match for userId
        if (userId) {
            pipe.splice(1, 0, { $match: { owner: mongoose.Types.ObjectId(userId) } }); // Insert $match for userId after the initial $match
        }

        const tweets = await Tweet.aggregate(pipe);

        if (tweets.length > 0) {
            return res.status(200).json(
                new ApiResponse(200, tweets, "Tweets fetched successfully")
            );
        } else {
            return res.status(404).json(
                new ApiResponse(404, null, "No tweets found")
            );
        }
    } catch (error) {
        throw new ApiError(400, "Something went wrong fetching tweets", error);
    }
});


             

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own tweets");
    }

    tweet.content = content || tweet.content;
    await tweet.save();

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own tweets");
    }
    await deleteLikes("tweet",tweetId)
    await Tweet.deleteOne({ _id: tweetId });

    return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
});


export {
    createTweet,
    getPaginatedTweets,
    updateTweet,
    deleteTweet,
    getTweetChildren,
    getTweetById
}
