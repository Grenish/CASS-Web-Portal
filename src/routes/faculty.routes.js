import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addFacultyMember,
  deleteFacultyMember,
  getAllFaculties,
  updateFacultyMember,
} from "../controllers/faculty.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Get all faculty members (head and member)
router.route("/").get(getAllFaculties);

// Add a new faculty member (head or member)
router.route("/add").post(verifyJWT, upload.single('image'), addFacultyMember);

// Update a faculty member (head or member)
router
  .route("/update/:type/:id")
  .patch(verifyJWT, upload.single('image'), updateFacultyMember);

// Delete a faculty member (head or member)
router.route("/delete/:type/:id").delete(verifyJWT, deleteFacultyMember);

export default router;
