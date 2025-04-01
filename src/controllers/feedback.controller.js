import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import mongoose from "mongoose";
import { Feedback } from '../models/feedback.model.js';
import { checkUserRole } from '../middleware/auth.middleware.js';



const addFeedback = asyncHandler(async (req, res) => {
    const { message, anonymous, rating } = req.body;
    const { eventId } = req.params;

    if (!req.user) {
        throw new ApiError(401, "Unauthorized! User information is missing.");
    }

    if (!eventId) {
        throw new ApiError(400, "Event ID is required!");
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Invalid event ID format!");
    }

    const existingFeedback = await Feedback.findOne({ event: eventId, user: req.user._id });
    
    if (existingFeedback) {
        throw new ApiError(400, "You have already submitted feedback for this event!");
    }

    if (!message || !rating) {
        throw new ApiError(400, "Message and rating are required!");
    }


    const feedback = await Feedback.create({
        message,
        anonymous,
        rating,
        event: eventId,
        user: req.user._id
    });

    const feedbackData = {
        message,
        anonymous,
        rating,
        event: eventId,
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

    const { page = 1, limit = 10 } = req.query;

    const feedback = await Feedback.find({}, "message rating anonymous user createdAt")
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    // Process feedback to hide user details for anonymous feedback
    const processedFeedback = feedback.map((item) => {
        if (item.anonymous) {
            return {
                ...item.toObject(),
                user: null, // Remove user details for anonymous feedback
            };
        }
        return item;
    });

    if (processedFeedback.length === 0) {
        return res.status(200).json(new ApiResponse(200, { feedback: [] }, "No feedback found!"));
    }

    return res.status(200).json(new ApiResponse(200, { feedback: processedFeedback }, "Feedback retrieved successfully!"));
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

    const processedFeedback = feedback.map((item) => {
        if (item.anonymous) {
            return {
                ...item.toObject(),
                user: null, // Remove user details for anonymous feedback
            };
        }
        return item;
    });

    if (processedFeedback.length === 0) {
        return res.status(200).json(new ApiResponse(200, { feedback: [] }, "No feedback found!"));
    }

    return res.status(200).json(new ApiResponse(200, { feedback: processedFeedback }, "Feedback retrieved successfully!"));
});

export {
    addFeedback,
    getAllFeedback,
    deleteFeedback,
    deleteAllFeedback,
    getFeedbackByEvent
};