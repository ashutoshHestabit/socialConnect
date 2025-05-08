// routes/userRoutes.js
import express from "express"
import { body, validationResult } from "express-validator"
import {
  registerUser,
  loginUser,
  googleAuth,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"

const router = express.Router()

// Public routes
router.post(
  "/register",
  [
    // username: not purely numeric, must include at least one letter
    body("username")
      .trim()
      .notEmpty().withMessage("Username is required")
      .custom(val => /[A-Za-z]/.test(val) && /^[A-Za-z0-9_]+$/.test(val))
      .withMessage("Username must include at least one letter and contain only alphanumeric or underscore"),

    // email: must be valid format
    body("email")
      .isEmail().withMessage("Must be a valid email address"),

    // password: min 6 chars
    body("password")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // return all error messages as an array
      return res.status(400).json({ errors: errors.array().map(e => e.msg) })
    }
    // call your controller
    return registerUser(req, res, next)
  }
)

router.post("/login", loginUser)
router.post("/google", googleAuth)

// Protected routes
router.use(protect)
router.get("/", getAllUsers)
router.get("/me", (req, res) => res.json(req.user))

router
  .route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser)

export default router
