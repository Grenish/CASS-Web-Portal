import { Router } from 'express';
import { 
    createGallery,
    getAllGalleries, 
    getGalleryById,
    updateGallery,
    deleteGallery 
} from '../controllers/gallery.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

// Public Routes
router.route('/').get(getAllGalleries);
router.route('/:id').get(getGalleryById);

// Admin-Protected Routes
router.route('/create').post(verifyJWT, upload.single("imageUrl"), createGallery);
router.route('/update/:id').patch(verifyJWT, upload.single("imageUrl"), updateGallery);
router.route('/delete/:id').delete(verifyJWT, deleteGallery);

export default router;
