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

// Routes
router.route('/add/:eventId').post(verifyJWT, addFeedback); // Add feedback (protected)
router.route('/').get(verifyJWT, getAllFeedback)   // Get all feedback (protected)
router.route('/').delete(verifyJWT, deleteAllFeedback); // Delete all feedback (protected)
router.route('/:id').delete(verifyJWT, deleteFeedback); // Delete specific feedback by ID (protected)
router.route('/event/:eventId').get(verifyJWT, getFeedbackByEvent); // Get feedback by event ID (protected)

export default router;




