// models/UserContentSeen.js

import mongoose from "mongoose";

const { Schema } = mongoose;

const UserContentSeenSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User", // assuming you have a User model
            required: true,
        },
        contentId: {
            type: Schema.Types.ObjectId,
            ref: "Content", // the content (reel, post, etc.)
            required: true,
        },
        watchedAt: {
            type: Date,
            default: Date.now, // when the user watched it
        },
    },
    {
        timestamps: true, // automatically adds createdAt and updatedAt fields
    }
);

// 🚀 Ensure that each (userId, contentId) pair is unique
UserContentSeenSchema.index({ userId: 1, contentId: 1 }, { unique: true });

const UserContentSeen = mongoose.model("UserContentSeen", UserContentSeenSchema);

export default UserContentSeen;
