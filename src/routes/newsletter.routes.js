import {
    createNewsletter,
    getAllNewsletters,
    updateNewsletter,
    deleteNewsletter,
} from "../controllers/newsletter.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router();
// Public Routes
router.route("/").get(getAllNewsletters);
// Admin-Protected Routes  
router.route("/create").post(verifyJWT, upload.single("media"), createNewsletter);
router.route("/update/:id").patch(verifyJWT, upload.single("media"), updateNewsletter);
router.route("/delete/:id").delete(verifyJWT, deleteNewsletter);

export default router;