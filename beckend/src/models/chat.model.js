import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const messageSchema = new Schema(
  {
    message: {
      type: String, 
      default:{}
    },
    timestamp: {
      type: Date, 
      default: Date.now,  
    },
  },
  { _id: false } 
);


const contentSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId, 
      ref: "User"
    },
    messages: {
      type: Map, 
      of: messageSchema, 
    },
  },
  { _id: false } 
);


const chatSchema = new Schema(
  {
    admin:[{
        type: Schema.Types.ObjectId, 
        ref: "User",
        
      }],
    participants: [
      {
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true,
      },
    ],
    content: {
      type: [contentSchema], 
      
      default:{}
    },
  },
  {
    timestamps: true, 
}
);


chatSchema.plugin(mongooseAggregatePaginate);

export const Chat = mongoose.model("Chat", chatSchema);
