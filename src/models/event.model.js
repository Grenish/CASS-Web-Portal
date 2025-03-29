import mongoose, { Schema } from "mongoose";


const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["Event", "Blog"],
      required: true
    },
    media: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/.test(v); // Example regex for image URLs
        },
        message: "Invalid media URL format",
      },
    },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
