// src/components/Register.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, googleLogin, clearError } from "../redux/slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [username,        setUsername]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const { loading, user, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    if (user) navigate("/feed");
  }, [dispatch, user, navigate]);

  // Regexes
  const usernameRe = /^[A-Za-z0-9_]+$/;
  const emailRe    = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const pwdRe      = /^(?=.{6,}$)(?=.*[A-Z])(?=.*[!@#$%^&*])[a-z0-9A-Z!@#$%^&*]+$/;

  const validateForm = () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (!usernameRe.test(username)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return false;
    }
    if (!emailRe.test(email)) {
      toast.error("Invalid email address format");
      return false;
    }
    if (!pwdRe.test(password)) {
      toast.error(
        "Password must be ≥6 chars, include one uppercase letter, one special character (!@#$%^&*), and rest lowercase letters or numbers"
      );
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const resultAction = await dispatch(
        registerUser({ username, email, password })
      ).unwrap();

      toast.success("Registration successful! Redirecting…");
      setTimeout(() => navigate("/feed"), 1000);
    } catch (err) {
      toast.error(err || "Registration failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      try {
        await dispatch(googleLogin(credentialResponse.credential)).unwrap();
      } catch {
        toast.error("Google sign-up failed. Please try again.");
      }
    } else {
      toast.error("Google sign-up failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="johndoe"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-gray-500">Or continue with</span>
        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google sign-up failed")}
            theme="filled_blue"
            text="signup_with"
            shape="rectangular"
            width="280"
          />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
