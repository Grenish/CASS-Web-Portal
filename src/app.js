import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import eventsRouters from '../src/routes/event.routes.js';

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

app.use('/api/v1/admin', adminRouters);
app.use('/api/v1/Events', eventsRouters);

export  {app }