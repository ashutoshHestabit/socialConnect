import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { OAuth2Client } from "google-auth-library"
import asyncHandler from "express-async-handler"

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  })
}

/**
 * @route   POST /api/users/register
 * @desc    Register new user
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // 1) All fields required
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 2) Username: letters, numbers, underscores
  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    return res.status(400).json({
      message: "Username can only contain letters, numbers, and underscores"
    });
  }

  // 3) Email: basic validation
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // 4) Password: 6+ chars, ≥1 uppercase, ≥1 special, rest lowercase/digits
  const pwdRe = /^(?=.{6,}$)(?=.*[A-Z])(?=.*[!@#$%^&*])[a-z0-9A-Z!@#$%^&*]+$/;
  if (!pwdRe.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters, include one uppercase letter, one special character (!@#$%^&*), and the rest lowercase letters or numbers"
    });
  }

  // 5) Check duplicate email
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // 6) Hash and create
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({ username, email, password: hashed });
  if (user) {
    res.status(201).json({
      _id:       user._id,
      username:  user.username,
      email:     user.email,
      token:     generateToken(user._id),
      createdAt: user.createdAt,
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  // find user
  const user = await User.findOne({ email })
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid email or password")
  }
})

/**
 * @route   POST /api/users/google
 * @desc    Login or register with Google
 * @access  Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
  const { tokenId } = req.body

  // Verify Google token
  const ticket = await googleClient.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const { email_verified, email, name, picture } = ticket.getPayload()

  if (email_verified) {
    const user = await User.findOne({ email })

    if (user) {
      // User exists, log them in
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      // Create new user
      const password = await bcrypt.hash(email + process.env.JWT_SECRET, 10)
      const newUser = await User.create({
        username: name,
        email,
        password,
        profilePicture: picture,
      })

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token: generateToken(newUser._id),
      })
    }
  } else {
    res.status(400)
    throw new Error("Google authentication failed. Email not verified.")
  }
})

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password")
  res.json(users)
})

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password")
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  // only allow user to update themselves
  if (user._id.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Forbidden")
  }

  const { username, email, password } = req.body
  if (username) user.username = username
  if (email) user.email = email
  if (password) {
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
  }

  const updated = await user.save()
  res.json({
    _id: updated._id,
    username: updated.username,
    email: updated.email,
  })
})

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  // only allow user to delete themselves
  if (user._id.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Forbidden")
  }

  await User.deleteOne({ _id: user._id })
  res.json({ message: "User deleted" })
})
