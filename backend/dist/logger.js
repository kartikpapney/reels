"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = void 0;
// logger.ts
const winston_1 = __importDefault(require("winston"));
// Configure the Winston logger
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    defaultMeta: { service: "cron-service" },
    transports: [
        // Write all logs with level 'info' and below to the console
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp, ...metadata }) => {
                let msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(metadata).length > 0 && metadata.service === "cron-service") {
                    msg += JSON.stringify(metadata, null, 2);
                }
                return msg;
            })),
        }),
        // Write all logs with level 'info' and below to cron-service.log
        new winston_1.default.transports.File({
            filename: "logs/cron-service.log",
            maxsize: 10485760, // 10MB
            maxFiles: 5, // Keep 5 files
            tailable: true,
        }),
        // Write all logs with level 'error' and below to error.log
        new winston_1.default.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 10485760, // 10MB
            maxFiles: 5, // Keep 5 files
        }),
    ],
});
exports.logger = logger;
// Create a stream object with a 'write' function that will be used by morgan
const stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};
exports.stream = stream;
