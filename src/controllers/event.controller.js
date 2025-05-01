import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Event } from "../models/event.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { checkUserRole } from "../middleware/auth.middleware.js";


const createEvent = asyncHandler(async (req, res) => {
  checkUserRole(req);

  const { title, description, category, date, time, content, location } = req.body;
  const localMediaPath = req.file?.path;

  if (
    !title ||
    !description ||
    !category ||
    !date ||
    !time ||
    !content ||
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
    time,
    content,
    media: media.url,
    location,
  });
  res
    .status(201)
    .json(new ApiResponse(201, newEvent, "Event created successfully!"));
});

const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  if (!events.length) {
    throw new ApiError(404, "No events found!");
  }
  res
    .status(200)
    .json(new ApiResponse(200, events, "All events fetched successfully"));
});

const getEventById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const event = await Event.findOne({
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(identifier) ? identifier : null },
      { title: { $regex: new RegExp(identifier, "i") } },
      { slug: identifier }, // Added slug as a search option
    ],
  });

  if (!event) {
    throw new ApiError(404, "Event not found!");
  }

  res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched successfully"));
});

const updateEvent = asyncHandler(async (req, res) => {
  checkUserRole(req);

  const { id } = req.params;
  const cleanedId = id.trim();

  if (!mongoose.Types.ObjectId.isValid(cleanedId)) {
    throw new ApiError(400, "Invalid event ID format!");
  }

  const event = await Event.findById(cleanedId);
  if (!event) throw new ApiError(404, "Event not found!");

  const { title, description, date, time, content, category, location } = req.body;
  let media = event.media;

  if (req.file?.path) {
    if (event.media) {
      await deleteFromCloudinary(event.media);
    }
    const uploadedMedia = await uploadOnCloudinary(req.file.path);
    media = uploadedMedia.url;
  }

  // Update only the provided fields
  event.title = title || event.title;
  event.description = description || event.description;
  event.date = date || event.date;
  event.time = time || event.time;
  event.content = content || event.content;
  event.category = category || event.category;
  event.location = location || event.location;
  event.media = media;

  await event.save();
  res
    .status(200)
    .json(new ApiResponse(200, event, "Event updated successfully"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  checkUserRole(req);

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

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
