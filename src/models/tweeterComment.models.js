import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const TweetcommentSchema = new Schema(
    {
         content: {
            type: String,
            trim:true,
            required: true
         },
         Tweet:{
            type: Schema.Types.ObjectId,
            ref:"Tweet"
         },
         owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
         }
    },{
        timestamps:true
    }
)

TweetcommentSchema.plugin(mongooseAggregatePaginate);

export const TweetComment = mongoose.model("TweetComment", TweetcommentSchema)