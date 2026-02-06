import express from "express";
import * as controller from "../controllers/course.js";

const router = express.Router();

router.get("/", controller.getCourses);
router.get("/:id", controller.getCourseById);
router.post("/upload", controller.uploadCourse);

router.post("/buy", controller.buyCourse);
router.get("/my/:userId", controller.getMyCourses);
router.get("/enrollment/:userId/:courseId", controller.getEnrollment);
router.post("/finish-material", controller.finishMaterial);
// router.post("/complete", controller.completeCourse);


export default router;
