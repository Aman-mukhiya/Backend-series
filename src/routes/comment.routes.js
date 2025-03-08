import { Router } from 'express';
import {
    addVideoComment,
    addTweetComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addVideoComment);
router.route("/:TweetId").get(getTweetComments).post(addTweetComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router