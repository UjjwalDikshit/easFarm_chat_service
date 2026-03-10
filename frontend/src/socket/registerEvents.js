// src/socket/registerEvents.js

import { getSocket } from "./socket";
import { addMessage, setTyping } from "../store/chatSlice";
import { setOnline, setOffline } from "../store/presenceSlice";

export const registerSocketEvents = (dispatch) => {
  const socket = getSocket();

  if (!socket) return;

  // When connected
  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  socket.on("new_message", (message) => {
    console.log(message);
    dispatch(addMessage(message));
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
};
