import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    validate: {
      validator: v => isNaN(v) && /^[a-zA-Z0-9_]+$/.test(v),
      message: "Username cannot be all numbers and must be alphanumeric"
    },
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Must be a valid email address"],
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters long"]
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);


userSchema.index({ email: 1 })          
userSchema.index({ username: 1 })       
