import { File } from "../models/file.model";
import { User } from "../models/user.model";
import { ApiError} from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const deleteFile = asyncHandler(async(req,res)=>{
    //id from params user from token
    const userId = req.user._id;
    const fileId = req.params.id;

    const foundFile = await File.findById(fileId);

    if(!foundFile){
        throw new ApiError(400,"File Not Found") 
    }

    if(userId !== foundFile.user._id){
        throw new ApiError(400,"Invalid Request")
    }

    const deletedFile = await File.findByIdAndDelete(fileId);

    if(!deletedFile){
        throw new ApiError(400,"File Not Found")
    }
    return res.status(200).json(new ApiResponse(200,deletedFile,"File Deleted Successfully"))

})

const updateFile = asyncHandler(async(req,res)=>{

})


export{
    deleteFile,
    updateFile
}