import { User } from "../models/user.model";
import asyncHandler from '../utils/asyncHandler.js'


const signUp = asyncHandler(async (req, res) => {

    //get username, email, password from req.body

    //get image from req.files

    //check that if username or email exists previously or not

    //create a new User

    //send 200

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