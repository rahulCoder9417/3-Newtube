import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { onSubmitAxios } from "../utils/axios"; // Assuming your axios helper is here

// Async Thunk for Fetching Videos
export const fetchVideos = createAsyncThunk(
  "videos/fetchVideos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await onSubmitAxios("get", "videos/", {}, {}, { type: "short" });
      return response.data.data; // Assuming data is in `response.data.data`
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error fetching videos");
    }
  }
);

// Video Slice
const videoSlice = createSlice({
  name: "videos",
  initialState: {
    videos: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = [...state.videos, ...action.payload]; 
        // Append new videos
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectVideos = (state) => state.video.videos;
export const selectLoading = (state) => state.video.loading;

export default videoSlice.reducer;
