
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createPost } from "../redux/slices/postSlice"
import { FaImage, FaPaperPlane, FaTimes } from "react-icons/fa"

export default function PostForm({ socket }) {
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [error, setError] = useState("")

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.posts)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      return setError("Image must be under 5 MB")
    }

    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim() && !imageFile) {
      return setError("Write something or add an image")
    }

    setError("")

    try {
      const formData = new FormData()
      formData.append("content", content)
      if (imageFile) formData.append("image", imageFile)

      await dispatch(createPost(formData)).unwrap()

      // Reset form
      setContent("")
      setImageFile(null)
      setPreview("")
    } catch (err) {
      setError(err.message || "Failed to create post")
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6 transition hover:shadow">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Create Post</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`}
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none transition"
            rows="3"
          />
        </div>

        {preview && (
          <div className="relative mt-2 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-60 w-full object-contain"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null)
                setPreview("")
              }}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-100 transition-colors"
              aria-label="Remove image"
            >
              <FaTimes size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <label className="flex items-center cursor-pointer text-gray-600 hover:text-indigo-600 p-2 rounded-md hover:bg-gray-50 transition-colors">
            <FaImage className="mr-2" />
            <span className="text-sm font-medium">Add Photo</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>

          <button
            type="submit"
            disabled={loading || (!content.trim() && !imageFile)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            ) : (
              <>
                <FaPaperPlane className="mr-2" /> Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}