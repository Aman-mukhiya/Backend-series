import { Router } from "express";
import {
         getAllVideos,
         publishAVideo,
         getVideoById,
         updateVideo,
         deleteVideo,
         togglePublishStatus
       } from "../models/video.model"
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";


const router = Router();
router.use(verifyJWT); // checks all ther users are verified

router
      .route("/")
      .get(getAllVideos)
      .post( upload.fields([{name:"videoFile",maxCount:1},{name:"thumbnail",maxCount:1}]), publishAVideo );

 
