// src/api.js
const API_URL = import.meta.env.VITE_API_URL || "https://socialconnect-2x58.onrender.com"

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token)
  } else {
    localStorage.removeItem("token")
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const getFormDataHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const handleResponse = async (response) => {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "Request failed")
  }
  return data
}

const api = {
  // Auth endpoints
  register: async (data) => {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  login: async (data) => {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const result = await handleResponse(res)
    setToken(result.token)
    return result
  },

  googleLogin: async (tokenId) => {
    const res = await fetch(`${API_URL}/api/users/google`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ tokenId }),
    })
    const result = await handleResponse(res)
    setToken(result.token)
    return result
  },

  // Post endpoints
  fetchPosts: async ({ skip = 0, limit = 10 } = {}) => {
    const res = await fetch(
      `${API_URL}/api/posts?skip=${skip}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(res); // now returns { posts, total }
  },

  createPost: async (formData) => {
    const res = await fetch(`${API_URL}/api/posts`, {
      method: "POST",
      headers: getFormDataHeaders(),
      body: formData,
    })
    return handleResponse(res)
  },

  updatePost: async (postId, data) => {
    const res = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },
  
  // Comment endpoints
  updateComment: async (commentId, data) => {
    const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },
  
  deleteComment: async (commentId) => {
    const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },

  deletePost: async (postId) => {
    const res = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  likePost: async (postId) => {
    const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: "PUT",
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },

  // Comment endpoints
  fetchComments: async (postId = null) => {
    const url = postId ? `${API_URL}/api/comments?postId=${postId}` : `${API_URL}/api/comments`

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },

  createComment: async (data) => {
    const res = await fetch(`${API_URL}/api/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  // User endpoints
  fetchUsers: async () => {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },

  // Message endpoints
  fetchChatHistory: async (userId) => {
    const res = await fetch(`${API_URL}/api/messages/${userId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },

  sendMessage: async (data) => {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  // Notification endpoints
  fetchNotifications: async () => {
    const res = await fetch(`${API_URL}/api/notifications`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },

  getUnreadNotificationCount: async () => {
    const res = await fetch(`${API_URL}/api/notifications/unread`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },

  markNotificationsAsRead: async () => {
    const res = await fetch(`${API_URL}/api/notifications/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    })
    return handleResponse(res)
  },
}

export default api
