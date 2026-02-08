import express from "express";
import * as controller from "../controllers/user.js";

const router = express.Router();

router.get("/", controller.getAllUsers);
router.get("/stats/:userId", controller.getUserStats);
router.get("/:id", controller.getUserById);
router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/setup-bank", controller.setupBank);
router.get("/balance/:accountNumber", controller.getBalance);


export default router;