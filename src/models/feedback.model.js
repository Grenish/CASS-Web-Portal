import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: function () {
            return !this.anonymous;
        },
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        default: 3
    },
    anonymous: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,

    },
}, { timestamps: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
