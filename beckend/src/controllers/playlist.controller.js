import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    try {
        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user._id
        })
        return res
        .status(201)
        .json(new ApiResponse(201, playlist, "plalist registered Successfully")
        )
    } catch (error) {
        throw new ApiError(400,error,"Something went wrong for creating playlist")
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    console.log(userId)
    try {
        const playlist = await Playlist.find({
            owner: userId
        })
        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "plalist displayed Successfully")
        )
    } catch (error) {
        throw new ApiError(400,error,"Something went wrong for displaying playlist")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    try {
        // Fetch playlist and populate related fields in one go
        const playlist = await Playlist.findById(playlistId)
            .populate({
                path: 'owner', // Populate 'owner' field
                select: 'avatar fullName', // Only select these fields from the owner
            })
            .populate({
                path: 'videos', // Populate 'videos' field
                select: 'title thumbnail duration views createdAt owner _id', // Select specific fields from videos
                populate: {
                    path: 'owner', // Populate 'owner' inside each video
                    select: 'avatar fullName', // Only select these fields from the owner of the video
                },
            });

        if (!playlist) {
            throw new ApiError(404, null, "Playlist not found");
        }

        return res.status(200).json(
            new ApiResponse(200, playlist, "Playlist displayed successfully")
        );
    } catch (error) {
        throw new ApiError(400, error, "Something went wrong while displaying the playlist");
    }
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    try {
        const playlist = await Playlist.updateOne(
            { _id: new mongoose.Types.ObjectId(playlistId) }, 
            { $addToSet: { videos: new mongoose.Types.ObjectId(videoId) } }  
        );

        if (playlist.nModified === 0) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found or video already exists in the playlist"));
        }

        return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
    } catch (error) {
        throw new ApiError(400, error, "Something went wrong while updating the playlist");
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    try {
        const playlist = await Playlist.updateOne(
            { _id: new mongoose.Types.ObjectId(playlistId) },
            { $pull: { videos: new mongoose.Types.ObjectId(videoId) } }
        );

        if (playlist.nModified === 0) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found or video not found in the playlist"));
        }

        return res.status(200).json(new ApiResponse(200, null, "Video removed from playlist successfully"));
    } catch (error) {
        throw new ApiError(400, error, "Something went wrong while removing the video from the playlist");
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    try {

        const playlist = await Playlist.deleteOne({
            _id: new mongoose.Types.ObjectId(playlistId),
        });

        if (playlist.deletedCount === 0) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found"));
        }

        return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
    } catch (error) {
        throw new ApiError(400, error, "Something went wrong while deleting the playlist and comments");
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
        throw new ApiError(400,"no name or desc given")
    }
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;  
    try {
        const updatedPlaylist = await Playlist.updateOne(
            { _id: new mongoose.Types.ObjectId(playlistId) }, 
            {
                $set: updateFields
            }
        );
      
        if (updatedPlaylist.nModified === 0) {
            return res.status(404).json(new ApiResponse(404, null, "Playlist not found or no changes made"));
        }

        return res.status(200).json(new ApiResponse(200, null, "Playlist updated successfully"));
    } catch (error) {
        throw new ApiError(400, error, "Something went wrong while updating the playlist");
    }
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
