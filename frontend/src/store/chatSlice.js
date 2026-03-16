// src/store/chatSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchChatsAPI } from "../pages/ChatPage/ChatSection/api/fetchChatsAPI";

export const fetchChats = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationId, cursor }) => {
    const data = await fetchChatsAPI(conversationId, cursor);
    return { conversationId, ...data };
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messages: {}, // { conversationId: [messages] }
    typing: {}, // { conversationId: { userId: true } }
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

      state.messages[convId].push({
        ...msg,
        senderId: msg.senderId ? msg.senderId.toString() : msg.senderId,
      });
    },

    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },

    setTyping: (state, action) => {
      const { conversationId, userId } = action.payload;

      if (!state.typing[conversationId]) {
        state.typing[conversationId] = {};
      }

      state.typing[conversationId][userId] = true;
    },

    clearTyping: (state, action) => {
      const { conversationId, userId } = action.payload;

      if (!state.typing[conversationId]) return;

      delete state.typing[conversationId][userId];

      if (Object.keys(state.typing[conversationId]).length === 0) {
        delete state.typing[conversationId];
      }
    },

    replaceTempMessage: (state, action) => {
      const { clientId, message } = action.payload;
      const convId = message.conversationId;

      const index = state.messages[convId]?.findIndex(
        (m) => m.clientId === clientId, // msg ka clientId, and server se bheja hua message ka clientId
      );

      if (index !== -1) {
        state.messages[convId][index] = {
          ...message,
          senderId:
            typeof message.senderId === "object"
              ? message.senderId.toString()
              : message.senderId,
        };
      }
    },

    markMessageFailed: (state, action) => {
      const tempId = action.payload;

      Object.keys(state.messages).forEach((convId) => {
        const msg = state.messages[convId]?.find((m) => m._id === tempId);

        if (msg) {
          msg.status = "failed";
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;

        const { conversationId, messages } = action.payload;

        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }

        const existingIds = new Set(
          state.messages[conversationId].map((m) => m._id),
        );

        const olderMessages = messages
          .map((m) => ({
            ...m,
            senderId:
              typeof m.senderId === "object"
                ? m.senderId.toString()
                : m.senderId,
          }))
          .reverse()
          .filter((m) => !existingIds.has(m._id));

        state.messages[conversationId] = [
          ...olderMessages,
          ...state.messages[conversationId],
        ];
      })

      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setConversations,
  addMessage,
  setMessages,
  setTyping,
  clearTyping,
  replaceTempMessage,
  markMessageFailed,
} = chatSlice.actions;

export default chatSlice.reducer;
