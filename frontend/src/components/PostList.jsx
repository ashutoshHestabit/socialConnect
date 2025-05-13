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

  // Post handlers
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

  // Comment handlers
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

  // Render comments for a post
  const renderComments = (comments) => {
    return comments.map(comment => (
      <div key={comment._id} className="ml-6 mt-2 flex items-start space-x-2">
        <img
          src={comment.author.profilePicture || `https://ui-avatars.com/api/?name=${comment.author.username}&background=random`}
          className="w-6 h-6 rounded-full"
          alt={comment.author.username}
        />
        <div className="flex-1 bg-gray-100 p-2 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{comment.author.username}</span>
            
            {comment.author._id === userId && (
              <div className="flex space-x-2">
                {editingCommentId === comment._id ? (
                  <>
                    <button
                      onClick={cancelCommentEdit}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      <FaTimes />
                    </button>
                    <button
                      onClick={submitCommentEdit}
                      className="text-green-500 hover:text-green-700 text-xs"
                    >
                      <FaCheck />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startCommentEdit(comment)}
                      className="text-blue-500 hover:text-blue-700 text-xs"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700 text-xs"
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
              className="w-full p-1 text-sm border rounded mt-1"
              autoFocus
            />
          ) : (
            <p className="text-sm">{comment.content}</p>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <div key={post._id} className="bg-white rounded-xl shadow-sm p-4">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
                className="w-10 h-10 rounded-full"
                alt={post.author.username}
              />
              <div>
                <h3 className="font-semibold">{post.author.username}</h3>
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
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                    <button
                      onClick={() => submitPostEdit(post._id)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <FaCheck />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startPostEdit(post)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-red-500 hover:text-red-700"
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
              className="w-full p-2 border rounded mb-4"
              rows="3"
              autoFocus
            />
          ) : (
            <>
              <p className="mb-4">{post.content}</p>
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
            </>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center space-x-1 ${
                  post.likes.includes(userId) ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                <FaHeart />
                <span>{post.likes.length}</span>
              </button>

              <button
                onClick={() => toggleComments(post._id)}
                className="flex items-center space-x-1 text-gray-500"
              >
                {expandedPosts[post._id] ? <FaComment /> : <FaRegComment />}
                <span>{post.comments.length}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {expandedPosts[post._id] && (
            <div className="mt-4">
              {post.comments.length > 0 && (
                <div className="mb-4 space-y-2">
                  {renderComments(post.comments)}
                </div>
              )}

              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="text"
                  value={commentText[post._id] || ""}
                  onChange={(e) => setCommentText(prev => ({
                    ...prev,
                    [post._id]: e.target.value
                  }))}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                />
                <button
                  onClick={() => handleCommentSubmit(post._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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