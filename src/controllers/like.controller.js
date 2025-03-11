import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const like = await Like.findOne({video: videoId, likedBy: req.user._id});
    if(like){
        await Like.findByIdAndDelete(like._id);
        return res.json(new ApiResponse(200, "Like removed successfully!"))
    }
    const newLike = await Like.create({video: videoId, likedBy: req.user._id});
    
    if(!newLike){
        throw new ApiError(500, "Something went wrong while liking the video!");
    }

    return res.status(201).json(new ApiResponse(200, "Video liked successfully!"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const commentLike = await Like.findOne({comment: commentId, likedBy: req.user._id});
    if(commentLike){
        await Like.findByIdAndDelete(commentLike._id);
       return res.json(new ApiResponse(200, "Like removed successfully!"))  
      }

    const newLike = await Like.create({comment: commentId, likedBy: req.user._id});
    if(!newLike){
        throw new ApiError(500, "Something went wrong while liking the comment!");
    }
    return res.status(201).json(new ApiResponse(200, "Comment liked successfully!"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const tweetLike = await Like.findOne({tweet: tweetId, likedBy: req.user._id});
    if(tweetLike){
        await Like.findByIdAndDelete(tweetLike._id);
        return res.json(new ApiResponse(200, "Like removed successfully!"))
    }
    const newLike = await Like.create({tweet: tweetId, likedBy: req.user._id});
    if(!newLike){
        throw new ApiError(500, "Something went wrong while liking the tweet!");
    }
    return res.status(201).json(new ApiResponse(200, "Tweet liked successfully!"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find({likedBy: req.user._id}).populate("video");
    if(!likedVideos){
        likedVideos = 0;
    }
    return res.json(new ApiResponse(200, "Liked videos retrieved successfully!", likedVideos))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}