import { useState } from "react";
import { useDispatch } from "react-redux";
import { deletePost, likePost, updatePost } from "../redux/slices/postSlice";
import { createComment, updateComment, deleteComment } from "../redux/slices/commentSlice";
import { FaComment, FaHeart, FaTrash, FaEdit, FaCheck, FaTimes, FaRegComment } from "react-icons/fa";

export default function PostList({ posts, userId, socket }) {
  const dispatch = useDispatch();
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [commentText, setCommentText] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [expandedPosts, setExpandedPosts] = useState({});

  const toggleComments = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleLike = (postId) => {
    dispatch(likePost(postId));
    socket.emit("likePost", postId);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePost(postId));
      socket.emit("deletePost", postId);
    }
  };

  const startPostEdit = (post) => {
    setEditingPostId(post._id);
    setEditedContent(post.content);
  };

  const cancelPostEdit = () => {
    setEditingPostId(null);
    setEditedContent("");
  };

  const submitPostEdit = (postId) => {
    if (editedContent.trim()) {
      dispatch(updatePost({ postId, content: editedContent }));
      socket.emit("updatePost", postId);
      cancelPostEdit();
    }
  };

  const handleCommentSubmit = (postId) => {
    if (commentText[postId]?.trim()) {
      dispatch(createComment({ post: postId, content: commentText[postId] }));
      socket.emit("newComment", { postId });
      setCommentText(prev => ({ ...prev, [postId]: "" }));
    }
  };

  const startCommentEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditedCommentContent(comment.content);
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditedCommentContent("");
  };

  const submitCommentEdit = () => {
    if (editedCommentContent.trim() && editingCommentId) {
      dispatch(updateComment({ commentId: editingCommentId, content: editedCommentContent }));
      socket.emit("updateComment", editingCommentId);
      cancelCommentEdit();
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      dispatch(deleteComment(commentId));
      socket.emit("deleteComment", commentId);
    }
  };

  const renderComments = (comments) => {
    return comments.map(comment => (
      <div key={comment._id} className="ml-6 mt-2 flex items-start gap-3">
        <img
          src={comment.author.profilePicture || `https://ui-avatars.com/api/?name=${comment.author.username}&background=random`}
          className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"
          alt={comment.author.username}
        />
        <div className="flex-1 bg-gray-50 p-3 rounded-xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{comment.author.username}</span>
            
            {comment.author._id === userId && (
              <div className="flex gap-2">
                {editingCommentId === comment._id ? (
                  <>
                    <button
                      onClick={cancelCommentEdit}
                      className="text-red-500 hover:text-red-700 text-xs transition-colors"
                    >
                      <FaTimes />
                    </button>
                    <button
                      onClick={submitCommentEdit}
                      className="text-green-500 hover:text-green-700 text-xs transition-colors"
                    >
                      <FaCheck />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startCommentEdit(comment)}
                      className="text-blue-500 hover:text-blue-700 text-xs transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700 text-xs transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {editingCommentId === comment._id ? (
            <input
              type="text"
              value={editedCommentContent}
              onChange={(e) => setEditedCommentContent(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              autoFocus
            />
          ) : (
            <p className="text-sm text-gray-600">{comment.content}</p>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {posts.map(post => (
        <div key={post._id} className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 ">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                alt={post.author.username}
              />
              <div>
                <h3 className="font-semibold text-gray-800">{post.author.username}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {post.author._id === userId && (
              <div className="flex space-x-2">
                {editingPostId === post._id ? (
                  <>
                    <button 
                      onClick={cancelPostEdit}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTimes />
                    </button>
                    <button
                      onClick={() => submitPostEdit(post._id)}
                      className="text-green-500 hover:text-green-700 transition-colors"
                    >
                      <FaCheck />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startPostEdit(post)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Post Content */}
          {editingPostId === post._id ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="3"
              autoFocus
            />
          ) : (
            <>
              <p className="mb-4 text-gray-700 leading-relaxed">{post.content}</p>
              {post.image && (
                <div className="w-full aspect-video mb-4 rounded-xl overflow-hidden shadow-sm">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
            </>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center space-x-1 transition-all duration-200 ${
                  post.likes.includes(userId) 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-red-400'
                }`}
              >
                <FaHeart className="w-5 h-5" />
                <span className="font-medium">{post.likes.length}</span>
              </button>

              <button
                onClick={() => toggleComments(post._id)}
                className={`flex items-center space-x-1 ${
                  expandedPosts[post._id] 
                    ? 'text-blue-500' 
                    : 'text-gray-500 hover:text-blue-400'
                } transition-colors duration-200`}
              >
                {expandedPosts[post._id] ? (
                  <FaComment className="w-5 h-5" />
                ) : (
                  <FaRegComment className="w-5 h-5" />
                )}
                <span className="font-medium">{post.comments.length}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {expandedPosts[post._id] && (
            <div className="mt-4">
              {post.comments.length > 0 && (
                <div className="mb-4 space-y-3">
                  {renderComments(post.comments)}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  value={commentText[post._id] || ""}
                  onChange={(e) => setCommentText(prev => ({
                    ...prev,
                    [post._id]: e.target.value
                  }))}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 px-4 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                />
                <button
                  onClick={() => handleCommentSubmit(post._id)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}