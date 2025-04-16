import { Router } from "express";
import {
    createRegister,
    getAllRegisterOfEvent,
    removeRegisterOfEvent,
    removeAllRegister,
    getRegisterByUser,
} from "../controllers/register.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/event/:eventId").get(verifyJWT,getAllRegisterOfEvent);
router.route("/create/:eventId").post(verifyJWT, createRegister); // Create a new register (protected) 
router.route("/user").get(verifyJWT, getRegisterByUser); // Get all registers of a user (protected) 
router.route("/delete/:eventId").delete(verifyJWT, removeRegisterOfEvent); // Delete a register by event ID (protected)
router.route("/delete").delete(verifyJWT, removeAllRegister); // Delete all registers (protected)

export default router;