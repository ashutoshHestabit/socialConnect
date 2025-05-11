import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.fetchComments()
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch comments")
    }
  }
)

export const createComment = createAsyncThunk(
  "comments/createComment",
  async (commentData, { rejectWithValue }) => {
    try {
      return await api.createComment(commentData)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const response = await api.updateComment(commentId, { content })
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update comment")
    }
  }
)

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await api.deleteComment(commentId)
      return commentId
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete comment")
    }
  }
)

const initialState = {
  comments: [],
  loading: false,
  error: null,
}

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addNewComment: (state, action) => {
      state.comments.unshift(action.payload)
    },
    updateCommentInState: (state, action) => {
      const index = state.comments.findIndex(c => c._id === action.payload._id)
      if (index !== -1) {
        state.comments[index] = action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.comments = action.payload
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createComment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false
        state.comments.unshift(action.payload)
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateComment.fulfilled, (state, { payload }) => {
        const index = state.comments.findIndex(c => c._id === payload._id)
        if (index !== -1) {
          state.comments[index] = payload
        }
      })
      .addCase(deleteComment.fulfilled, (state, { payload }) => {
        state.comments = state.comments.filter(c => c._id !== payload)
      })
  },
})

export const { clearError, addNewComment, updateCommentInState } = commentSlice.actions
export default commentSlice.reducer
