import { useEffect, useState, useRef, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPosts } from "../redux/slices/postSlice"
import { fetchComments } from "../redux/slices/commentSlice"
import { getUnreadCount } from "../redux/slices/notificationSlice"
import { setSelectedChat } from "../redux/slices/uiSlice"
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
    limit,
    total,
    hasMore,    // whether there's more to load
  } = useSelector((state) => state.posts)

  const {
    comments,
    loading: commentsLoading,
  } = useSelector((state) => state.comments)

  const { selectedChat } = useSelector((state) => state.ui)

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

  const handleSelectChat = (userId) => {
    dispatch(setSelectedChat(userId))
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

  // Show skeleton while any initial data is loading
  if (initialLoading || loading || commentsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto text-center animate-pulse text-gray-500">
          Loading…
        </div>
      </div>
    )
  }

  // Show error if posts fetch failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-red-600 font-semibold mb-4">{error}</h2>
          <button
            onClick={() => dispatch(fetchPosts({ skip: 0, limit }))}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Active Friends</h3>
            <UserList
              current={user._id}
              selected={selectedChat}
              onSelect={handleSelectChat}
            />
          </div>
        </aside>

        {/* Main */}
        <main className="md:col-span-2 space-y-4">
          {/* Chat */}
          {selectedChat && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <Chat socket={socket} userId={user._id} peerId={selectedChat} />
            </div>
          )}

          {/* New Post */}
          <PostForm socket={socket} />

          {/* Posts List with Infinite Scroll */}
          <div className="space-y-4">
            {posts.map((post, idx) => {
              const isLast = idx === posts.length - 1
              return (
                <div key={post._id} ref={isLast ? lastPostRef : null}>
                  <PostList
                    posts={[post]}
                    comments={comments}
                    userId={user._id}
                    socket={socket}
                  />
                </div>
              )
            })}
            {!hasMore && (
              <p className="text-center text-gray-500 mt-4">
                You’ve reached the end!
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
