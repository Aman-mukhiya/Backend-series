import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // if you have a youtube channel you will see your subscribers here 
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // this is the person watching and his list of channels he has subscibed to
        ref:"User"
    }
}, {timestamps:true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)