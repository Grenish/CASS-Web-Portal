import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Gallery } from '../models/gallery.model.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { checkUserRole } from '../middleware/auth.middleware.js';

// Create a single gallery item (one image with metadata)
const createGallery = asyncHandler(async (req, res) => {
    try {
        checkUserRole(req); // Ensure only admin can create gallery items
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiResponse(error.statusCode || 500, null, error.message));
    }

    const { title, category, featured, caption } = req.body;
    const providedImageUrl = req.body.imageUrl; // Get URL from body if provided
    
    if (!title) {
        throw new ApiError(400, "Title is required!");
    }
    
    // Handle image from direct URL or file upload
    let finalImageUrl;
    
    if (providedImageUrl) {
        finalImageUrl = providedImageUrl;
    } else if (req.file?.path) {
        const uploadedImage = await uploadOnCloudinary(req.file.path);
        if (!uploadedImage.url) {
            throw new ApiError(400, "Error while uploading image!");
        }
        finalImageUrl = uploadedImage.url;
    } else {
        throw new ApiError(400, "Image file or URL is required!");
    }

    const galleryItem = await Gallery.create({
        title,
        category,
        featured: featured === 'true' || featured === true,
        imageUrl: finalImageUrl,
        caption
    });

    res
        .status(201)
        .json(new ApiResponse(201, galleryItem, "Gallery item created successfully!"));
});

// Get all gallery items
const getAllGalleries = asyncHandler(async (req, res) => {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    if (!galleries.length) throw new ApiError(404, "No gallery items found!");

    return res
        .status(200)
        .json(new ApiResponse(200, galleries, "All gallery items fetched successfully"));
});

// Get a specific gallery item by ID
const getGalleryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);
    if (!gallery) throw new ApiError(404, "Gallery item not found!");

    return res
        .status(200)
        .json(new ApiResponse(200, gallery, "Gallery item fetched successfully"));
});

// Update a gallery item
const updateGallery = asyncHandler(async (req, res) => {
    try {
        checkUserRole(req); // Ensure only admin can update gallery
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiResponse(error.statusCode || 500, null, error.message));
    }

    const { id } = req.params;
    const { title, category, featured, caption } = req.body;
    const providedImageUrl = req.body.imageUrl; // Get URL from body if provided

    const gallery = await Gallery.findById(id);
    if (!gallery) throw new ApiError(404, "Gallery item not found!");

    // Update image if a new file is uploaded
    let finalImageUrl = gallery.imageUrl;
    
    if (req.file?.path) {
        // Delete old image from Cloudinary
        try {
            if (gallery.imageUrl) {
                await deleteFromCloudinary(gallery.imageUrl);
            }
        } catch (error) {
            console.error("Failed to delete old image from Cloudinary:", error);
        }
        
        // Upload new image
        const uploadedImage = await uploadOnCloudinary(req.file.path);
        if (!uploadedImage.url) {
            throw new ApiError(400, "Error while uploading image!");
        }
        finalImageUrl = uploadedImage.url;
    } else if (providedImageUrl && providedImageUrl !== gallery.imageUrl) {
        // If a new imageUrl is provided
        try {
            if (gallery.imageUrl) {
                await deleteFromCloudinary(gallery.imageUrl);
            }
        } catch (error) {
            console.error("Failed to delete old image from Cloudinary:", error);
        }
        finalImageUrl = providedImageUrl;
    }

    gallery.title = title || gallery.title;
    gallery.category = category || gallery.category;
    gallery.featured = featured === 'true' || featured === true || (featured !== 'false' && featured !== false && gallery.featured);
    gallery.caption = caption !== undefined ? caption : gallery.caption;
    gallery.imageUrl = finalImageUrl;

    await gallery.save();
    
    return res
        .status(200)
        .json(new ApiResponse(200, gallery, "Gallery item updated successfully"));
});

// Delete a gallery item
const deleteGallery = asyncHandler(async (req, res) => {
    try {
        checkUserRole(req); // Ensure only admin can delete gallery
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiResponse(error.statusCode || 500, null, error.message));
    }

    const { id } = req.params;
    const gallery = await Gallery.findById(id);
    if (!gallery) throw new ApiError(404, "Gallery item not found!");

    // Delete image from Cloudinary
    try {
        if (gallery.imageUrl) {
            await deleteFromCloudinary(gallery.imageUrl);
        }
    } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error);
    }

    await Gallery.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, {}, "Gallery item deleted successfully"));
});

export { 
    createGallery, 
    getAllGalleries, 
    getGalleryById, 
    updateGallery,
    deleteGallery 
};
