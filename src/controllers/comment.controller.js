import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const comments = Comment.find({video:videoId}).limit(limit).populate('owner', 'name avatar');

    if(!comments){
        throw new ApiError(500, "Something went wrong while fetching the video comment");
    }

    res.status(201)
       .json(new ApiResponse(200, "Video Comments fetched successfully!"));

})

const getTweetComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {TweetId} = req.params
    const {page = 1, limit = 10} = req.query

    const comments = Comment.find({tweets:TweetId}).limit(limit).populate('owner', 'name avatar');

    if(!comments){
        throw new ApiError(500, "Something went wrong while fetching the tweets comment");
    }

    res.status(201)
       .json(new ApiResponse(200, "Tweets Comment fetched successfully!"));

})

const addVideoComment = asyncHandler(async (req, res) => {
    const { videoComment } = req.body;

    if(videoComment == null){
            return ApiError(400, "videoComment cannot be a empty String");
        }
    
        const newvideoComment = await Tweet.create({
            content: tweet
        })
    
        if (!newTweet) {
            throw new ApiError(500, "Something went wrong while creating the Tweet!");
          }
    
          return res
                 .status(201)
                 .json(new ApiResponse(200, "Tweet created successfully!"))
})

const addTweetComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addVideoComment,
    addTweetComment, 
    updateComment,
    deleteComment
    }