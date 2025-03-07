import { Router } from 'express';
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
} from '../controllers/event.controller.js';

import { verifyJWT } from '../middleware/auth.middleware.js';
import {upload} from '../middleware/multer.middleware.js';

const router = Router();
// const upload = multer({ dest: 'uploads/' }); // Temporary storage before Cloudinary upload

// Public Routes
router.route('/').get(getAllEvents);
router.route('/:identifier').get(getEventById);

// Admin-Protected Routes
router.route('/create').post(verifyJWT, upload.single('media'), createEvent);
router.route('/update/:id').patch(verifyJWT, upload.single('media'), updateEvent);
router.route('/delete/:id').delete(verifyJWT, deleteEvent);

export default router;
