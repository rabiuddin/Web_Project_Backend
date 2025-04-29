import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

//Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

//console.log(process.env.CLOUD_NAME, process.env.CLOUD_API_KEY, process.env.CLOUD_SECRET);

const uploadOnCloudinary = async (localFilePath) => {
  console.log("Local File Path:", localFilePath);
  try {
    if (!localFilePath) {
      return null;
    }

    // Upload on Cloudinary
    let response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Uploaded on Cloudinary
    console.log("Uploaded on Cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    fs.unlinkSync(localFilePath); // Remove the file from local server as the upload failed
    return null;
  }
};

const deleteFromCloudinary = async () => {
  cloudinary.uploader.destroy("sample", (result) => {
    console.log(result);
  });
};

export { uploadOnCloudinary, deleteFromCloudinary };
