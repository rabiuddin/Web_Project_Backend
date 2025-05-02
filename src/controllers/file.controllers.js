import { File } from "../models/file.model.js";
import { ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const deleteFile = asyncHandler(async(req,res)=>{
   
    const fileId = req.params.id;

    const foundFile = await File.findById(fileId);

    if(!foundFile){
        throw new ApiError(400,"File Not Found") 
    }
    const deletedFile = await File.findByIdAndDelete(fileId);

    if(!deletedFile){
        throw new ApiError(400,"File Not Found")
    }
    return res.status(200).json(new ApiResponse(200,deletedFile,"File Deleted Successfully"))

})

const updateFile = asyncHandler(async(req,res)=>{
    const fileId = req.params.id;
    const {name,content} = req.body;

    const foundFile = await File.findById(fileId);

    if(!foundFile){
        throw new ApiError(400,"File Not Found") 
    }
    const updatedFile = await File.findByIdAndUpdate(fileId,{name,content},{new:true});

    if(!updatedFile){
        throw new ApiError(400,"File Not Found")
    }
    return res.status(200).json(new ApiResponse(200,updatedFile,"File Updated Successfully"))
})


export{
    deleteFile,
    updateFile
}