import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";


const deleteLikes = async (type,id) => {
    try {
    
        if (type === 'video') {
            await Like.deleteMany({ video: id });
        } else if (type === 'comment') {
            await Like.deleteMany({ comment: id });
        } else if (type === 'photo') {
            await Like.deleteMany({ photo: id });
        } else if (type === 'tweet') {
            await Like.deleteMany({ tweet: id });
        } else {
            throw new ApiError(400, "Invalid type provided for deletion");
        }
        

    } catch (err) {
        throw new ApiError(500, "Error while deleting related likes", err);
    }
};

const deleteRelatedData = async (type, Id) => {
    try {
        const comments = await Comment.find({ [type]: Id }).populate('replies'); 
        for (const comment of comments) {
            await deleteLikes("comment", comment._id);
            if (comment.replies && comment.replies.length > 0) {
                for (const reply of comment.replies) {
                    await deleteLikes("comment", reply._id);

                    await Comment.findByIdAndDelete(reply._id);
                }
            }
        }

        await Comment.deleteMany({ [type]: Id });

        await deleteLikes(type, Id);
    } catch (err) {
        throw new ApiError(500, "Error while deleting related data", err);
    }
};

export { deleteRelatedData ,deleteLikes};
