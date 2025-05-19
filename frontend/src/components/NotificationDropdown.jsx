
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchNotifications, markAsRead } from "../redux/slices/notificationSlice"
import { FaBell, FaComment, FaHeart, FaEnvelope, FaUserPlus } from "react-icons/fa"
import moment from "moment"

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const dispatch = useDispatch()

  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications())
    }
  }, [isOpen, dispatch])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen && unreadCount > 0) {
      dispatch(markAsRead())
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <div className="p-2 bg-red-100 rounded-full"><FaHeart className="text-red-500" /></div>
      case "comment":
        return <div className="p-2 bg-blue-100 rounded-full"><FaComment className="text-blue-500" /></div>
      case "message":
        return <div className="p-2 bg-green-100 rounded-full"><FaEnvelope className="text-green-500" /></div>
      case "follow":
        return <div className="p-2 bg-purple-100 rounded-full"><FaUserPlus className="text-purple-500" /></div>
      default:
        return <div className="p-2 bg-gray-100 rounded-full"><FaBell className="text-gray-500" /></div>
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative text-gray-600 hover:text-indigo-600 focus:outline-none transition-colors p-1"
        aria-label="Notifications"
      >
        <FaBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold ">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto border border-gray-100">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 flex items-start transition-colors ${
                    !notification.read ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="mr-3 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{moment(notification.createdAt).fromNow()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <FaBell className="mx-auto text-gray-300 h-8 w-8 mb-2" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-2 text-center border-t border-gray-100">
              <button onClick={() => setIsOpen(false)} className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors">
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
