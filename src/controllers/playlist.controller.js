import mongoose, { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  const { name, description } = req.body;

  if (!name || !description) {
    return new ApiError(400, "Name and Description is needed");
  }

  const newPlaylist = await PlayList.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!newPlaylist) {
    return new ApiError(
      500,
      "Something went wrong while createing the playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const objectUserId = new mongoose.Types.ObjectId(userId);

  // get all the playlist owned by the user
  const playlists = await PlayList.find({ owner: userId });

  if (!playlists || playlists.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(201, playlists, "No playlist found by the given user")
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(201, playlists, "Playlist retrived successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID");
  }

  const playList = await PlayList.findById({ playlistId }).populate("videos");

  if (!playList) {
    throw new ApiError(
      400,
      "Something went wrong while retriving the playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(201, playList, "Playlist retrived successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // TODO: add video to playlist
  const { playlistId, videoId } = req.params;

  // Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await PlayList.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } }, // `$addToSet` prevents duplicates
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // TODO: remove video from playlist
  const { playlistId, videoId } = req.params;

  // Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  // Find playlist
  const playlist = await PlayList.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Check if video exists in the playlist
  if (!playlist.videos.includes(videoId)) {
    return res
      .status(404)
      .json(new ApiResponse(404, "Video doesn't exists in the playlist"));
  }

  const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } }, // `$pull` removes all instances of a specified value from an array field.
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      500,
      "Something went wrong while deleting a video from playlist"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        updatedPlaylist,
        "Video deleted successfully from the playlist"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // TODO: delete playlist

  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalaid Playlist Object ID");
  }

  const playlist = await PlayList.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "playlist Doesn't exists");
  }

  const deletePlaylist = await PlayList.findByIdAndDelete(playlistId);

  if (!deletePlaylist) {
    throw new ApiError(500, "Something went wrong while deleting the playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, null, "playlist deleted succefully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //TODO: update playlist

  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(400, "Enter new name or Description");
  }
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalaid Playlist Object ID");
  }

  const playlist = await PlayList.findOneAndUpdate(
    { _id: playlistId },
    { name, description },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      500,
      "Something went wrong while updating the playlist with name or description"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(201, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
