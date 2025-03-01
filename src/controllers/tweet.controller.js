import mongoose, { ObjectId } from "mongoose";
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { tweet } = req.body;

    if(tweet == null){
        return ApiError(400, "Tweet cannot be a empty String");
    }

    const newTweet = await Tweet.create({
        content: tweet
    })

    if (!newTweet) {
        throw new ApiError(500, "Something went wrong while creating the Tweet!");
      }

      return res
             .status(201)
             .json(new ApiResponse(200, "Tweet created successfully!"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.params.userId;

    const tweets = await Tweet.find({owner: userId}).limit(10).populate('owner', 'name email');

    if(!tweets){
        throw new ApiError(500, "something went wrong while fetchin the tweets");
    }

    return res.status(201).json(new ApiResponse(200, tweets, "Tweets fetched successfully!"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const tweetId = req.params.tweetId;
    const { content } = req.body;

    const updateTweet = await Tweet.findOneAndUpdate(
       
        { _id: ObjectId(tweetId) }, // Find by ID
        { $set: { content } },                
        { new: true } 
         
    )

    if(!updateTweet){
        throw new ApiError(500, "Something went wrong while updating the tweet");
    }

    res.status(200).json(new ApiResponse(200, "Tweet Updaated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const tweetId = req.params.tweetId;

    const deletedTweet = await Tweet.deleteOne({_id:tweetId});

    if(deletedTweet.deletedCount === 0){
        throw new ApiError(501, "Something went wrong while deleting the tweet");
    }

    res.status(200).json(new ApiResponse(200, "Tweet Deleted successfully"));

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}