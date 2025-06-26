import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    calculateVideoLikesDislikes,
    calculateCommentLikesDislikes,
    calculateTweetLikesDislikes,
    calculatePhotoLikesDislikes,
    togglePhotoLike,
    isLikedOrDisliked
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/toggle/p/:photoId").post(togglePhotoLike);
router.route("/videos").get(getLikedVideos);
router.route("/get/v/:videoId").get(calculateVideoLikesDislikes);
router.route("/get/c/:commentId").get(calculateCommentLikesDislikes);
router.route("/get/t/:tweetId").get(calculateTweetLikesDislikes);
router.route("/get/p/:photoId").get(calculatePhotoLikesDislikes);
router.route("/isLiked/:type/:id").get(isLikedOrDisliked);

export default router