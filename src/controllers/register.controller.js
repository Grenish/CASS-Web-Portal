import { Register } from "../models/register.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";
import { checkUserRole } from "../middleware/auth.middleware.js";
import { Admin } from "../models/admin.model.js";
import { Event } from "../models/event.model.js";

const createRegister = asyncHandler(async (req, res) => {
    const { fullName, eventName, email, phone } = req.body;
    const { eventId } = req.params;
    const userId = req.user?._id;



    if (!userId) {
        throw new ApiError(400, "User not found!");
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Invalid event ID!");
    }
    
    const user = await Admin.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    const event = await Event.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found!");
    }

    const newRegister = await Register.create({
        name: fullName || user.fullName,
        email: email || user.email,
        phone: phone || user.phone,
        eventName: eventName || event.title,
        event: eventId,
        user: userId,
        status: "confirmed",
    });

    res
        .status(201)
        .json(new ApiResponse(201, newRegister, "Register created successfully!"));
});

const getAllRegisterOfEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Invalid event ID!");
    }

    const registers = await Register.find({ event: eventId })
        .populate("user", "fullName email phone")
        .populate("event", "title")
        .lean();

    res.status(200).json(new ApiResponse(200, registers, "All registers fetched successfully!"));
});

const removeRegisterOfEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Invalid event ID!");
    }

    const register = await Register.findByIdAndDelete(eventId);

    if (!register) {
        throw new ApiError(404, "Register not found!");
    }

    res.status(200).json(new ApiResponse(200, {}, "Register deleted for event successfully!"));
});

const removeAllRegister = asyncHandler(async (req, res) => {
    // Ensure the user has the required role
    const hasRole = checkUserRole(req);
    if (!hasRole) {
        throw new ApiError(403, "You do not have permission to perform this action!");
    }

    await Register.deleteMany({});
    res.status(200).json(new ApiResponse(200, {}, "All registers deleted successfully!"));
});

const getRegisterByUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User is not authenticated!");
    }

    const registers = await Register.find({ user: userId })
        .populate("event", "title") // Limit fields to only 'title'
        .lean();

    if (registers.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No registers found!")); // Return empty array directly
    }

    res.status(200).json(new ApiResponse(200, registers, "Registers retrieved successfully!"));
});

export {
    createRegister,
    getAllRegisterOfEvent,
    removeRegisterOfEvent,
    removeAllRegister,
    getRegisterByUser,
}