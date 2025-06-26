import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteImageFromCloudinary} from "../utils/cloudinary.js"
import { deleteRelatedData } from "../utils/comment_like_delete.js"
const getRandomData = asyncHandler(async (req, res) => {
    const { sample } = req.params;
  
    try {
      const count = await Video.countDocuments({ videoType: "long" });
      const randomIndex = Math.floor(Math.random() * count);
  
      const randomData = await Video.find({ videoType: "long" })
        .skip(randomIndex)
        .limit(sample); // Adjust `sample` to get the number of documents you need
  
      return res.status(200).json(
        new ApiResponse(200, randomData, "random fetched successfully")
      );
    } catch (error) {
      console.error("Error fetching random data:", error);
      res.status(500).json({ message: "Error fetching random data" });
    }
  });
  

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', type = "long", userId, tags } = req.query;

    const pipeline = [];

    // Match videos by userId if provided
    if (userId) {
        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) },
        });
    }

    // Match videos by tags if provided
    if (tags) {
        pipeline.push({
            $match: { tags: tags },
        });
    }

    // Match videos by type
    pipeline.push({
        $match: { videoType: type },
    });

    // Sort the results
    const sortOrder = order === 'desc' ? -1 : 1;
    pipeline.push({
        $sort: { [sortBy]: sortOrder },
    });

    // Pagination options
    const options = {
        page: Number(page),
        limit: Number(limit),
    };

    // Execute the aggregatePaginate query
    const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    // Respond with the results
    return res.status(200).json({
        success: true,
        data: result.docs,
        meta: {
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page,
            limit: result.limit,
        },
    });
});


const incrementViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const user = await User.findById(userId).select("watchHistory");
    const isInWatchHistory = user.watchHistory.includes(videoId);

    if (!isInWatchHistory) {
        user.watchHistory.push(videoId);
        const video = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { views: 1 } },
            { new: true } 
        );

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        
        await user.save();
    }

    return res.status(200).json(new ApiResponse(200, null, "View count updated"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description,tags,duration,videoType} = req.body // tags will come in string like this a.b.c 
    if (
        [title,description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields of video are required")
    }
    const tagsarray = tags?.trim() ? tags.split('.') : []
    const videoFileLocal = req.files?.videoFile[0]?.path;
    const thumbnailLocal = req.files?.thumbnail[0]?.path;
    
    if (!videoFileLocal && !thumbnailLocal) {
        throw new ApiError(400, "Video and thumbnail file is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocal)
    const thumbnail = await uploadOnCloudinary(thumbnailLocal)
    const userId = req.user._id;

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail?.url || "",
        title, 
        description,
        duration ,
        videoType,
        tags : tagsarray,
        owner : userId
    })

    const createdVideo = await Video.findById(video._id).select(
        "-videoFile -thumbnail  "
    )

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while registering the Video")
    }

    return res.status(201).json(
        new ApiResponse(200, createdVideo, "video registered Successfully")
    )

} )

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
        .select("-isPublished -updatedAt")
        .populate({
            path: "owner", // The field to populate
            select: "fullName avatar _id " // Specify the fields to include from the User model
        });

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description,tags} = req.body
    const tagsarray = tags?.trim() ? tags.split('.') : []
    const thumbnailLocal = req.file?.path;
    let query =  {
        
        title:title,
        description,
        tags:tagsarray
    }
    
    
    if (thumbnailLocal) {
        const tumbnail = await uploadOnCloudinary(thumbnailLocal)
     
        query.thumbnail= tumbnail?.url || ""
    }
    
 
    try {
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: 
                    query
                
            },
            {new: false, 
                 }
                ).select("thumbnail")
            
            const oldthumb = video?.thumbnail;
            
            if (thumbnailLocal) {
                await deleteImageFromCloudinary(oldthumb); 
            }
        return res
        .status(200)
        .json(new ApiResponse(200, video, "video details updated successfully"))
        
    } catch (error) {
        throw new ApiError(400,`error during updating video ${error}`)
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        await deleteRelatedData("video",videoId)
        const video = await Video.findByIdAndDelete(videoId)
        const thumbnail = video.thumbnail
        const videoFile = video.videoFile

        await deleteImageFromCloudinary(thumbnail)
        await deleteImageFromCloudinary(videoFile,"video")


        return res
        .status(200)
        .json(new ApiResponse(200, null, "video details delted successfully"))
        
    } catch (error) {
        throw new ApiError(400,`error during deleting video ${error}`)
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findByIdAndUpdate(
            videoId,
            [
                { 
                    $set: { isPublished: { $not: ["$isPublished"] } } 
                }
            ],
            { new: true })
            .select("-thumbnail -videoFile")
            
        return res
        .status(200)
        .json(new ApiResponse(200, video, "video details toggled successfully"))
        
    } catch (error) {
        throw new ApiError(400,`error during toggling status video ${error}`)
    }
})
const getVideosByType = asyncHandler(async (req, res) => {
    const { type } = req.params; console.log(type)
    const { userId } = req.body || {}; 
    if (!["short", "long"].includes(type)) {
        throw new ApiError(400, "Invalid video type"); 
    }
    
    const query = { videoType: type }; 

    if (userId) {
        
        query.owner = userId; 
    }

    const videos = await Video.find(query);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, `Videos of type ${type} fetched successfully`));
});




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViews,
    getVideosByType,
    getRandomData
}
