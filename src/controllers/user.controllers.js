import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";



const generateAccessTokenAndRefresToken = async (userId) => {

    try {
        const user = await Admin.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "something went wrong while genrating access token and refresh token");
    }

};


const registerAdmin = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if ([username, password, email].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required!")
    }

    const existingAdmin = await Admin.findOne(
        {
            $or: [
                { username },
                { email }
            ]
        }
    )

    if (existingAdmin) {
        throw new ApiError(409, "Admin already exists!")
    }

    const user = await Admin.create(
        {
            username,
            password,
            email
        })

    const createdUser = await Admin.findById(user._id).select(
        '-password'
    )

    if (!createdUser) {
        throw new ApiError(500, "Failed to register user admin!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User admin registered Successfully")
    )

})

const loginAdmin = asyncHandler(async (req, res) => {

    const { username, password, email } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or password is required!")
    }

    const user = await Admin.findOne({
        $or:
            [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(401, "User does not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect user password!")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefresToken(user._id);

    const loggedInUser = await Admin.findById(user._id).
        select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully")
        )

});

const logoutAdmin = asyncHandler(async (req, res) => {

    Admin.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true }
    )

    const option = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"))
});



const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incommingrefreshToken) {
        throw new ApiError(401, "No valid refresh token found!");
    }

    try {
        const decodedrefreshToken = await jwt.verify(incommingrefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await Admin.findById(decodedrefreshToken?._id);

        if (!user) {
            throw new ApiError(403, "Invalid refresh token!");
        }

        if (incommingrefreshToken !== user?.refreshToken) {
            throw new ApiError(403, "Refresh token has expired!");
        }

        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefresToken(user._id);

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "User access token refreshed successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Failed to refresh access token!");

    }

});

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.body;
    
    if (!(currentPassword || newPassword)) {
        throw new ApiError(400, "Current password and new password are required!")
    }

    const user = await Admin.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect current password!")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.
        status(200).
        json(
            new ApiResponse(200, {}, "Password changed successfully!")
        )

})

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken,
    changeCurrentPassword,
}