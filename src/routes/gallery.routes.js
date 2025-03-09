import { Router } from 'express';
import { 
    createGallery, 
    addImagesToGallery, 
    getAllGalleries, 
    getGalleryById, 
    deleteImageFromGallery, 
    deleteGallery 
} from '../controllers/gallery.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

// Public Routes
router.route('/').get(getAllGalleries);
router.route('/:id').get(getGalleryById);

// Admin-Protected Routes
router.route('/create').post(verifyJWT, upload.array("images", 10), createGallery);
router.route('/add-images/:id').patch(verifyJWT, upload.array("images", 10), addImagesToGallery);
router.route('/delete/:id').delete(verifyJWT, deleteGallery);
router.route('/delete-image/:id/:imageId').delete(verifyJWT, deleteImageFromGallery);

export default router;
