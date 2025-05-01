import { Router } from "express";
import {
  getAllVideos,
  getSearchVideos,
  publishAVideo,
  getChannelVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // checks all ther users are verified

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
  );
 // get videos from the channel
  router.get("/channel", getChannelVideos);

   // get search videos from the channel
   router.get("/search", getSearchVideos);

   // get all videos from the channel
   router.get("/home", getAllVideos);

export default router;
