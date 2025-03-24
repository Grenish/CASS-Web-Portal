import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Event } from "../models/event.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// Helper Function to Ensure Admin Access
const checkAdmin = (req) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied! Admins only.");
  }
};

// Cloudinary destroy function
const deleteFromCloudinary = async (mediaUrl) => {
  if (!mediaUrl) {
    throw new ApiError(400, "No media URL provided for deletion");
  }
  try {
    // Extract the public ID from the Cloudinary URL
    const publicId = mediaUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    throw new ApiError(500, "Error deleting old media from Cloudinary");
  }
};

/**
 * @desc   Create a new event
 * @route  POST /events/create
 * @access Admin
 */
const createEvent = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const { title, description, category, date, location } = req.body;
  const localMediaPath = req.file?.path;

  if (
    !title ||
    !description ||
    !category ||
    !date ||
    !location ||
    !localMediaPath
  ) {
    throw new ApiError(400, "All fields and media file are required!");
  }

  const media = await uploadOnCloudinary(localMediaPath);
  if (!media.url) throw new ApiError(400, "Error while uploading media file!");

  const newEvent = await Event.create({
    title,
    description,
    category,
    date,
    media: media.url,
    location,
  });
  res
    .status(201)
    .json(new ApiResponse(201, newEvent, "Event created successfully!"));
});

/**
 * @desc   Get all events
 * @route  GET /events
 * @access Public
 */
const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  if (!events.length) {
    throw new ApiError(404, "No events found!");
  }
  res
    .status(200)
    .json(new ApiResponse(200, events, "All events fetched successfully"));
});

/**
 * @desc   Get event by ID or Title
 * @route  GET /events/:identifier
 * @access Public
 */
const getEventById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  let event = null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    event = await Event.findById(identifier);
  }
  if (!event) {
    event = await Event.findOne({
      title: { $regex: new RegExp(identifier, "i") },
    });
  }
  if (!event) {
    throw new ApiError(404, "Event not found!");
  }
  res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched successfully"));
});

/**
 * @desc   Update an event
 * @route  PATCH /events/update/:id
 * @access Admin
 */
const updateEvent = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const { id } = req.params;
  const cleanedId = id.trim();

  if (!mongoose.Types.ObjectId.isValid(cleanedId)) {
    throw new ApiError(400, "Invalid event ID format!");
  }

  const event = await Event.findById(cleanedId);
  if (!event) throw new ApiError(404, "Event not found!");

  const { title, description, date, location } = req.body;
  let media = event.media;

  if (req.file?.path) {
    if (event.media) {
      await deleteFromCloudinary(event.media);
    }
    const uploadedMedia = await uploadOnCloudinary(req.file.path);
    media = uploadedMedia.url || event.media;
  }

  // Update only the provided fields
  event.title = title || event.title;
  event.description = description || event.description;
  event.date = date || event.date;
  event.location = location || event.location;
  event.media = media;

  await event.save();
  res
    .status(200)
    .json(new ApiResponse(200, event, "Event updated successfully"));
});

/**
 * @desc   Delete an event
 * @route  DELETE /events/delete/:id
 * @access Admin
 */
const deleteEvent = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) throw new ApiError(404, "Event not found!");

  if (event.media) {
    try {
      await deleteFromCloudinary(event.media);
    } catch (error) {
      console.error("Failed to delete media from Cloudinary:", error);
    }
  }

  await Event.findByIdAndDelete(id);
  res.status(200).json(new ApiResponse(200, {}, "Event deleted successfully"));
});

export { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
