import Comment from "../models/Comment.js"
import Post from "../models/Post.js"
import Notification from "../models/Notification.js"

export const createComment = async (req, res) => {
  try {
    const { post, content } = req.body
    const author = req.user._id

    if (!post || !content) {
      return res.status(400).json({ message: "Post and content are required" })
    }

    const postExists = await Post.findById(post)

    if (!postExists) return res.status(404).json({ message: "Post not found" })

    const comment = await Comment.create({ post, author, content })

    // Populate author information
    const populatedComment = await Comment.findById(comment._id).populate("author", "username email")

    // Update post with new comment
    await Post.findByIdAndUpdate(post, {
      $push: { comments: comment._id },
    })

    // Create notification if author is not the post author
    if (postExists.author.toString() !== author.toString()) {
      const notification = await Notification.create({
        recipient: postExists.author,
        sender: author,
        type: "comment",
        post: post,
        comment: comment._id,
        text: `${req.user.username} commented on your post`,
      })

      // Emit notification event
      const io = req.app.get("io")
      if (io) {
        io.emit("newNotification", notification)
      }
    }

    res.status(201).json(populatedComment);

    const io = req.app.get("io")
    io.emit("newComment", populatedComment) // Notify all clients
  } catch (error) {
    res.status(500).json({ message: "Failed to create comment", error: error.message })
  }
}

export const getAllComments = async (req, res) => {
  try {
    const { postId } = req.query

    const query = {}
    if (postId) {
      query.post = postId
    }

    const comments = await Comment.find(query)
      .populate("post", "content")
      .populate("author", "username email")
      .sort({ createdAt: -1 })

    res.json(comments)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments", error: error.message })
  }
}

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) return res.status(404).json({ message: "Comment not found" })

    // Check if user is authorized to delete
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" })
    }

    // Remove comment from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    })

    await Comment.findByIdAndDelete(req.params.id)

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error: error.message })
  }
}
