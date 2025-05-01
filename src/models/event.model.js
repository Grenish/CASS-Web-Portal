import mongoose, { Schema } from "mongoose";
import slugify from "slugify";

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
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    media: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/.test(v);
        },
        message: "Invalid media URL format",
      },
    },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

// Pre-validate hook to create unique slug
eventSchema.pre("validate", async function (next) {
  if (this.title && !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check for existing slugs
    while (await mongoose.models.Event.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
  }
  next();
});


export const Event = mongoose.model("Event", eventSchema);
