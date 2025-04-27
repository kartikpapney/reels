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

const app = express();
const port = process.env.PORT || 3001;

// Step 3: Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => {
        mongoose.model("Book", Book.schema);
        console.log("MongoDB connected!");
    })
    .catch((err) => console.error("MongoDB connection error:", err));

// Step 4: Set up middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true, // This is critical - it enables the 'Access-Control-Allow-Credentials' header
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            secure: process.env.NODE_ENV === "production",
        },
    })
);

// Step 5: Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Step 6: Configure Passport with Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists in database
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // Create new user if doesn't exist
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails?.[0]?.value,
                        displayName: profile.displayName,
                        firstName: profile.name?.givenName,
                        lastName: profile.name?.familyName,
                        profilePicture: profile.photos?.[0]?.value,
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

// Step 7: Serialize and Deserialize User
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Step 8: Authentication Routes
app.get("/reels/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
    "/reels/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        successRedirect: `${process.env.FRONTEND_URL}/reels`,
    })
);

app.get("/reels/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).json({ error: "Logout failed" });
        }
        res.redirect(`${process.env.FRONTEND_URL ?? ""}`);
    });
});

// Step 9: User info endpoint
app.get("/reels/api/user", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        return res.status(200).json(req.user);
    }
    return res.status(401).json({ error: "Not authenticated" });
});

// Step 10: Authentication middleware for protected routes
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Authentication required" });
};

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

// Protected reels endpoint
app.get("/reels", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const seenContentDocs = await UserContentSeen.find({ userId }).select("contentId");
        const seenContentIds = seenContentDocs.map((doc) => doc.contentId);

        const content = await Content.find({
            _id: { $nin: seenContentIds },
        })
            .sort({ watchedAt: 1 })
            .limit(10);

        if (!content || content.length === 0) {
            return res.status(404).json({
                message: "No reels found",
            });
        }

        return res.status(200).json({
            count: content.length,
            reels: content,
        });
    } catch (error) {
        console.error("Error fetching reels:", error);
        next(error);
    }
});

// Protected reels endpoint
app.put("/reels/:contentId/seen", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        const userId = new mongoose.Types.ObjectId(req.user._id); // Assuming you're using authentication middleware
        const contentId = new mongoose.Types.ObjectId(req.params.contentId);

        if (!contentId) {
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

        return res.status(200).json({ message: "Content marked as seen" });
    } catch (error) {
        console.error("Error fetching reels:", error);
        next(error);
    }
});

app.get("/reels/book", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
      const books = await Book.find({ active: true }).lean();

      return res.status(200).json({ books });
  } catch (error) {
      console.error("Error fetching reels:", error);
      next(error);
  }
});

app.listen(port, () => {
    dotenv.config();
    console.log(`Server running on port ${port}`);
});
