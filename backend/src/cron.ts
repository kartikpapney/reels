// @ts-ignore
import cron from "node-cron";
import { logger } from "./logger";
import dotenv from "dotenv";
import { processEpub } from "./processor";
import { getOpenAIResult } from "./openAiClient";
import Book from "./schema/Book";
import Content from "./schema/Content";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { getReelContentSystemPrompt } from "./prompt";

dotenv.config();

/**
 * CronService class to manage scheduled tasks
 */
class CronService {
    private scheduledTask: cron.ScheduledTask | null = null;

    public startCronJob(): void {
        try {
            this.scheduledTask = cron.schedule(
                process.env.CRON_EXPRESSION,
                async () => {
                    const startTime = new Date();
                    logger.info(`Cron job started at ${startTime.toISOString()}`);

                    try {
                        // Perform your task here
                        await this.executeTask();

                        const endTime = new Date();
                        const executionTime = (endTime.getTime() - startTime.getTime()) / 1000;
                        logger.info(`Cron job completed at ${endTime.toISOString()} (took ${executionTime.toFixed(2)}s)`);
                    } catch (error) {
                        logger.error("Error executing cron job task:", error);
                    }
                },
                {
                    scheduled: true,
                    timezone: "UTC", // You can specify your preferred timezone
                }
            );

            logger.info("Cron job has been scheduled");
        } catch (error) {
            logger.error("Failed to start cron job:", error);
            throw error;
        }
    }

    private async executeTask(): Promise<void> {
        // Replace this with your actual task logic
        logger.info("Executing scheduled task...");

        try {
            const MIN_REELS = 20;
            const PROCESS_LIMIT = 4000;
            const PADDING = 20;

            const books = await Book.find({ active: true });

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

        logger.info("Task execution completed successfully");
    }

    /**
     * Stop the running cron job
     */
    public stopCronJob(): void {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            this.scheduledTask = null;
            logger.info("Cron job has been stopped");
        }
    }
}

// Create and export an instance of the service
export const cronService = new CronService();

// Example usage
if (require.main === module) {
    // This block will only run if this file is executed directly (not imported)

    (async function () {
        await mongoose.connect(process.env.MONGO_URI || "");
        cronService.startCronJob();
    })();

    // Handle application shutdown gracefully
    process.on("SIGINT", () => {
        logger.info("Application is shutting down...");
        cronService.stopCronJob();
        process.exit(0);
    });

    process.on("SIGTERM", () => {
        logger.info("Application is terminating...");
        cronService.stopCronJob();
        process.exit(0);
    });

    logger.info("Cron service has started. Press Ctrl+C to stop.");
}
