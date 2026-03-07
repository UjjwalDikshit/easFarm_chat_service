// src/store/presenceSlice.js

import { createSlice } from "@reduxjs/toolkit";

const presenceSlice = createSlice({
  name: "presence",
  initialState: {
    onlineUsers: [],
  },
  reducers: {
    setOnline: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },

    setOffline: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(
        (id) => id !== action.payload
      );
    },
  },
});

export const { setOnline, setOffline } = presenceSlice.actions;
export default presenceSlice.reducer;