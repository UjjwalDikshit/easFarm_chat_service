// src/store/presenceSlice.js

import { createSlice } from "@reduxjs/toolkit";

const presenceSlice = createSlice({
  name: "presence",
  initialState: {
    users: {} // { userId: true/false }
  },
  reducers: {
    setPresence: (state, action) => {
      const { userId, online } = action.payload;
      state.users[userId] = online;
    },

    setBulkPresence: (state, action) => {
      action.payload.forEach(({ userId, online }) => {
        state.users[userId] = online;
      });
    }
  }
});

export const { setPresence, setBulkPresence } = presenceSlice.actions;
export default presenceSlice.reducer;
