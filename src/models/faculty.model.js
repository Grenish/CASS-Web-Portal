import mongoose, { Schema } from "mongoose";

const facultySchema = new Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    image: { type: String, required: true },
    testimonial: { type: String},
    department: { type: String, required: true },
    email: { type: String, required: true }
})

// Export the Faculty model to be used elsewhere in the application.  This allows for easy reference to the Faculty collection in the MongoDB database.  The model is named "Faculty" and uses the facultySchema defined above.  Mongoose automatically creates a collection named "faculties" in the MongoDB database.  The collection contains documents representing faculty members.  Each document has fields for the faculty's name, designation, image URL, department, and email
export const Faculty = mongoose.model('Faculty',facultySchema);