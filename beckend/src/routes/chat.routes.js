import { Router } from 'express';
import {
    createChatModel,
    editMessage,
    deleteMessage,
    getAllChats,
    typeOfChat,
    deleteChatModel,
    sendMessage,
    removeAdminFromChat,
    removeOwnerFromChat,
    addAdminToChat,
    addOwnerToChat
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.use(verifyJWT);


router.route("/")
    .post(createChatModel)
    .put(editMessage)
    .delete(deleteMessage)
    .get(sendMessage)

router.route("/chat/:chatId")
        .get(getAllChats)
        .post(typeOfChat)
        .delete(deleteChatModel);



router.route("/toggle-user/")
        .post(addOwnerToChat)
        .get(removeOwnerFromChat);


router.route("/toggleadmin/")
        .post(addAdminToChat)
        .get(removeAdminFromChat);

export default router;
