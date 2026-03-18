import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchConversationsAPI } from "../pages/ChatPage/Sidebar/ConversationList/conversationAPI";

export const fetchConversations = createAsyncThunk(
  "conversations/fetch",
  async () => {
    return await fetchConversationsAPI();
  }
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
    },

    markConversationReadOptimistic: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.byId[conversationId];
      console.log(convo);
      if (!convo) return;

      convo.unreadCount = 0; // instant UI update
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

export const { updateLastMessage , markConversationReadOptimistic} = conversationSlice.actions;
export default conversationSlice.reducer;
