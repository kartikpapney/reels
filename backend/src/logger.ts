// logger.ts
import winston from "winston";

// Configure the Winston logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: "cron-service" },
    transports: [
        // Write all logs with level 'info' and below to the console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, ...metadata }) => {
                    let msg = `${timestamp} [${level}]: ${message}`;
                    if (Object.keys(metadata).length > 0 && metadata.service === "cron-service") {
                        msg += JSON.stringify(metadata, null, 2);
                    }
                    return msg;
                })
            ),
        }),
        // Write all logs with level 'info' and below to cron-service.log
        new winston.transports.File({
            filename: "logs/cron-service.log",
            maxsize: 10485760, // 10MB
            maxFiles: 5, // Keep 5 files
            tailable: true,
        }),
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 10485760, // 10MB
            maxFiles: 5, // Keep 5 files
        }),
    ],
});

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

export { logger, stream };
