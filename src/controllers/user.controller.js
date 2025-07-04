import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = "Bearer "+user.generateAccessToken();
    console.log("Token is "+ accessToken);
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generation refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  //console.log("email: "+ email)

  //console.log(`\n This is req.body ${req.body}`)
  //console.log(`\n This is req.files ${req.files}`)

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field is required!");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required!");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  // validate email and password
  // check if the user exists in db
  // generate access token and refresh token send with cookie
  // save access token and refresh token in db
  // redirect user

  const { email, username, password } = req.body;

  // if ( !(username || !email) ) {
  //   throw new ApiError(400, "username or email is required!");
  // }

  if (!username && !email) {
    throw new ApiError(400, "username or email is required!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exists!");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid users credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfuly"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User Logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unathorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken?._id);
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used!");
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,{ 
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        },
        "Access token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token")
  }

});

const changeCurrentPassword = asyncHandler( async(req, res) => {
  
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
 
 if(!isPasswordCorrect){
  throw new ApiError (404, "Invalid old password!");
 }

 user.password = newPassword;
 await user.save( {validateBeforeSave: false} )

 return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully  "))
});

const getCurrentUser = asyncHandler( async(req,res) => {
    
  return res
    .status(200)
    .json( new ApiResponse (
      200,
      req.user,
      "Current User fetched successfully!"
    ));
});

const updateAccountDetails = asyncHandler ( async(req, res) => {
  const {fullName, email } = req.body;

  if(!fullName || !email) {
    throw new ApiError(400, "All fields are required!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email
      }
    },
    {new: true}
  ).select("-password")

  return res
         .status(200)
         .json(new ApiResponse(200, user, "Account details updated successfully!" ))
});

const updateUserAvatar = asyncHandler( async(req, res) => {

  const avatarLocalPath = req.file?.path;

  if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if(!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user_id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "Avatar updated successfully!")
  )
});

const updateUserCoverImage = asyncHandler( async(req, res) => {

  const CoverImageLocalPath = req.file?.path;

  if(!CoverImageLocalPath) {
    throw new ApiError(400, " Cover Image file is missing")
  }

  const coverImage = await uploadOnCloudinary(CoverImageLocalPath);

  if(!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coverImage")
  }

  const user = await User.findByIdAndUpdate(
    req.user_id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "Cover Image updated successfully!")
  )
});

const getUserChannelProfile = asyncHandler( async (req,res) => {
  
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError (400, "user name is missing!");
  }

    const channel = await User.aggregate([
      {
        $match:{
          username: username?.toLowerCase()
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localfield: "_id",
          foreignField: "channel",
          as: "Subscribers"
        },
      },
      {
        $lookup:{
          from: "subscriptions",
          localfield: "_id",
          foreignField: "subscriber",
          as: "SubscribedTo"
        }
      },
      {
        $addField: {
          subscribersCount: {
            $size: "$subscribers"
          },
          channelsSubscribedToCount: {
            $size: "$SubscribedTo"
          },
          isSubscribed:{
            $cond:{
              if: {$in: [req.user?._id, "$subscribers.subscriber"]},
              then:true,
              else: false
            }
          }
        }
      },
      {
        $project: {
          fullname: 1,
          username: 1,
          subscribersCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1
        }
      }
    ])

    if (!channel?.length){
      throw new ApiError(404, "Channel does not exits");
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200, "user channel fetched successfully")
    )
  }
);

const getWatchHistory = asyncHandler( async (req, res) => {
     const user = await User.aggregate([
      {
         $match: {
          _id: new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
        $lookup: {
              from: "videos",
              localField: "watchHistory",
              foreignField:"_id",
              as: "watchHistory",
              pipeline:[
                {
                     $lookup:{
                      from: "users",
                      localField: "owner",
                      foreignField:"_id",
                      as: "owner",
                      pipeline: [{
                        $project:{
                          fullName: 1,
                          username: 1,
                          avatar: 1
                        }
                      }]
                     }
                },
                {
                  $addFields:{
                    owner:{
                      $first:"$owner"
                    }
                  }
                }
              ]
        }
      }
     ])

     return res
     .status(200)
     .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully"
      )
     )
})

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
 };
