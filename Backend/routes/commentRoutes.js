import express from "express"
import { protect } from "../middlewares/authMiddleware.js"
import {
  createComment,
  getAllComments,
  deleteComment,
} from "../controllers/commentController.js"

const router = express.Router()

// PUBLIC
router.get("/", getAllComments)

// PROTECTED
router.post("/", protect, createComment)
router.delete("/:id", protect, deleteComment)

export default router
