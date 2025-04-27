// schema/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    googleId: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(), 
        },
        googleId: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        displayName: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        profilePicture: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>("User", UserSchema);
