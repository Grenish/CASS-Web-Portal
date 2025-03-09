import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createFaculty,
  deleteFaculty,
  getAllFaculties,
  getFacultyByName,
  updateFaculty,
} from "../controllers/faculty.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/name/:identifier").get(getFacultyByName);
router.route("/:id").put(verifyJWT, upload.single('image'), updateFaculty);
router.route("/:id").delete(verifyJWT, deleteFaculty);
router.route("/").get(getAllFaculties);
router.route("/create").post(verifyJWT, upload.single('image'), createFaculty);

export default router;
