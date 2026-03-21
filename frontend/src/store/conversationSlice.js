import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchConversationsAPI } from "../pages/ChatPage/Sidebar/ConversationList/conversationAPI";

export const fetchConversations = createAsyncThunk(
  "conversations/fetch",
  async () => {
    return await fetchConversationsAPI();
  },
);

const conversationSlice = createSlice({
  name: "conversations",
  initialState: {
    byId: {},
    allIds: [],
    loading: false,
    error: null,
  },

  reducers: {
    updateLastMessage: (state, action) => {
      const message = action.payload;
      const conv = state.byId[message.conversationId];

      if (!conv) return;

      conv.lastMessage = message;
      conv.lastMessageAt = message.createdAt;

      state.allIds = [
        message.conversationId,
        ...state.allIds.filter((id) => id !== message.conversationId),
      ];
    },

    markConversationReadOptimistic: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.byId[conversationId];
      console.log(convo);
      if (!convo) return;

      convo.unreadCount = 0; // instant UI update
    },
    updateConversation: (state, action) => {
      const { conversationId, changes } = action.payload;

      const convo = state.byId[conversationId];
      if (!convo) return;

      Object.assign(convo, changes);
    },
    removeConversation: (state, action) => {
      const conversationId = action.payload;

      delete state.byId[conversationId];
      state.allIds = state.allIds.filter((id) => id !== conversationId);
    },
    addConversation: (state, action) => {
      const conv = action.payload;

      if (state.byId[conv._id]) return;

      state.byId[conv._id] = conv;
      state.allIds.unshift(conv._id);
    },
    replaceConversation: (state, action) => {
      const { tempId, conversation } = action.payload;

      delete state.byId[tempId];

      state.byId[conversation._id] = conversation;

      state.allIds = state.allIds.map((id) =>
        id === tempId ? conversation._id : id,
      );
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;

        const byId = {};
        const allIds = [];

        action.payload.forEach((conv) => {
          byId[conv._id] = conv;
          allIds.push(conv._id);
        });

        state.byId = byId;
        state.allIds = allIds;
      })

      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  updateLastMessage,
  removeConversation,
  updateConversation,
  markConversationReadOptimistic,
  addConversation,
  replaceConversation,
} = conversationSlice.actions;
export default conversationSlice.reducer;
