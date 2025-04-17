import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import cookieParser from 'cookie-parser';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN.split(',');

app.use(helmet()); // Security middleware to set various HTTP headers
// Middleware to enforce HTTPS
app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https" && process.env.NODE_ENV === "production") {
        if (req.method === "GET" || req.method === "HEAD") {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        } else {
            return res.status(405).send("HTTPS is required for this request.");
        }
    }
    next();
});

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.options('*', cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import adminRouters from "../src/routes/admin.routes.js";
import eventsRouters from '../src/routes/event.routes.js';
import facultyRouters from '../src/routes/faculty.routes.js';
import galleryRouters from '../src/routes/gallery.routes.js';
import feedbackRouters from '../src/routes/feedback.routes.js';
import newsletterRouters from '../src/routes/newsletter.routes.js';
import registerRouters from '../src/routes/register.routes.js';

app.use('/api/v1/admin', adminRouters);
app.use('/api/v1/Events', eventsRouters);
app.use('/api/v1/Faculty', facultyRouters);
app.use('/api/v1/Gallery', galleryRouters);
app.use('/api/v1/Feedback', feedbackRouters);
app.use('/api/v1/Newsletter', newsletterRouters);
app.use('/api/v1/Register', registerRouters);

export { app };