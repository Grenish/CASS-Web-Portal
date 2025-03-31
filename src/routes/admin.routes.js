import { Router } from 'express';
import {
    changeCurrentPassword,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken,
    registerAdmin,
    validateToken
} from '../controllers/user.controllers.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();


router.route("/registerAdmin").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/logout").post(verifyJWT, logoutAdmin);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/validate-token").get(verifyJWT, validateToken);

export default router;
