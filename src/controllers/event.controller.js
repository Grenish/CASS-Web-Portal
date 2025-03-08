import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Event } from '../models/event.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';


// Helper Function to Ensure Admin Access
const checkAdmin = (req) => {
    if (!req.user || req.user.role !== 'admin') {
        throw new ApiError(403, "Access denied! Admins only.");
    }
};

// Cloudinary destroy function
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new ApiError(500, "Error deleting old media from Cloudinary");
    }
};

/**  
 * @desc   Create a new event  
 * @route  POST /events/create  
 * @access Admin  
 */
const createEvent = asyncHandler(async (req, res) => {

    checkAdmin(req); // Ensure only admin can create events

    const { title, description, date, location } = req.body;
    const localMediaPath = req.file?.path;

    //console.log(localMediaPath);
    // console.log(title,
    //             description,
    //             date,
    //             location
    // );

    if (!title || !description || !date || !location || !localMediaPath) {
        throw new ApiError(400, "All fields and media file are required!");
    }

    const media = await uploadOnCloudinary(localMediaPath);
    //console.log(media,"hello")

    if (!media.url) throw new ApiError(400, "Error while uploading media file!");

    const newEvent = await Event.create({ title, description, date, media: media.url, location });

    res
        .status(201)
        .json(new ApiResponse(201, newEvent, "Event created successfully!")
        );
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
        .json(
            new ApiResponse(200, events, "All events fetched successfully")
        );
});

/**  
 * @desc   Get event by ID  
 * @route  GET /events/:id  
 * @access Public  
 */
const getEventById = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    let event;

    // Check if identifier is a valid MongoDB ObjectId (search by ID)
    // if (mongoose.Types.ObjectId.isValid(identifier)) {
    //     event = await Event.findById(identifier);
    // }

    // If not found by ID, search by title (case-insensitive)
    if (!event) {
        event = await Event.findOne({ title: { $regex: new RegExp(identifier, "i") } });
    }

    if (!event) {
        throw new ApiError(404, "Event not found!");
    }

    res.status(200).json(new ApiResponse(200, event, "Event details fetched successfully"));
});

/**  
 * @desc   Update an event  
 * @route  PATCH /events/update/:id  
 * @access Admin  
 */

const updateEvent = asyncHandler(async (req, res) => {
    checkAdmin(req); // Ensure only admin can update events

    const { id } = req.params;
   // console.log("Received Event ID:",id, "Type:", typeof id);

    const cleanedId = id.trim();


    if (!mongoose.Types.ObjectId.isValid(cleanedId)) {
        throw new ApiError(400, "Invalid event ID format!");
    }

    const { title, description, date, location } = req.body;
    const event = await Event.findById(cleanedId);

    if (!event) throw new ApiError(404, "Event not found!");

    let media = event.media;

    if (req.file?.path) {
        try {
            // Delete the old media from Cloudinary if it exists
            if (event.media) {
                await deleteFromCloudinary(event.media);
            }

            // Upload the new file to Cloudinary
            const uploadedMedia = await uploadOnCloudinary(req.file.path);
            media = uploadedMedia.url || event.media;
        } catch (error) {
            console.error("Error updating media file on Cloudinary:", error);
            throw new ApiError(500, "Failed to update media file!");
        }
    }

    // Update only the provided fields, keeping others unchanged
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.media = media;

    await event.save();

    res.status(200).json(new ApiResponse(200, event, "Event updated successfully"));
});


/**  
 * @desc   Delete an event  
 * @route  DELETE /events/delete/:id  
 * @access Admin  
 */
const deleteEvent = asyncHandler(async (req, res) => {
    checkAdmin(req); // Ensure only admin can delete events

    const { id } = req.params;

    // First, find the event before deleting it
    const event = await Event.findById(id);
    if (!event) throw new ApiError(404, "Event not found!");

    try {
        // Delete media from Cloudinary (if it exists)
        if (event.media) {
            await deleteFromCloudinary(event.media);
        }
    } catch (error) {
        console.error("Failed to delete media from Cloudinary:", error);
    }

    // Now delete the event from the database
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
