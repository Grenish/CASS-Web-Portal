import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath)=>{

        try {
            if(!localFilePath) return null
            //upload on cloudinary
          const res=await  cloudinary.uploader.upload(localFilePath,{resource_type:"auto"

            })
            //SUCCESSFULLY UPLOADED ON CLOUD
            // console.log("SUCCESSFULLY UPLOADED ON CLOUD",res.url);
fs.unlinkSync(localFilePath)
            return res;
        } 
        catch (error) {
            fs.unlinkSync(localFilePath) //remove locally saved temporary file as the upload operation go failed

        }
    }







export { uploadOnCloudinary }