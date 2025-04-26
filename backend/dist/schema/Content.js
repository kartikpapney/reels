"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const ContentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    watchedAt: {
        type: Date,
        default: Date.now, // defaults to current time
    },
    watchedCount: {
        type: Number,
        default: 0, // start from 0
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: "Book", // assuming you have a 'Book' model
        required: true,
    },
});
// Export the model
const Content = mongoose_1.default.model("Content", ContentSchema);
exports.default = Content;
