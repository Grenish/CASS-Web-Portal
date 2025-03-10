import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Faculty } from '../models/faculty.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

const checkAdmin = (req) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Access denied! Admins only.");
    }
};

const deleteFromCloudinary = async (mediaUrl) => {
    try {
        if (!mediaUrl) {
            throw new ApiError(400, "No media URL provided for deletion");
        }

        const publicId = mediaUrl.split('/').pop().split('.')[0];

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
        throw new ApiError(500, "Error deleting old media from Cloudinary");
    }
}

const createFaculty = asyncHandler(async (req, res) => {

    checkAdmin(req);

    const { name, designation, department, email, testimonial } = req.body;
    const localMediaPath = req.file?.path;

    if (!name || !designation || !department || !email || !localMediaPath) {
        throw new ApiError(400, "All fields and media file are required!");
    }

    const image = await uploadOnCloudinary(localMediaPath);

    if (!image.url) {
        throw new ApiError(500, "Error uploading image to Cloudinary");
    }

    const faculty = new Faculty({
        name,
        designation,
        department,
        email,
        testimonial,
        image: image.url
    });

    await faculty.save();

    return res
        .status(201)
        .json(
            new ApiResponse(201, { faculty }, "Faculty member created successfully!"));

});

const getAllFaculties = asyncHandler(async (req, res) => {
    const faculties = await Faculty.find();

    if (!faculties.length) {
        throw new ApiError(404, "No faculties found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { faculties }, "Faculties retrieved successfully!")
        );
});

const getFacultyByName = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    const faculty = await Faculty.findOne({ name: { $regex: new RegExp(identifier, "i") } });

    if (!faculty) {
        throw new ApiError(404, "Faculty member not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { faculty }, "Faculty member retrieved successfully!")
        );

});

const updateFaculty = asyncHandler(async (req, res) => {
    try {
        checkAdmin(req);

        const { name, designation, department, email, testimonial } = req.body;
        const localMediaPath = req.file?.path;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid faculty ID");
        }

        const faculty = await Faculty.findById(id);

        if (!faculty) {
            throw new ApiError(404, "Faculty member not found");
        }

        const oldImage = faculty.image;
        let image;

        if (localMediaPath) {
            image = await uploadOnCloudinary(localMediaPath);

            if (!image.url) {
                throw new ApiError(500, "Error uploading image to Cloudinary");
            }
        }

        faculty.name = name || faculty.name;
        faculty.designation = designation || faculty.designation;
        faculty.department = department || faculty.department;
        faculty.email = email || faculty.email;
        faculty.testimonial = testimonial || faculty.testimonial;
        faculty.image = image?.url || faculty.image;

        await faculty.save();

        if (localMediaPath) {
            await deleteFromCloudinary(oldImage);
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, { faculty }, "Faculty member updated successfully!")
            );
    } catch (error) {
        return res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
    }
});

const deleteFaculty = asyncHandler(async (req, res) => {

    checkAdmin(req);

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid faculty ID");
    }

    const faculty = await Faculty.findById(id);

    if (!faculty) {
        throw new ApiError(404, "Faculty member not found");
    }

    try {
        await deleteFromCloudinary(faculty.image);
    } catch (error) {
        throw new ApiError(500, "Error deleting faculty image from Cloudinary");
    }

    await Faculty.findByIdAndDelete(id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Faculty member deleted successfully!")
        );
});

export { createFaculty, 
    getAllFaculties, 
    getFacultyByName, 
    updateFaculty, 
    deleteFaculty 
};
