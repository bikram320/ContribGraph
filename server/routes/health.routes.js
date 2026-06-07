import express from "express";
import { basicHealth, detailedHealth, ping } from "../controllers/health.controller.js";

const router = express.Router();

router.get("/", basicHealth);
router.get("/detailed", detailedHealth);
router.get("/ping", ping);

export default router;