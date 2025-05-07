import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"
import { createComment } from "./commentSlice"

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ skip, limit }, { rejectWithValue }) => {
    try {
      return await api.fetchPosts({ skip, limit });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.createPost(postData)
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create post")
    }
  }
)

export const likePost = createAsyncThunk(
  "posts/likePost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.likePost(postId)
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Failed to like post")
    }
  }
)

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await api.deletePost(postId)
      return postId
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete post")
    }
  }
)

const initialState = {
  posts: [],
  loading: false,
  error: null,
  skip: 0,
  limit: 10,
  total: 0,
  hasMore: true,
};


const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    addNewPost: (state, action) => { state.posts.unshift(action.payload) },
    updatePostInState: (state, action) => {
      const idx = state.posts.findIndex(p => p._id === action.payload._id)
      if (idx !== -1) state.posts[idx] = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchPosts.fulfilled, (state, { payload }) => {
        state.loading = false;
        const { posts: newPosts, total } = payload;
      
        // On first page, replace; otherwise append
        state.posts = state.skip === 0
          ? newPosts
          : [...state.posts, ...newPosts];
      
        state.total   = total;
        state.hasMore = state.posts.length < total;
        state.skip += state.limit;
      })
      
      .addCase(fetchPosts.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(createPost.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false
        // no local insert — server/sockets will handle it
      })
      .addCase(createPost.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(likePost.fulfilled, (state, { payload }) => {
        const idx = state.posts.findIndex(p => p._id === payload._id)
        if (idx !== -1) state.posts[idx] = payload
      })

      .addCase(createComment.fulfilled, (state, { payload: comment }) => {
        const post = state.posts.find(p => p._id === comment.post)
        if (post) post.comments.push(comment)
      })

      .addCase(deletePost.pending, (state) => { state.loading = true; state.error = null })
      .addCase(deletePost.fulfilled, (state, { payload: id }) => {
        state.loading = false; state.posts = state.posts.filter(p => p._id !== id)
      })
      .addCase(deletePost.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
  },
})

export const { clearError, addNewPost, updatePostInState, updatePostComments } = postSlice.actions
export default postSlice.reducer