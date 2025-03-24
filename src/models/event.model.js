import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["Event", "Blog"], required: true },
    date: { type: Date, required: true },
    media: { type: String, required: true }, // cloudinary URL
    location: { type: String, required: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
