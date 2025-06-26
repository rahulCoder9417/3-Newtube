import { Router } from "express";
import { postPhoto, deletePhoto, getPaginatedPhotos,updatePhoto } from "../controllers/photo.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; 

const router = Router();

router.use(verifyJWT);

router.route("/")
    .get(getPaginatedPhotos) 
    .post(upload.array("photos",10), postPhoto)


router.route("/:id")
    .delete(deletePhoto)
    .patch(upload.none(),updatePhoto)
export default router;
