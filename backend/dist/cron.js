"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronService = void 0;
// @ts-ignore
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("./logger");
const dotenv_1 = __importDefault(require("dotenv"));
const processor_1 = require("./processor");
const openAiClient_1 = require("./openAiClient");
const Book_1 = __importDefault(require("./schema/Book"));
const Content_1 = __importDefault(require("./schema/Content"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const prompt_1 = require("./prompt");
dotenv_1.default.config();
/**
 * CronService class to manage scheduled tasks
 */
class CronService {
    constructor() {
        this.scheduledTask = null;
    }
    startCronJob() {
        try {
            this.scheduledTask = node_cron_1.default.schedule(process.env.CRON_EXPRESSION, async () => {
                const startTime = new Date();
                logger_1.logger.info(`Cron job started at ${startTime.toISOString()}`);
                try {
                    // Perform your task here
                    await this.executeTask();
                    const endTime = new Date();
                    const executionTime = (endTime.getTime() - startTime.getTime()) / 1000;
                    logger_1.logger.info(`Cron job completed at ${endTime.toISOString()} (took ${executionTime.toFixed(2)}s)`);
                }
                catch (error) {
                    logger_1.logger.error("Error executing cron job task:", error);
                }
            }, {
                scheduled: true,
                timezone: "UTC", // You can specify your preferred timezone
            });
            logger_1.logger.info("Cron job has been scheduled");
        }
        catch (error) {
            logger_1.logger.error("Failed to start cron job:", error);
            throw error;
        }
    }
    async executeTask() {
        // Replace this with your actual task logic
        logger_1.logger.info("Executing scheduled task...");
        try {
            const MIN_REELS = 20;
            const PROCESS_LIMIT = 4000;
            const PADDING = 20;
            const books = await Book_1.default.find({ active: true });
            for (const book of books) {
                const reel = await Content_1.default.findOne({ bookId: book._id, watchedCount: 0 }).countDocuments();
                if (reel > MIN_REELS) {
                    continue;
                }
                const filePath = path_1.default.join(__dirname, "./uploads", book.book);
                if (fs_1.default.existsSync(filePath) === false) {
                    console.error(`File not found: ${filePath}`);
                    continue;
                }
                const text = await (0, processor_1.processEpub)(filePath);
                const previousGeneratedLength = book.generatedLength;
                const updatedGeneratedLength = Math.min(previousGeneratedLength + PROCESS_LIMIT, text.length);
                const result = await (0, openAiClient_1.getOpenAIResult)((0, prompt_1.getReelContentSystemPrompt)(), text.substring(Math.max(0, previousGeneratedLength - PADDING), Math.min(updatedGeneratedLength + PADDING, text.length)));
                try {
                    const parsedContent = JSON.parse(result.toString());
                    await Content_1.default.insertMany(parsedContent.map((content) => ({
                        content,
                        bookId: book._id,
                    })));
                    await book.updateOne({ generatedLength: updatedGeneratedLength });
                }
                catch (error) {
                    console.error("Error parsing OpenAI result:", error);
                    continue;
                }
            }
        }
        catch (error) {
            console.error("Error processing reels:", error);
        }
        logger_1.logger.info("Task execution completed successfully");
    }
    /**
     * Stop the running cron job
     */
    stopCronJob() {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            this.scheduledTask = null;
            logger_1.logger.info("Cron job has been stopped");
        }
    }
}
// Create and export an instance of the service
exports.cronService = new CronService();
// Example usage
if (require.main === module) {
    // This block will only run if this file is executed directly (not imported)
    (async function () {
        await mongoose_1.default.connect(process.env.MONGO_URI || "");
        exports.cronService.startCronJob();
    })();
    // Handle application shutdown gracefully
    process.on("SIGINT", () => {
        logger_1.logger.info("Application is shutting down...");
        exports.cronService.stopCronJob();
        process.exit(0);
    });
    process.on("SIGTERM", () => {
        logger_1.logger.info("Application is terminating...");
        exports.cronService.stopCronJob();
        process.exit(0);
    });
    logger_1.logger.info("Cron service has started. Press Ctrl+C to stop.");
}
