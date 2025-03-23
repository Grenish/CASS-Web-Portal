import mongoose, { Schema } from "mongoose";

const facultySchema = new Schema({
    head: [
        {
            name: { type: String, required: true },
            designation: { type: String, required: true },
            image: { type: String, required: true },
            testimonial: { type: String },
            department: { type: String, required: true },
            email: { type: String, required: true },
        },
    ],
    member: [
        {
            name: { type: String, required: true },
            designation: { type: String, required: true },
            image: { type: String, required: true },
            testimonial: { type: String },
            department: { type: String, required: true },
            email: { type: String, required: true },
        },
    ],
});

// Export the Faculty model to be used elsewhere in the application.
// This allows for easy reference to the Faculty collection in the MongoDB database.
export const Faculty = mongoose.model("Faculty", facultySchema);