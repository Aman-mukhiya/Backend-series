import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    
    // TODO: get video, upload to cloudinary, create video

    //getting all the data 
    
        const { title, description } = req.body;
        const owner = req.user._id;
        const ThumbnailLocalFilePath = req.files?.thumbnail[0]?.path;// changed to Thumbnail from thumbnail
        const videoLocalFilePath = req.files?.videoFile[0]?.path;
        let VideoDuration = "";
        let UploadedVideoFile = "";
        let UploadedThumbnail = "";
    
        if (!title || !description) throw new ApiError(400, "Title and description are necessary");
        if (!ThumbnailLocalFilePath) throw new ApiError(400, "Thumbnail is required!");
        if (!videoLocalFilePath) throw new ApiError(400, "Video is required!");
    
        try {
            let UploadedVideoFile = await uploadOnCloudinary(videoLocalFilePath);
            if (!UploadedVideoFile) throw new ApiError(500, "Unable to upload video to Cloudinary");
    
            let UploadedThumbnail = await uploadOnCloudinary(ThumbnailLocalFilePath);
            if (!UploadedThumbnail) throw new ApiError(400, "Unable to upload thumbnail to Cloudinary");
    
            VideoDuration = UploadedVideoFile.duration || 0;
        } catch (error) {
            console.error(error);
            throw new ApiError(500, "Something went wrong while uploading the video");
        }
    
        const VideoDoc = await Video.create({
            videoFile: UploadedVideoFile.url,
            thumbnail: UploadedThumbnail.url,
            title,
            description,
            duration: VideoDuration,
            owner
        });
    
        return res.status(201).json(new ApiResponse(201, VideoDoc, "Video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}