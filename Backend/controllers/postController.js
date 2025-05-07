// controllers/postController.js
import dotenv from 'dotenv';
dotenv.config();  
import Post from "../models/Post.js"
import Comment from '../models/Comment.js';
import Notification from "../models/Notification.js"
import { v2 as cloudinary } from "cloudinary"


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * @desc    Create a post (text + optional image)
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res) => {
  try {
    const { content } = req.body
    const author = req.user._id
    let imageUrl

    if (req.file) {
      try {
        // Convert buffer to base64 for Cloudinary upload
        const base64Image = req.file.buffer.toString("base64")
        const dataURI = `data:${req.file.mimetype};base64,${base64Image}`

        const result = await cloudinary.uploader.upload(dataURI, {
          resource_type: "auto",
        })
        imageUrl = result.secure_url
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError)
        return res.status(500).json({
          message: "Failed to upload image",
          error: uploadError.message,
        })
      }
    }

    if (!content && !imageUrl) {
      return res.status(400).json({ message: "Content or image is required" })
    }

    const post = await Post.create({ content, author, image: imageUrl })

    // Populate author information
    const populatedPost = await Post.findById(post._id).populate("author", "username email")

    res.status(201).json(populatedPost)

    req.app.get("io").emit("newPost", populatedPost)
  } catch (error) {
    console.error("Post creation error:", error)
    res.status(500).json({
      message: "Failed to create post",
      error: error.message,
    })
  }
}

// controllers/postController.js
export const getAllPosts = async (req, res) => {
  try {
    // 1) Parse pagination params
    const skip  = parseInt(req.query.skip,  10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;

    // 2) Query posts with skip & limit
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username email" },
      });

    // 3) Total count for “hasMore”
    const total = await Post.countDocuments();

    // 4) Respond with both
    res.json({ posts, total });
  } catch (error) {
    console.error("Pagination error:", error);
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};


export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username email",
        },
      })

    if (!post) return res.status(404).json({ message: "Post not found" })

    res.json(post)
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error: error.message })
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) return res.status(404).json({ message: "Post not found" })

    // Check if user is authorized to delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" })
    }


    await Comment.deleteMany({ post: post._id });
    await Notification.deleteMany({ post: post._id });

    await Post.findByIdAndDelete(req.params.id)

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message })
  }
}

// In your postController.js
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: "Post not found" })

    const userId = req.user._id

    // Check if user already liked
    const index = post.likes.indexOf(userId)
    const isLiking = index === -1

    if (isLiking) {
      post.likes.push(userId)

      // Create notification if author is not the one liking
      if (post.author.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          post: post._id,
          text: `${req.user.username} liked your post`,
        })

        // Emit notification event
        const io = req.app.get("io")
        if (io) {
          io.emit("newNotification", notification)
        }
      }
    } else {
      post.likes.splice(index, 1)
    }

    const updatedPost = await post.save()

    // Populate author information
    const populatedPost = await Post.findById(updatedPost._id)
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username email",
        },
      })

    res.json(populatedPost)

    // Emit socket event
    const io = req.app.get("io")
    io.emit("updatePost", populatedPost)
  } catch (error) {
    res.status(500).json({
      message: "Error updating likes",
      error: error.message,
    })
  }
}
