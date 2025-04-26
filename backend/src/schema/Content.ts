import mongoose from "mongoose";

const { Schema } = mongoose;

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
const Content = mongoose.model("Content", ContentSchema);

export default Content;
