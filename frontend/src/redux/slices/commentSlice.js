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
      // api.createComment now returns the comment object directly
      return await api.createComment(commentData)
    } catch (error) {
      return rejectWithValue(error.message)
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
        state.loading = false;
        state.comments.unshift(action.payload); 
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, addNewComment } = commentSlice.actions
export default commentSlice.reducer