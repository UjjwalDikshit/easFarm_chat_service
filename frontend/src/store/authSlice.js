import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkMeAPI } from "../utils/checkMe";

export const checkMe = createAsyncThunk(
  "auth/checkMe",
  async (_, thunkAPI) => {
    try {
      const data = await checkMeAPI();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.user = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(checkMe.pending, (state) => {
        state.loading = true;
      })

      .addCase(checkMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })

      .addCase(checkMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;