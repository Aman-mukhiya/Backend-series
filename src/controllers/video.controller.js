import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;


  const videos = await Video.aggregate([
    { $match: { isPublished: true } }, // Only published videos
    { $sample: { size: parseInt(limit) } },      // Random sample
  ]);

  if(!videos) {
    return res
        .status(404)
        .json(new ApiResponse(404, videos, "No videos found!"));
  }

  res.status(200).json(new ApiResponse(201, videos, "Videos retrived randomly"));

  // here getting the data based on a specific user i.e. of a channel
  // const user = await User.findById(userId);
  //   if (!user) {
  //     return res.status(404).json({ message: "User not found" });
  //   }

  //   // Fetch videos
  //   const userVideos = await Video.find({ owner: userId })
  //     .sort({ [sortBy]: sortType === "asc" ? 1 : -1 }) // <-- sorting applied here
  //     .skip((page - 1) * limit) // <-- pagination
  //     .limit(Number(limit));

  // this is based on the user input of searching e.g "cats videos"
  // if (query) {
  //   searchCriteria.$or = [
  //     { title: { $regex: query, $options: "i" } },
  //     { description: { $regex: query, $options: "i" } }
  //   ];
  // }

  // const videos = await Video.find(searchCriteria)
  //   .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
  //   .skip((page - 1) * limit)
  //   .limit(Number(limit));
});

const getSearchVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortType = "asc",
    sortBy = "createdAt",
    userId = "",
  } = req.query;

  // this is based on the user input of searching e.g "cats videos"
  let searchCriteria = {};
  if (query) {
    searchCriteria.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ];
  }

  const searchVideos = await Video.find(searchCriteria)
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

    if (!searchVideos) {
      return res
        .status(404)
        .json(new ApiResponse(404, searchVideos, "Unable to find search videos"));
    }

    return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        searchVideos,
        " Search videos fetched Successfully"
      )
    );


});

const getChannelVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on channel

  const {
    page = 1,
    limit = 10,
    userId,
    sortType = "asc",
    sortBy = "createdAt",
  } = req.query;

  const objectUserId = new mongoose.Types.ObjectId(userId);

  // console.log("\n the user object is " + objectUserId + "\n");

  // here getting the data based on a specific user i.e. of a channel
  const user = await User.findById(objectUserId);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, user, "User not found"));
  }

  // Fetch videos
  const userVideos = await Video.find({ owner: objectUserId, isPublished: true })
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 }) // <-- sorting applied here
    .skip((page - 1) * limit) // <-- pagination
    .limit(Number(limit));

  if (!userVideos) {
    return res
      .status(404)
      .json(new ApiResponse(404, userVideos, "Videos not found"));
  }

  // send the response
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        userVideos,
        "Videos fetched based on user Successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video

  //getting all the data

  const { title, description } = req.body;
  const owner = req.user._id;
  const ThumbnailLocalFilePath = req.files?.thumbnail[0]?.path; // changed to Thumbnail from thumbnail
    console.log("/n Thumbnail File is -> " + ThumbnailLocalFilePath + " <- /n");
  const videoLocalFilePath = req.files?.videoFile[0]?.path;
    console.log("/n Video File is -> " + videoLocalFilePath + " <- /n");



  let VideoDuration = "";
  let UploadedVideoFile = "";
  let UploadedThumbnail = "";

  if (!title || !description)
    throw new ApiError(400, "Title and description are necessary");
  if (!ThumbnailLocalFilePath)
    throw new ApiError(400, "Thumbnail is required!");
  if (!videoLocalFilePath) throw new ApiError(400, "Video is required!");

  try {
    UploadedVideoFile = await uploadOnCloudinary(videoLocalFilePath);
    if (!UploadedVideoFile)
      throw new ApiError(500, "Unable to upload video to Cloudinary");

    UploadedThumbnail = await uploadOnCloudinary(ThumbnailLocalFilePath);
    if (!UploadedThumbnail)
      throw new ApiError(400, "Unable to upload thumbnail to Cloudinary");

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
    isPublished: true,
    owner,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, VideoDoc, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const objectVideoId = new mongoose.Types.ObjectId(videoId);

  if(!objectVideoId){
    return res.status(400).json(new ApiResponse(400, objectVideoId, "Invalid Video id"));
  }

  const video = await Video.findById(objectVideoId);

  if(!video){
    return res.status(404).json(new ApiResponse(404, video, "No Video found!"));
  }

  return res
            .statu(200)
            .json(new ApiResponse(201, video, "Found Video by ID"));

});

const updateVideo = asyncHandler(async (req, res) => {
  
  //TODO: update video details like title, description, thumbnail

  const { videoId } = req.params;
  const {title , description} = req.body;
  const ThumbnailLocalFilePath = req.files?.thumbnail[0]?.path;

  if(!title || !description || !ThumbnailLocalFilePath){
    return res
              .status(400)
              .json(new ApiResponse(401,null, "Title or Description or Thumbnail needed!"))
  }

  // Prepare an object to hold the fields to be updated
  const updateFields = {};

  // Add title and description if provided
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  if(ThumbnailLocalFilePath){
    UploadedThumbnail = await uploadOnCloudinary(ThumbnailLocalFilePath);
    if (!UploadedThumbnail){
      throw new ApiError(400, "Unable to upload thumbnail to Cloudinary");
    }
    updateFields.thumbnail = UploadedThumbnail.url;
  }
  
      

  const objectVideoId = new mongoose.Types.ObjectId(videoId);


  const video = await Video.findByIdAndUpdate(
    objectVideoId,
    { $set: updateFields },
    { new: true }
  )

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, "Video not found"));
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));


});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  getSearchVideos,
  getChannelVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
