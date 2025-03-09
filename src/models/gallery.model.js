import mongoose, { Schema } from "mongoose";

const gallerySchema = new Schema({
    title: { type: String, required: true }, // Gallery title
    description: { type: String }, // Optional description
    images: [
        {
            imageUrl: { type: String, required: true }, // Cloudinary Image URL
            uploadedAt: { type: Date, default: Date.now }, // Time of upload
        }
    ],
}, { timestamps: true });

export const Gallery = mongoose.model("Gallery", gallerySchema);
