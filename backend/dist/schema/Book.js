"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const BookSchema = new Schema({
    active: {
        type: Boolean,
        default: true, // defaults to true
    },
    book: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    generatedLength: {
        default: 0, // default length
        type: Number,
        required: true, // length till which the reel is generated (in seconds, characters, or whatever unit you define)
    },
});
// Export the model
const Book = mongoose_1.default.model("Book", BookSchema);
exports.default = Book;
