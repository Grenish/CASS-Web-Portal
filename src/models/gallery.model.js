import mongoose, { Schema } from "mongoose";

const gallerySchema = new Schema({
    title: { type: String, required: true, trim: true },
    category: {
        type: String,
        default: 'Other'
    },
    imageUrl: { type: String, required: true },
    caption: { type: String },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Gallery = mongoose.model("Gallery", gallerySchema);
