// src/socket/registerEvents.js

import { getSocket } from "./socket";
import { addMessage, setTyping } from "../store/chatSlice";
import { setPresence, setBulkPresence } from "../store/presenceSlice";
import { updateLastMessage } from "../store/conversationSlice";

export const registerSocketEvents = (dispatch) => {
  const socket = getSocket();

  if (!socket) return;

  // When connected
  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  socket.on("new_message", (message) => {
    dispatch(
      addMessage({
        ...message,
        senderId: String(message.senderId),
      }));
      dispatch(updateLastMessage(message));
  });

  socket.on("user_online", (userId) => {
    dispatch(setOnline(userId));
  });

  socket.on("user_offline", (userId) => {
    dispatch(setOffline(userId));
  });

  socket.on("typing", ({ conversationId, userId }) => {
    dispatch(setTyping({ conversationId, userId }));
  });

  socket.on("presence:state", (users) => {
    // users = [{ userId, online }]
    dispatch(setBulkPresence(users));
  });
  socket.on("presence:update", ({ userId, online }) => {
    dispatch(setPresence({ userId, online }));
  });
};
