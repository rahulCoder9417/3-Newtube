import { Router } from 'express';
import {
    addComment,
    addReply,
    deleteComment,
    getReplies,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:Id").get(getVideoComments).post(addComment);
router.route("/replies/:commentId").get(getReplies)
router.route("/replies/:Id/:commentId").post(addReply)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router