import express, { Request, Response, NextFunction } from "express";

import dotenv from "dotenv";
import mongoose from "mongoose";
import Content from "./schema/Content";
import Book from "./schema/Book";


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;


mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());

// Error handling middleware
interface CustomError extends Error {
    status?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
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
app.get("/reels/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/reels", async (req: Request, res: Response, next: NextFunction) => {
    try {

        const minWatchedCountDoc = await Content.findOne().sort({ watchedCount: 1 }).limit(1);

        if (!minWatchedCountDoc) {
            return res.status(404).json({ message: "No reels found" });
        }

        const minWatchedCount = minWatchedCountDoc.watchedCount;

        // Get up to 5 random reels with watchedCount <= min+2
        const content = await Content.aggregate([
            { $match: { watchedCount: { $lte: minWatchedCount + 2 } } },
            { $sample: { size: 10 } },
        ]);

        if (!content || content.length === 0) {
            return res.status(404).json({
                message: "No reels found",
            });
        }

        const reelIds = content.map((content) => content._id);
        await Content.updateMany({ _id: { $in: reelIds } }, { $inc: { watchedCount: 1 } });

        const updatedReels = await Content.find ({ _id: { $in: reelIds } })
            .populate("bookId", "name")
            .lean();

        return res.status(200).json({
            count: updatedReels.length,
            reels: updatedReels,
        });
    } catch (error) {
        console.error("Error fetching reels:", error);
        next(error);
    }
});

app.listen(port, () => {
    dotenv.config();
    console.log(`PDF processing server running on port ${port}`);
});
