import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const tokenValue =
      req.cookies?.accessToken?.replace("Bearer ", "") ||
      req.header("Authorization")?.replace("Bearer ", "");

      // const  tokenValue  = req.cookies?.accessToken?.replace("Bearer ", "");

      // const  tokenValue  = req.header("Authorization")?.replace("Bearer ", "");

    console.log("This is the token while receiving " + tokenValue?.replace("Bearer ", ""));

    if (!tokenValue) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(tokenValue, process.env.ACCESS_TOKENS_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.log("Not a user! \n");
      throw new ApiError(401, "/n ---------this is INTERNAL---------Invalid Access Token"); 
    }

    req.user = user;
    console.log("User identified")
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "/n ---------- this is while something went wront Invalid access token ");
  }
});
