import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
  },
  { timestamps: true },
)

commentSchema.index({ post: 1 })         
commentSchema.index({ author: 1 })      

export default mongoose.model("Comment", commentSchema)
