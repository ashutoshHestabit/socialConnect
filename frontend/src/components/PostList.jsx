// src/components/PostList.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { likePost, deletePost, updatePostComments } from "../redux/slices/postSlice";
import { createComment } from "../redux/slices/commentSlice";
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaPaperPlane } from "react-icons/fa";
import moment from "moment";
import { toast } from "react-toastify";

export default function PostList({ posts, userId, socket }) {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  // Handle liking a post
  const handleLike = async (postId) => {
    try {
      await dispatch(likePost(postId)).unwrap();
    } catch (err) {
      toast.error("Failed to like post");
    }
  };

  // Handle deleting a post
  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await dispatch(deletePost(postId)).unwrap();
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  // Handle toggling comments
  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  
  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      const newComment = await dispatch(
        createComment({ post: postId, content: text })
      ).unwrap();

      setCommentText(p => ({ ...p, [postId]: "" }));
      toast.success("Comment added");
    } catch (err) {
      console.error("createComment error:", err);
      toast.error(err.message || "Failed to add comment");
    }
  };
  

  return (
    <div className="space-y-6">
      {posts.length ? (
        posts.map((post) => {
          const isAuthor = post.author._id === userId;
          return (
            <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden relative">
              {/* Delete button */}
              {isAuthor && (
                <button
                  onClick={() => handleDelete(post._id)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                  title="Delete post"
                >
                  <FaTrash />
                </button>
              )}

              {/* Post header */}
              <div className="p-4 flex items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
                  className="w-10 h-10 rounded-full mr-3"
                  alt={post.author.username}
                />
                <div>
                  <h3 className="font-semibold text-gray-800">{post.author.username}</h3>
                  <p className="text-xs text-gray-500">{moment(post.createdAt).fromNow()}</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-3">
                <p className="text-gray-800 mb-3">{post.content}</p>
              </div>

              {/* Image */}
              {post.image && (
                <div className="w-full">
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
                    post.likes.includes(userId) ? "text-red-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {post.likes.includes(userId) ? <FaHeart /> : <FaRegHeart />}
                  <span>{post.likes.length}</span>
                </button>

                <button
                  onClick={() => toggleComments(post._id)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <FaComment />
                  <span>{post.comments.length}</span>
                </button>
              </div>

              {/* Comments */}
              {expandedComments[post._id] && (
                <div className="border-t border-gray-100 p-4">
                  {/* Input */}
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="text"
                      value={commentText[post._id] || ""}
                      onChange={(e) =>
                        setCommentText((p) => ({ ...p, [post._id]: e.target.value }))
                      }
                      placeholder="Write a comment..."
                      className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === "Enter" && handleComment(post._id)}
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      disabled={!commentText[post._id]?.trim()}
                      className="text-blue-600 p-2 rounded-full hover:bg-blue-50 disabled:text-gray-400"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>

                  {/* List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {post.comments.length ? (
                      post.comments.map((c) => (
                        <div key={c._id} className="flex space-x-2">
                          <img
                            src={`https://ui-avatars.com/api/?name=${c.author.username}&background=random`}
                            className="w-8 h-8 rounded-full"
                            alt={c.author.username}
                          />
                          <div className="bg-gray-100 rounded-2xl px-3 py-2 flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm text-gray-800">
                                {c.author.username}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {moment(c.createdAt).fromNow()}
                              </span>
                            </div>
                            <p className="text-gray-800 text-sm mt-1">{c.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 text-sm py-2">
                        No comments yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share something!</p>
        </div>
      )}
    </div>
);
}
