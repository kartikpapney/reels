"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const Content_1 = __importDefault(require("./schema/Content"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
mongoose_1.default
    .connect(process.env.MONGO_URI || "")
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("MongoDB connection error:", err));
// Middleware
app.use(express_1.default.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || "Internal Server Error",
            status,
        },
    });
});
// Health check endpoint
app.get("/reels/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/reels", async (req, res, next) => {
    try {
        const minWatchedCountDoc = await Content_1.default.findOne().sort({ watchedCount: 1 }).limit(1);
        if (!minWatchedCountDoc) {
            return res.status(404).json({ message: "No reels found" });
        }
        const minWatchedCount = minWatchedCountDoc.watchedCount;
        // Get up to 5 random reels with watchedCount <= min+2
        const content = await Content_1.default.aggregate([
            { $match: { watchedCount: { $lte: minWatchedCount + 2 } } },
            { $sample: { size: 10 } },
        ]);
        if (!content || content.length === 0) {
            return res.status(404).json({
                message: "No reels found",
            });
        }
        const reelIds = content.map((content) => content._id);
        await Content_1.default.updateMany({ _id: { $in: reelIds } }, { $inc: { watchedCount: 1 } });
        const updatedReels = await Content_1.default.find({ _id: { $in: reelIds } })
            .populate("bookId", "name")
            .lean();
        return res.status(200).json({
            count: updatedReels.length,
            reels: updatedReels,
        });
    }
    catch (error) {
        console.error("Error fetching reels:", error);
        next(error);
    }
});
app.listen(port, () => {
    dotenv_1.default.config();
    console.log(`PDF processing server running on port ${port}`);
});
