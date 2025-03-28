import { Router } from 'express';
import {
    addFeedback,
    getAllFeedback,
    deleteFeedback,
    deleteAllFeedback,
    getFeedbackByEvent
} from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Route to add feedback (verifyJWTed route)
router.route.post("/add", verifyJWT, addFeedback);

// Route to get all feedback (admin or content manager only)
router.route.get("/", verifyJWT, getAllFeedback);

// Route to delete a specific feedback by ID (admin only)
router.route.delete("/:id", verifyJWT, deleteFeedback);

// Route to delete all feedback (admin only)
router.route.delete("/", verifyJWT, deleteAllFeedback);

// Route to get feedback by event ID (admin or content manager only)
router.route.get("/event/:eventId", verifyJWT, getFeedbackByEvent);

export default router;




