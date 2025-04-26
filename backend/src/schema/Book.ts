import mongoose from "mongoose";

const { Schema } = mongoose;

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
const Book = mongoose.model("Book", BookSchema);

export default Book;
