import express from "express"
import { protect } from "../middlewares/authMiddleware.js"
import {
  createComment,
  getAllComments,
  deleteComment,
  updateComment
} from "../controllers/commentController.js"

const router = express.Router()
router.route("/:id")

// PUBLIC
router.get("/", getAllComments)

// PROTECTED
router.post("/", protect, createComment)
router.put('/:id', protect, updateComment)
router.delete("/:id", protect, deleteComment)

export default router
