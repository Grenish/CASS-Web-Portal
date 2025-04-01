import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    
}));

// console.log("ENV TEST - CLOUDINARY API KEY:", process.env.CLOUDINARY_API_KEY || "Not Loaded");


app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true,limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import adminRouters from  "../src/routes/admin.routes.js";
import eventsRouters from '../src/routes/event.routes.js';
import facultyRouters from '../src/routes/faculty.routes.js';
import galleryRouters from '../src/routes/gallery.routes.js';
import feedbackRouters from '../src/routes/feedback.routes.js';
import newsletterRouters from '../src/routes/newsletter.routes.js';


app.use('/api/v1/admin', adminRouters);
app.use('/api/v1/Events', eventsRouters);
app.use('/api/v1/Faculty', facultyRouters);
app.use('/api/v1/Gallery', galleryRouters);
app.use('/api/v1/Feedback', feedbackRouters);
app.use('/api/v1/Newsletter', newsletterRouters);

export  {app }