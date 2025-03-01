import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/apiResponse.js';
import {ApiError} from '../utils/apiError.js';
import {Admin} from "../models/admin.model.js"



const registerAdmin =asyncHandler( async (req, res) => {
    const { username, password,email } = req.body;

    if ([username, password,email].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required!")
    }

    const existingAdmin = await Admin.findOne(
        {
            $or: [
                {username},
                {email}
            ]
        }
    )
    
    if (existingAdmin){
        throw new ApiError(409,"Admin already exists!")
    }

   const user =await Admin.create(
        {
            username,
            password,
            email
        })

        const createdUser = await Admin.findById(user._id).select(
            '-password'
        )

        if(!createdUser) {
            throw new ApiError(500,"Failed to register user admin!")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User admin registered Successfully")
        )
        
})



export {registerAdmin}