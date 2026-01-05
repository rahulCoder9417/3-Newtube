import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getRandomData,
    getVideoById,
    getVideosByType,
    incrementViews,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"


import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT);//  Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.none(),
        publishAVideo
    );

router.route("/:videoId")
      .get(incrementViews)
      
router.route("/type/:type")
        .get(getVideosByType)

router
    .route("/videoManupulate/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.none(), updateVideo);

router.route("/videoManupulate/toggle/:videoId").patch(togglePublishStatus);
router.route("/getrandom/:sample").get(getRandomData);

export default router