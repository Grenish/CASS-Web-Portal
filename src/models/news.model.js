import mongoose, { Schema } from "mongoose";

const newsBlogSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ["News", "Blog"],
        required: true
    },
    media: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },

}, { timestamps: true });

export const newsBlog = mongoose.model('newsBlog', newsBlogSchema);

