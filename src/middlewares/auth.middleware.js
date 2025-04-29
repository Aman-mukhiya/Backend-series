import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

      const  tokenValue  = req.cookies?.accessToken?.replace("Bearer ", "");

    // console.log("This is the token while receiving " + tokenValue);

    if (!tokenValue) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(tokenValue, process.env.ACCESS_TOKENS_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "/n ---------this is INTERNAL---------Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "/n ---------- this is while something went wront Invalid access token ");
  }
});
