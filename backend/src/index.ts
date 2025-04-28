import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose, { Schema } from "mongoose";
import passport from "passport";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import cookieParser from "cookie-parser";
import Book from "./schema/Book";
import Content from "./schema/Content";
import User from "./schema/User";
import UserContentSeen from "./schema/UserContentSeen";

dotenv.config();

// Create a logger helper function
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data) : '');
  },
  error: (message: string, error: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  debug: (message: string, data?: any) => {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data) : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data) : '');
  }
};

const app = express();
const port = process.env.PORT || 3001;

// Log environment variables (sanitized)
logger.debug('Environment', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: port,
  MONGO_URI: process.env.MONGO_URI ? '****' : 'not set',
  FRONTEND_URL: process.env.FRONTEND_URL,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  HAS_GOOGLE_CREDENTIALS: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
});

// Step 3: Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => {
        mongoose.model("Book", Book.schema);
        logger.info("MongoDB connected successfully!");
    })
    .catch((err) => {
        logger.error("MongoDB connection error:", err);
        // Log more details about the connection attempt
        logger.debug("MongoDB connection details", {
          uri: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) + '...' : 'not set',
          options: mongoose.connection.config
        });
    });

// Log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Request received: ${req.method} ${req.url}`, {
    headers: req.headers,
    query: req.query,
    ip: req.ip,
  });
  
  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    logger.debug(`Response sent: ${res.statusCode}`, {
      path: req.url,
      method: req.method,
      responseSize: body ? body.length : 0
    });
    return originalSend.call(this, body);
  };
  
  next();
});

// Step 4: Set up middleware
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: [process.env.FRONTEND_URL ?? ""],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    exposedHeaders: ["Location"],
};

logger.debug('CORS configuration', corsOptions);

app.use(cors(corsOptions));

const sessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
    },
};

logger.debug('Session configuration', {
    ...sessionOptions,
    secret: sessionOptions.secret ? '****' : 'not set',
    cookie: {
        ...sessionOptions.cookie,
        secure: sessionOptions.cookie.secure
    }
});

app.use(session(sessionOptions));

// Step 5: Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Step 6: Configure Passport with Google Strategy
const googleStrategyConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ["profile", "email"],
};

logger.debug('Google Strategy configuration', {
    ...googleStrategyConfig,
    clientID: googleStrategyConfig.clientID ? '****' : 'not set',
    clientSecret: googleStrategyConfig.clientSecret ? '****' : 'not set',
});

passport.use(
    new GoogleStrategy(
        googleStrategyConfig,
        async (accessToken, refreshToken, profile, done) => {
            try {
                logger.debug('Google auth callback received', { 
                  profileId: profile.id,
                  email: profile.emails?.[0]?.value,
                  displayName: profile.displayName
                });
                
                // Check if user already exists in database
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    logger.info(`Creating new user with Google ID: ${profile.id}`);
                    // Create new user if doesn't exist
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails?.[0]?.value,
                        displayName: profile.displayName,
                        firstName: profile.name?.givenName,
                        lastName: profile.name?.familyName,
                        profilePicture: profile.photos?.[0]?.value,
                    });
                    logger.info(`New user created: ${user._id}`);
                } else {
                    logger.info(`User found with Google ID: ${profile.id}`);
                }

                return done(null, user);
            } catch (error) {
                logger.error(`Error in Google auth callback:`, error);
                return done(error as Error);
            }
        }
    )
);

// Step 7: Serialize and Deserialize User
passport.serializeUser((user: any, done) => {
    logger.debug(`Serializing user: ${user.id}`);
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        logger.debug(`Deserializing user: ${id}`);
        const user = await User.findById(id);
        if (!user) {
            logger.warn(`User not found during deserialization: ${id}`);
        }
        done(null, user);
    } catch (error) {
        logger.error(`Error deserializing user: ${id}`, error);
        done(error);
    }
});

// Step 8: Authentication Routes
app.get("/reels/auth/google", (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Starting Google auth flow`);
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get(
    "/reels/auth/google/callback",
    (req: Request, res: Response, next: NextFunction) => {
        logger.info(`Google auth callback received`);
        passport.authenticate("google", {
            failureRedirect: `${process.env.FRONTEND_URL}/login`,
            successRedirect: `${process.env.FRONTEND_URL}/reels`,
        })(req, res, next);
    }
);

app.get("/reels/auth/logout", (req: Request, res: Response) => {
    logger.info(`Logout request received: ${req.user ? `User ID: ${(req.user as any)._id}` : 'No user'}`);
    req.logout((err) => {
        if (err) {
            logger.error("Error during logout:", err);
            return res.status(500).json({ error: "Logout failed" });
        }
        
        logger.info(`User successfully logged out`);
        res.status(200).json({ success: true, message: "Logged out successfully" });
    });
});

// Step 9: User info endpoint
app.get("/reels/api/user", (req: Request, res: Response) => {
    logger.debug(`User info request: Authenticated: ${req.isAuthenticated()}`);
    if (req.isAuthenticated()) {
        logger.debug(`Returning user info for: ${(req.user as any)._id}`);
        return res.status(200).json(req.user);
    }
    logger.warn(`Unauthenticated user info request`);
    return res.status(401).json({ error: "Not authenticated" });
});

// Step 10: Authentication middleware for protected routes
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        logger.debug(`Authenticated request: ${(req.user as any)._id}`);
        return next();
    }
    logger.warn(`Unauthenticated request to protected route: ${req.originalUrl}`);
    res.status(401).json({ error: "Authentication required" });
};

// Error handling middleware
interface CustomError extends Error {
    status?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error handling request: ${req.method} ${req.url}`, {
        error: err.message,
        stack: err.stack,
        status: err.status || 500
    });
    
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
    logger.debug(`Health check request received`);
    const healthData = {
        status: "ok", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongoConnection: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    };
    
    res.status(200).json(healthData);
});

// Protected reels endpoint
app.get("/reels", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = new mongoose.Types.ObjectId(req.user._id);
        logger.debug(`Fetching reels for user: ${userId}`);
        
        const seenContentDocs = await UserContentSeen.find({ userId }).select("contentId");
        const seenContentIds = seenContentDocs.map((doc) => doc.contentId);
        logger.debug(`User has seen ${seenContentIds.length} content items`);

        const content = await Content.find({
            _id: { $nin: seenContentIds },
        })
            .sort({ watchedAt: 1 })
            .limit(10);

        logger.debug(`Found ${content.length} unseen reels for user`);

        if (!content || content.length === 0) {
            logger.info(`No unseen reels found for user: ${userId}`);
            return res.status(404).json({
                message: "No reels found",
            });
        }

        return res.status(200).json({
            count: content.length,
            reels: content,
        });
    } catch (error) {
        logger.error("Error fetching reels:", error);
        next(error);
    }
});

// Protected reels endpoint
app.put("/reels/:contentId/seen", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const contentId = new mongoose.Types.ObjectId(req.params.contentId);
        logger.debug(`Marking content as seen: ${contentId} by user: ${userId}`);

        if (!contentId) {
            logger.warn(`Missing contentId in request`);
            return res.status(400).json({ message: "Content ID is required" });
        }

        const result = await Promise.all([
            UserContentSeen.updateOne(
                { userId, contentId },
                { $setOnInsert: { userId, contentId, watchedAt: new Date() } },
                { upsert: true }
            ),
            Content.updateOne({ _id: contentId }, { $inc: { watchedCount: 1 } }),
        ]);

        logger.debug(`Content marked as seen:`, { 
          userContentResult: result[0], 
          contentUpdateResult: result[1] 
        });

        return res.status(200).json({ message: "Content marked as seen" });
    } catch (error) {
        logger.error("Error marking content as seen:", error);
        next(error);
    }
});

app.get("/reels/book", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
      logger.debug(`Fetching active books`);
      const books = await Book.find({ active: true }).lean();
      logger.debug(`Found ${books.length} active books`);

      return res.status(200).json({ books });
  } catch (error) {
      logger.error("Error fetching books:", error);
      next(error);
  }
});

app.listen(port, () => {
    logger.info(`Server started and running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
    logger.debug(`Server configuration:`, {
        mongoConnection: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        sessionSecret: process.env.SESSION_SECRET ? "configured" : "using default",
        corsOrigin: process.env.FRONTEND_URL || "not set"
    });
});

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});