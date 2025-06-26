import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const photoSchema = new Schema(
    {
        url: {
            type: String, 
            required: true,
        },
        title: {
            type: String, 
            required: true,
        },
        description: {
            type: String, 
            required: true,
        },
        morePhoto: {
            type: [String],
            default:[]
        },
        
        views: {
            type: Number,
            default: 0
        },
        owner: {
            type: Schema.Types.ObjectId, 
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true, 
    }
);

photoSchema.plugin(aggregatePaginate); // Add pagination functionality to the model

export const Photo = mongoose.model("Photo", photoSchema);
