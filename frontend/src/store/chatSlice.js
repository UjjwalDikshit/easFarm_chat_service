// src/store/chatSlice.js

import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messages: {},   // { conversationId: [messages] }
    typing: {},     // { conversationId: userId }
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    addMessage: (state, action) => {
      const msg = action.payload;
      const convId = msg.conversationId;

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      state.messages[convId].push(msg);
    },

    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },

    setTyping: (state, action) => {
      const { conversationId, userId } = action.payload;
      state.typing[conversationId] = userId;
    },

    clearTyping: (state, action) => {
      const conversationId = action.payload;
      delete state.typing[conversationId];
    },
  },
});

export const {
  setConversations,
  addMessage,
  setMessages,
  setTyping,
  clearTyping,
} = chatSlice.actions;

export default chatSlice.reducer;