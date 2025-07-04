import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

    if (subscriberId.toString() === channelId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if(existingSubscription){
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"))
  }else{
     await Subscription.create({ subscriber: subscriberId, channel: channelId });
  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Subscribed successfully"));

  }

  
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribersDocs = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "_id name email");

  if (!subscribersDocs) {
    return res
    .status(200)
    .json(
      new ApiResponse(200, subscribersDocs, "No subscriber found")
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribersDocs, "Subscribers fetched successfully")
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "_id name email");

  if (!subscribedChannels || subscribedChannels.length === 0) {
    return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedChannels, "No subscribed channel found")
    );
  }

   return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );

  
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}