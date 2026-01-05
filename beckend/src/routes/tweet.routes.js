import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getTweetChildren,
    getPaginatedTweets,
    updateTweet,
    getTweetById,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(upload.none(),createTweet)
                 .get(getPaginatedTweets)
router.route("/child/:tweetId").get(getTweetChildren);
router.route("/tweet/:id").get(getTweetById);

router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router