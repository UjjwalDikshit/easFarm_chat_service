
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import conversationReducer from "./conversationSlice"
import chatReducer from "./chatSlice";
import presenceReducer from "./presenceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    presence: presenceReducer,
    conversations: conversationReducer,
  },
});