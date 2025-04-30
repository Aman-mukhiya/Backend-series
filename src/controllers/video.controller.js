import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

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
    query,
    sortType = "asc",
    sortBy = "createdAt",
    userId,
  } = req.query;

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

  console.log("\n the user object is " + objectUserId + "\n");

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
  //   console.log("/n Thumbnail File is -> " + ThumbnailLocalFilePath + " <- /n");
  const videoLocalFilePath = req.files?.videoFile[0]?.path;
  //   console.log("/n Video File is -> " + videoLocalFilePath + " <- /n");

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
  // check if the user i authoriaed to access
  // check if it is a video object
  // return the video url
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
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
  getChannelVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
