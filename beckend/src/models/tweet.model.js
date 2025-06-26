import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["parent", "retweet"], // Type can either be 'parent' or 'retweet'
      default: "parent", // Default type is 'parent'
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tweet", // Reference to child retweets
      },
    ],
    photo: {
      type: String, // URL to the photo (can be null)
      default: null,
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
