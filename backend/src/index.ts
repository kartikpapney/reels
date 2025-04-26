import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import Content from "./schema/Content";
import { processEpub } from "./processor";
import { getOpenAIResult } from "./openAiClient";
import Book from "./schema/Book";
import { getReelContentSystemPrompt } from "./prompt";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const MIN_REELS = 20;
const PROCESS_LIMIT = 4000;
const PADDING = 20;

async function continueProcessingReels() {
    try {
        const books = await Book.find();

        for (const book of books) {
            const reel = await Content.findOne({ bookId: book._id, watchedCount: 0 }).countDocuments();
            if (reel > MIN_REELS) {
                continue;
            }

            const filePath = path.join(__dirname, "./uploads", book.book);
            if (fs.existsSync(filePath) === false) {
                console.error(`File not found: ${filePath}`);
                continue;
            }
            const text = await processEpub(filePath);
            const previousGeneratedLength = book.generatedLength;
            const updatedGeneratedLength = Math.min(previousGeneratedLength + PROCESS_LIMIT, text.length);

            const result = await getOpenAIResult(
                getReelContentSystemPrompt(),
                text.substring(Math.max(0, previousGeneratedLength - PADDING), Math.min(updatedGeneratedLength + PADDING, text.length))
            );
            try {
                const parsedContent = JSON.parse(result.toString());
                await Content.insertMany(
                    parsedContent.map((content: string) => ({
                        content,
                        bookId: book._id,
                    }))
                );
                await book.updateOne({ generatedLength: updatedGeneratedLength });
            } catch (error) {
                console.error("Error parsing OpenAI result:", error);
                continue;
            }
        }
    } catch (error) {
        console.error("Error processing reels:", error);
    }
}

mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
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
app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api", async (req: Request, res: Response, next: NextFunction) => {
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
