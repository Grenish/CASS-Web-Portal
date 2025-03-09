import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

//importing dot env causing error to access env variable
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

// Cloudinary Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// console.log("Cloudinary Config:", {
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Not Loaded",
//   });
  

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload to Cloudinary
        const res = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });

        console.log("Upload Successful:", res.secure_url);

        // Delete the local file after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return { url: res.secure_url };
    } 
    catch (error) {
        console.error("Cloudinary Upload Error:", error);

        // Remove local temp file only if it exists
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null; // Return null to handle errors properly
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

export { uploadOnCloudinary,
    deleteFromCloudinary
 };
