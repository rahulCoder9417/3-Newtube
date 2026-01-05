import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Photo } from "../models/photo.model.js";
import { deleteImageFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { deleteRelatedData } from "../utils/comment_like_delete.js";
const postPhoto = asyncHandler(async (req, res) => {
    const { title, description, url, morePhoto } = req.body; 
    const ownerId = req.user._id; 
    
    if (!url) {
        console.log("❌ [PHOTO UPLOAD] Missing photo URL");
        throw new ApiError(400, "At least one photo URL is required");
    }
    if (!title || !description) {
        console.log("❌ [PHOTO UPLOAD] Missing title or description");
        throw new ApiError(400, "Title and description are required");
    }

    let additionalPhotos = [];
    if (morePhoto) {
        if (typeof morePhoto === 'string') {
            try {
                // Try parsing as JSON array first
                additionalPhotos = JSON.parse(morePhoto);
            } catch {
                // If not JSON, split by comma
                additionalPhotos = morePhoto.split(',').map(p => p.trim()).filter(Boolean);
            }
        } else if (Array.isArray(morePhoto)) {
            additionalPhotos = morePhoto;
        }
    }

    const photo = await Photo.create({
        url: url, 
        title,
        description,
        morePhoto: additionalPhotos,
        owner: ownerId,
    });

    res.status(201).json(new ApiResponse(201, photo, "Photos uploaded successfully"));
});
const deletePhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const photo = await Photo.findById(id);
    if (!photo) {
        throw new ApiError(404, "Photo not found");
    }

    
    if (!photo.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorized to delete this photo");
    }
    deleteImageFromCloudinary(photo.url)
    deleteRelatedData("photo",id)
    await Photo.deleteOne({ _id: id });

    res.status(200).json(new ApiResponse(200, null, "Photo deleted successfully"));
});

const updatePhoto = asyncHandler(async (req, res) => {
    const { id } = req.params; // Extract photo ID from the route parameter
    const { title, description } = req.body; // Extract updated fields from the request body

    if (!title && !description) {
        throw new ApiError(400, "At least one field (title or description) must be provided for update");
    }
    console.log(id)
    const updatedPhoto = await Photo.findByIdAndUpdate(
        id, 
        {
            ...(title && { title }), 
            ...(description && { description }),
        },
        { new: true }
    );

    // Check if photo exists
    if (!updatedPhoto) {
        throw new ApiError(404, "Photo not found");
    }

    // Respond with success
    res.status(200).json(new ApiResponse(200, updatedPhoto, "Photo updated successfully"));
});

const getPaginatedPhotos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, userId } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, parseInt(limit, 10));

    const pipeline = [];

    if (userId) {
        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) },
        });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
        },
    });

    pipeline.push({
        $unwind: {
            path: "$ownerDetails",
            preserveNullAndEmptyArrays: true,
        },
    });

    pipeline.push({
        $project: {
            _id: 1,
            url: 1,
            title: 1,
            description: 1,
            morePhoto: 1,
            createdAt: 1,
            updatedAt: 1,
            "ownerDetails._id": 1,
            "ownerDetails.fullName": 1,
            "ownerDetails.avatar": 1,
        },
    });

    const aggregateQuery = Photo.aggregate(pipeline);

    const options = {
        page: currentPage,
        limit: pageLimit,
    };

    const paginatedPhotos = await Photo.aggregatePaginate(aggregateQuery, options);

    res.status(200).json(
        new ApiResponse(200, paginatedPhotos, "Paginated photos fetched successfully")
    );
});


export {
    postPhoto,
    deletePhoto,
    getPaginatedPhotos,
    updatePhoto
}