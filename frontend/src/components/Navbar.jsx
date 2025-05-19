// src/components/Navbar.jsx
"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logoutUser } from "../redux/slices/authSlice"
import { FaHome, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa"
import NotificationDropdown from "./NotificationDropdown"

export default function Navbar({ user, onLogout }) {
  const dispatch = useDispatch()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logoutUser())
    onLogout()
    setMobileOpen(false)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Branding */}
          <Link to="/feed" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SocialConnect
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-6">
                  <Link
                    to="/feed"
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <FaHome className="text-xl" />
                    <span className="font-medium">Feed</span>
                  </Link>
                  <NotificationDropdown />
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm group-hover:border-blue-100 transition-all"
                    />
                    <span className="text-gray-800 font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-800 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100">
          <div className="px-4 py-4 space-y-4">
            {user ? (
              <>
                {/* Profile Section */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">Active Now</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    to="/feed"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FaHome className="text-xl text-blue-600" />
                    <span className="font-medium">Feed</span>
                  </Link>

                  <NotificationDropdown 
                    isMobile 
                    onClose={() => setMobileOpen(false)}
                    className="w-full"
                  /> 
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-full hover:shadow-lg transition-shadow font-medium"
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