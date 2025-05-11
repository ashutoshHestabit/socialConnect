// routes/postRoutes.js
import express from "express"
import { protect } from "../middlewares/authMiddleware.js"
import multer from "multer"
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  updatePost
} from "../controllers/postController.js"

// 1. Memory storage so `req.file.buffer` is available
const storage = multer.memoryStorage()
const upload  = multer({ storage })

const router = express.Router()

// Public endpoints
router.get("/",           getAllPosts)
router.get("/:id",        getPostById)

// Protected endpoints
router.post("/",          protect, upload.single("image"), createPost)
router.put('/:id', protect, upload.single('image'), updatePost)
router.put("/:id/like",   protect, likePost)
router.delete("/:id",     protect, deletePost)

export default router
