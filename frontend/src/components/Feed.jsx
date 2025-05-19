import { useEffect, useState, useRef, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPosts } from "../redux/slices/postSlice.js"
import { fetchComments } from "../redux/slices/commentSlice.js"
import { getUnreadCount } from "../redux/slices/notificationSlice.js"
import { setSelectedChat } from "../redux/slices/uiSlice.js"
import UserList from "./UserList.jsx"
import Chat from "./Chat.jsx"
import PostForm from "./PostForm.jsx"
import PostList from "./PostList.jsx"

export default function Feed({ socket }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  // Pull exactly your slice fields:
  const {
    posts,
    loading,    // whether we're fetching posts
    error,      // any fetch error
    skip,       // how many we've already loaded
    limit,      // how many to load at once
    hasMore,    // whether there's more to load
  } = useSelector((state) => state.posts)

  const {
    comments,
    loading: commentsLoading,
  } = useSelector((state) => state.comments)

  const { selectedChat } = useSelector((state) => state.ui)
  const [selectedUser, setSelectedUser] = useState(null)

  // single local loading flag for initial mount
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    async function loadAll() {
      setInitialLoading(true)
      try {
        await Promise.all([
          dispatch(fetchPosts({ skip: 0, limit })).unwrap(),
          dispatch(fetchComments()).unwrap(),
          dispatch(getUnreadCount()).unwrap(),
        ])
      } catch (err) {
        console.error("Error loading feed data:", err)
      } finally {
        setInitialLoading(false)
      }
    }
    loadAll()
  }, [dispatch, limit])


  const handleSelectChat = (userId, username) => {
    dispatch(setSelectedChat(selectedChat === userId ? null : userId))
    setSelectedUser(username)
  }

  // Intersection observer for infinite scroll
  const observer = useRef()
  const lastPostRef = useCallback(
    (node) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          dispatch(fetchPosts({ skip, limit }))
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore, skip, limit, dispatch]
  )

  // Show error if posts fetch failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-red-100 text-center">
          <h2 className="text-red-600 font-semibold mb-4">{error}</h2>
          <button
            onClick={() => dispatch(fetchPosts({ skip: 0, limit }))}
            className="bg-blue-600 text-white px-6 py-2 rounded-full transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <aside className="space-y-6 md:sticky md:top-20 self-start">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded-full mr-2 inline-block"></span>
              Friends
            </h3>
            <UserList
              current={user._id}
              selected={selectedChat}
              onSelect={handleSelectChat}
            />
          </div>
        </aside>

        {/* Main */}
        {initialLoading || loading ? (
          <div className="md:col-span-2 flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-700">
                Loading your feed...
              </p>
            </div>
          </div>
        ) : (
          <main className="md:col-span-2 space-y-6">
            {/* Chat */}
            {selectedChat && (
              <div className="overflow-hidden transition-all duration-300 ease-in-out">
                <Chat socket={socket} userId={user._id} peerId={selectedChat} selectedUser={selectedUser} />
              </div>
            )}

            {/* New Post */}
            <PostForm socket={socket} />

            {/* Posts List with Infinite Scroll */}
            <div className="space-y-6">
              {posts.map((post, idx) => {
                const isLast = idx === posts.length - 1
                return (
                  <div 
                    key={post._id} 
                    ref={isLast ? lastPostRef : null}
                    className="transform transition-all duration-300 "
                  >
                    <PostList
                      posts={[post]}
                      comments={comments}
                      userId={user._id}
                      socket={socket}
                    />
                  </div>
                )
              })}
              
              {!hasMore && posts.length > 0 && (
                <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 py-8 px-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">You've reached the end of your feed!</p>
                  <p className="text-gray-400 text-sm mt-1">Check back later for new posts</p>
                </div>
              )}
              
              {loading && !initialLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  )
}