
import { useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Navbar from "./components/Navbar.jsx"
import Login from "./components/Login.jsx"
import Register from "./components/Register.jsx"
import Feed from "./components/Feed.jsx"
import Footer from "./components/Footer.jsx"
import { setToken } from "./api.js"
import { addNewPost, updatePostInState, updatePostComments } from "./redux/slices/postSlice"
import { addNewComment } from "./redux/slices/commentSlice"
import { addNewNotification } from "./redux/slices/notificationSlice"
import { receiveMessage } from "./redux/slices/messageSlice"

// Initialize socket connection
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ;

export default function App() {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) {
      setToken(user.token)
      socket.emit("register-user", user._id)

      socket.on("newPost", (post) => {
        dispatch(addNewPost(post))
      })

      socket.on("updatePost", (post) => {
        dispatch(updatePostInState(post))
      })

      socket.on("newComment", (comment) => {
        dispatch(createComment.fulfilled(comment));
      });

      socket.on("newNotification", (notification) => {
        dispatch(addNewNotification(notification))
      })

      socket.on("newMessage", (message) => {
        dispatch(receiveMessage(message))
      })
    }

    return () => {
      if (user) {
        socket.emit("unregister-user")
        socket.off("newPost")
        socket.off("updatePost")
        socket.off("newComment")
        socket.off("newNotification")
        socket.off("newMessage")
      }
    }
  }, [user, dispatch])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    socket.emit("unregister-user")
    navigate("/login")
    window.location.reload()
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to={user ? "/feed" : "/login"} replace />} />
            <Route path="/login" element={user ? <Navigate to="/feed" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/feed" /> : <Register />} />
            <Route path="/feed" element={user ? <Feed socket={socket} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        <Footer />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </GoogleOAuthProvider>
  )
}