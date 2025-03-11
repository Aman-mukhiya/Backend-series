import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {TweetComment} from "../models/tweeterComment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const getTweetComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {TweetId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addVideoComment = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { videoComment } = req.body;

    if(videoComment == null){
            return ApiError(400, "videoComment cannot be a empty String");
        }
    
        const newVideoComment = await Tweet.create({
            content: tweet,
            owner: req.user._id,
            video: videoId
        })
    
        if (!newVideoComment) {
            throw new ApiError(500, "Something went wrong while adding the video comment!");
          }
    
          return res
                 .status(201)
                 .json(new ApiResponse(200, "Tweet created successfully!", newVideoComment))
})

const addTweetComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { TweetId } = req.params;
    const { Comment } = req.body;

    if(Comment == null){
            return ApiError(400, "Tweet Comment cannot be a empty String");
        }
    
        const newTweetComment  = await TweetComment.create({
            content: Comment.trim(),
            owner: req.user._id,
            Tweet: TweetId
        })
    
        if (!newTweet) {
            throw new ApiError(500, "Something went wrong while creating the Tweet!");
          }
    
          return res
                 .status(201)
                 .json(new ApiResponse(200, "Tweet created successfully!", newTweetComment))
})

const updateVideoComment = asyncHandler(async (req, res) => {
    const { videoCommentId } = req.params;
    const { videoComment } = req.body;

    if(videoComment == null){
        return ApiError(400, "videoComment cannot be a empty String");
    }

    const updatedVideoComment = await Comment.findByIdAndUpdate(
        {
            _id: videoCommentId,
            owner: req.user._id
        },{
            $set: {content: videoComment}
        },
        {new: true}   
    )

    if(!updatedVideoComment){
        throw new ApiError(500, "Something went wrong while updating the video comment");
    }

    res.status(201)
       .json(new ApiResponse(200, "Video Comment updated successfully!"));
})

const updateTweetComment = asyncHandler(async (req, res) => {
    const { tweeterCommentId } = req.params;
    const { tweeterComment } = req.body;
    
    if(tweeterComment == null){
        return ApiError(400, "tweeterComment cannot be a empty String");
    }

    const updatedTweetComment = await TweetComment.findByIdAndUpdate(
        {
            _id: tweeterCommentId,
            owner: req.user._id
        },{
            $set: {content: tweeterComment}
        },
        {new: true}   
    )

    if(!updatedTweetComment){
        throw new ApiError(500, "Something went wrong while updating the tweet comment");
    }

    res.status(201)
       .json(new ApiResponse(200, "Tweet Comment updated successfully!"));
})

const deleteVidoComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { videoCommentId } = req.params;

    const deletedVideoComment = await Comment.findByIdAndDelete({
        _id: videoCommentId,
        owner: req.user._id
    })

    if(!deletedVideoComment){
        throw new ApiError(500, "Something went wrong while deleting the video comment");
    }

    res.status(201)
       .json(new ApiResponse(200, "Video Comment deleted successfully!"));
})

const deleteTweetComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { tweeterCommentId } = req.params;

    const deletedTweetComment = await TweetComment.findByIdAndDelete({
        _id: tweeterCommentId,
        owner: req.user._id
    })

    if(!deletedTweetComment){
        throw new ApiError(500, "Something went wrong while deleting the tweet comment");
    }

    res.status(201)
       .json(new ApiResponse(200, "Tweet Comment deleted successfully!"));
})

export {
    getVideoComments, 
    getTweetComments,
    addVideoComment,
    addTweetComment, 
    updateVideoComment,
    updateTweetComment,
    deleteVidoComment,
    deleteTweetComment
    }