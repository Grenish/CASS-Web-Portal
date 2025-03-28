import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import mongoose from "mongoose";
import { Feedback } from '../models/feedback.model.js';
import { checkUserRole } from '../middleware/auth.middleware.js';



const addFeedback = asyncHandler(async (req, res) => {
    const { message, anonymous, rating } = req.body;

    if (!message || !rating) {
        throw new ApiError(400, "Message and rating are required!");
    }

    if (!req.user) {
        throw new ApiError(401, "Unauthorized! User information is missing.");
    }

    const feedback = await Feedback.create({
        message,
        anonymous,
        rating,
        user: req.user._id
    });

    const feedbackData = {
        message,
        anonymous,
        rating,
        user: anonymous ? null : {
            username: req.user.username,
            email: req.user.email
        }
    };

    return res
        .status(201)
        .json(new ApiResponse(201, feedbackData, "Feedback added successfully!"));
});

const getAllFeedback = asyncHandler(async (req, res) => {
    checkUserRole(req); // Ensure only admin can access this route

    const feedback = await Feedback.find({}, "message rating anonymous user createdAt")
        .populate("user", "username email")
        .sort({ createdAt: -1 });

    if (feedback.length === 0) {
        throw new ApiError(404, "No feedback found!");
    }

    return res.status(200).json(new ApiResponse(200, { feedback }, "Feedback retrieved successfully!"));
});

const deleteFeedback = asyncHandler(async (req, res) => {
    checkUserRole(req); // Ensure only admin can access this route
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Feedback ID is required!");
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid feedback ID format!");
    }

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
        throw new ApiError(404, "Feedback not found!");
    }

    return res.status(200).json(new ApiResponse(200, null, "Feedback deleted successfully!"));
});

const deleteAllFeedback = asyncHandler(async (req, res) => {

    checkUserRole(req); // Ensure only admin can access this route

    await Feedback.deleteMany({});
    return res.status(200).json(new ApiResponse(200, null, "All feedback deleted successfully!"));
});

const getFeedbackByEvent = asyncHandler(async (req, res) => {

    checkUserRole(req); // Ensure only admin can access this route

    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Invalid event ID!");
    }

    const feedback = await Feedback.find({ event: eventId })
        .populate("user", "username email")
        .sort({ createdAt: -1 });

    if (feedback.length === 0) {
        throw new ApiError(404, "No feedback found for this event!");
    }

    return res.status(200).json(new ApiResponse(200, { feedback }, "Feedback retrieved successfully!"));
});

export {
    addFeedback,
    getAllFeedback,
    deleteFeedback,
    deleteAllFeedback,
    getFeedbackByEvent
};