import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
)

userSchema.index({ email: 1 })          
userSchema.index({ username: 1 })       

export default mongoose.model("User", userSchema)
