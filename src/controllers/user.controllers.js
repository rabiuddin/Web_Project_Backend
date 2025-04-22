import { User } from "../models/user.model";
import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const signUp = asyncHandler(async (req, res) => {

    //get username, email, password from req.body
    const {username, email, password} = req.body

    if(!username || !email || !password){
        throw new ApiError(400, "Please provide all the fields")
    }
    //get image from req.files

    //check that if email exists previously or not
    let foundUser = await User.findOne({email: email})
    if(foundUser){
        throw new ApiError(400, "Email already exists")
    }
    // check image
    let profileImage = req.file?.profile[0]?.path 
    if(!profileImage){
        throw new ApiError(400, "Please provide a profile image")
    }
    // send profile image to cloudinary and get the url
    const imageURL = await uploadOnCloudinary(profileImage)
    if(!image){
        throw new ApiError(500, "Error uploading image")
    }
    //create a new User
    const user = await User.create({
        username: username,
        email: email,
        password: password,
        profileImage: imageURL
    })

    const createdUser = await User.findByid(user._id)?.select(
        "-password"
    )
    //send 200
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})


const login = asyncHandler(async (req, res) => {
    // get email and password from user

    //validate email

    //find user 

    //check password

    //generate access token

    //store it in cookies 

    //send 200
})

const logout = asyncHandler(async (req, res) => {
    //get user id from the middleware 

    //not necessary but validate the user

    //set referesh token null   (optional)

    //clear cookies

    //send 200

})

const generateAccessToken = asyncHandler(async (req, res) => {

})

const generateRefreshToken = asyncHandler(async (req, res) => {

}) 

const changePassword = asyncHandler(async (req, res) => {
    // get email and password and new password from req.body

    //validate email 

    //find the user against email

    //check if password is correct 

    //update the new password as password

    //save the user 

    //send 200
})


export {
    signUp,
    login,
    logout,
    generateAccessToken,
    generateRefreshToken,
    changePassword   
}