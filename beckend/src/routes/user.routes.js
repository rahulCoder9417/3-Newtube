import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginViaAccessToken,
    updateAccountDetails,
    removeFromWatchHistory,
    addCloseFriend,
    removeCloseFriend,
    getCloseFriends,
    getUserById
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.none(),
    registerUser
    )

router.route("/login").post(loginUser)

router.route("/login-via-access-token").post(loginViaAccessToken)
//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/getUser/:id").get(verifyJWT,  getUserById)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,  upload.none(),changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, upload.none(),updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.none(), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.none(), updateUserCoverImage)

router.route("/c/:id").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
router.route("/closefriend/:userId")
        .get(verifyJWT, getCloseFriends)
        .put(verifyJWT, addCloseFriend)
        .delete(verifyJWT, removeCloseFriend)
router.route("/remove-video-history/:videoId").get(verifyJWT, removeFromWatchHistory)


export default router