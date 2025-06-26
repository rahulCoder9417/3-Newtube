import mongoose, {Schema} from "mongoose";


const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    photo: {
        type: Schema.Types.ObjectId,
        ref: "Photo"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    action: {
        type: String
        
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)