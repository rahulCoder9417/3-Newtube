import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { deleteLikes } from "../utils/comment_like_delete.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { Id } = req.params;
    const { page = 1, limit = 10, type } = req.query;

    if (!mongoose.Types.ObjectId.isValid(Id)) {
        throw new ApiError(400, "Invalid ID");
    }

    if (!["video", "photo"].includes(type)) {
        throw new ApiError(400, "Invalid type. Allowed types are 'video' or 'photo'");
    }

   
    const matchStage = {
        $match: {
            [type]: new mongoose.Types.ObjectId(Id),
        },
        
    };
    const aggregateQuery = Comment.aggregate([
        matchStage,
       { $match: {
            type: "comment",
        }},
        {
            $lookup: {
                from: "users", 
                localField: "owner",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        {
            $unwind: "$userDetails", 
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                replies:1,
                updatedAt: 1,
                "userDetails.fullName": 1,
                "userDetails.username": 1,
                "userDetails.avatar": 1,
                "userDetails._id": 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ]);

   
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

   
    const result = await Comment.aggregatePaginate(aggregateQuery, options);

    return res.status(200).json(
        new ApiResponse(200, {
            comments: result.docs,
            totalComments: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
        }, "Comments fetched successfully")
    );
});

const getReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(commentId) }
        },
        {
            $lookup: {
                from: 'comments',
                localField: 'replies',
                foreignField: '_id',
                as: 'replies'
            }
        },
        {
            $unwind: {
                path: '$replies',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'users', 
                localField: 'replies.owner',
                foreignField: '_id',
                as: 'replies.owner'
            }
        },
        {
            $unwind: {
                path: '$replies.owner',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                replies: {
                    $push: {
                        content: '$replies.content',
                        _id: '$replies._id',
                        createdAt: '$replies.createdAt',
                        owner: {
                            avatar: '$replies.owner.avatar',
                            username: '$replies.owner.username',
                            _id: '$replies.owner._id'
                        }
                    }
                },
                content: { $first: '$content' },
                createdAt: { $first: '$createdAt' }
            }
        },
        {
            $project: {
                _id: 1, // Exclude the comment ID if not needed
                content: 1,
                createdAt: 1,
                replies: 1
            }
        }
    ]);

    // Handle case where comment is not found
    if (comment.length === 0) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, comment[0], "Replies fetched successfully")
    );
});


const addComment = asyncHandler(async (req, res) => {
    const { Id } = req.params;
    const { content,type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(Id)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required");
    }
    let comment;
    if (type==="video") {
        comment = await Comment.create({
            video: Id,
            owner: req.user._id,
            content,
        });
    } 
       else  {comment = await Comment.create({
            photo: Id,
            owner: req.user._id,
            content,
        });}
    
    

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );
});

const addReply = asyncHandler(async (req, res) => {
    const { Id,commentId } = req.params;  
    const { content, username, type } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Reply content is required");
    }

    const replyContent = `@${username}: ${content}`;

    let reply;
    if (type==="video") {
        reply = await Comment.create({
            video: Id,
            owner: req.user._id,
            content: replyContent,
            parentId: commentId,
            type: 'reply'
        });
    } 
       else  {reply = await Comment.create({
            photo: Id,
            owner: req.user._id,
            content: replyContent,
            parentId: commentId,
            type: 'reply'
        });}

    
    await Comment.findByIdAndUpdate(commentId, {
        $push: { replies: reply._id }, 
    });

    return res.status(201).json(
        new ApiResponse(201, reply, "Reply added successfully")
    );
});


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },
        { content },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id,
    });

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    await deleteLikes("comment", commentId);

    if (deletedComment.replies && deletedComment.replies.length > 0) {
        const replyIds = deletedComment.replies;

        for (const replyId of replyIds) {
            await deleteLikes("comment", replyId); 
        }

        await Comment.deleteMany({ _id: { $in: replyIds } });
    }

    if (deletedComment.parentId) {
        await Comment.findByIdAndUpdate(
            deletedComment.parentId, 
            { $pull: { replies: commentId } }, 
            { new: true } 
        );
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Comment and its replies deleted successfully")
    );
});



export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment,
     addReply,
     getReplies
    }
