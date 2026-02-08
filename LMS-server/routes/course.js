import express from "express";
import * as controller from "../controllers/course.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = file.mimetype.split("/")[0];
        const dir = `storage/${type === "audio" ? "audio" : "video"}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });


router.get("/", controller.getCourses);
router.get("/my/:userId", controller.getMyCourses);
router.get("/enrollment/:userId/:courseId", controller.getEnrollment);
router.get("/status/:userId/:courseId", controller.getEnrollmentStatus);
router.get("/instructor/:instructorId", controller.getInstructorDashboardData);
router.get("/:id", controller.getCourseById);

router.post("/upload", upload.any(), controller.uploadCourse);
router.post("/buy", controller.buyCourse);
router.post("/finish-material", controller.finishMaterial);
router.post("/payout", controller.requestPayout);

// router.post("/complete", controller.completeCourse);


export default router;
