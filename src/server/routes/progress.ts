import { Router } from "express";
import {
  saveProgress,
  getProgress,
  updateProgress,
} from "../controllers/progressController";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post("/", authenticate, saveProgress);

router.get("/", authenticate, getProgress);

router.patch("/:topic", authenticate, updateProgress);

export default router;