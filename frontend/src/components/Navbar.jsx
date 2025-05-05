"use client"

import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logoutUser } from "../redux/slices/authSlice"
import { getUnreadCount } from "../redux/slices/notificationSlice"
import { FaHome, FaUserFriends, FaSignOutAlt } from "react-icons/fa"
import NotificationDropdown from "./NotificationDropdown"

export default function Navbar({ user, onLogout }) {
  const dispatch = useDispatch()

  useEffect(() => {
    if (user) {
      dispatch(getUnreadCount())

      // Refresh notification count every minute
      const interval = setInterval(() => {
        dispatch(getUnreadCount())
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [user, dispatch])

  const handleLogout = () => {
    dispatch(logoutUser())
    onLogout()
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/feed" className="text-2xl font-bold text-blue-600 flex items-center">
              <span className="text-blue-600 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                </svg>
              </span>
              SocialConnect
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-6">
              <Link to="/feed" className="text-gray-600 hover:text-blue-600 flex items-center">
                <FaHome className="mr-1" /> Feed
              </Link>
              <Link to="/friends" className="text-gray-600 hover:text-blue-600 flex items-center">
                <FaUserFriends className="mr-1" /> Friends
              </Link>

              <NotificationDropdown />

              <div className="flex items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                  className="w-8 h-8 rounded-full mr-2"
                  alt="Profile"
                />
                <span className="text-gray-800 font-medium">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm hover:bg-red-200 flex items-center"
              >
                <FaSignOutAlt className="mr-1" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
