// src/components/Navbar.jsx
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logoutUser } from "../redux/slices/authSlice"
import { getUnreadCount } from "../redux/slices/notificationSlice"
import { FaHome, FaUserFriends, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa"
import NotificationDropdown from "./NotificationDropdown"

export default function Navbar({ user, onLogout }) {
  const dispatch = useDispatch()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (user) {
      dispatch(getUnreadCount())
      const interval = setInterval(() => dispatch(getUnreadCount()), 60000)
      return () => clearInterval(interval)
    }
  }, [user, dispatch])

  const handleLogout = () => {
    dispatch(logoutUser())
    onLogout()
    setMobileOpen(false)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Branding */}
          <Link to="/feed" className="flex items-center text-2xl font-bold text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            </svg>
            SocialConnect
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/feed" className="flex items-center text-gray-600 hover:text-blue-600">
                  <FaHome className="mr-1" /> Feed
                </Link>
                <NotificationDropdown />
                <div className="flex items-center space-x-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-800 font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm hover:bg-red-200"
                >
                  <FaSignOutAlt className="mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-800 focus:outline-none"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <Link
                  to="/feed"
                  onClick={() => setMobileOpen(false)}
                  className="block text-gray-700 hover:text-blue-600"
                >
                  <FaHome className="inline mr-1" /> Feed
                </Link>
                
                <NotificationDropdown isMobile onClose={() => setMobileOpen(false)} />
                <div className="flex items-center space-x-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-800 font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-gray-700 hover:text-red-600 flex items-center px-2 py-1"
                >
                  <FaSignOutAlt className="mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
