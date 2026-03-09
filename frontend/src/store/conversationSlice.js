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
    conversations: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default conversationSlice.reducer;