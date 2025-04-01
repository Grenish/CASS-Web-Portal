import mongoose, { Schema } from "mongoose";

const newsletterSchema = new Schema({

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
    media: {
        type: String,
        required: true
    },

}, { timestamps: true });

export const Newsletter = mongoose.model('newsletter', newsletterSchema);

