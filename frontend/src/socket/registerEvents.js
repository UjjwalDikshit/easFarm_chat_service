// src/socket/registerEvents.js

import { getSocket } from "./socket";
import { addMessage, clearTyping, setTyping } from "../store/chatSlice";
import { setPresence, setBulkPresence } from "../store/presenceSlice";
import { updateLastMessage } from "../store/conversationSlice";
import { updateLastRead } from "../store/chatSlice";
import { useSelector } from "react-redux";

export const registerSocketEvents = (dispatch) => {
  const socket = getSocket();

  // When connected
  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  socket.on("new_message", (message) => {
    dispatch(
      addMessage({
        ...message,
        senderId: String(message.senderId),
      }),
    );
    dispatch(updateLastMessage(message));
  });

  socket.on("user_online", (userId) => {
    dispatch(setOnline(userId));
  });

  socket.on("user_offline", (userId) => {
    dispatch(setOffline(userId));
  });

  socket.on("start_typing", ({ conversationId, userId }) => {
    dispatch(setTyping({ conversationId, userId }));
  });

  socket.on("stop_typing", ({ conversationId, userId }) => {
    dispatch(clearTyping({ conversationId, userId }));
  });

  socket.on("presence:state", (users) => {
    // users = [{ userId, online }]
    dispatch(setBulkPresence(users));
  });
  socket.on("presence:update", ({ userId, online }) => {
    dispatch(setPresence({ userId, online }));
  });

  socket.on("read_conversation", (data) => {
    console.log("READ EVENT RECEIVED", data);
    dispatch(updateLastRead(data));
  });

  socket.on("member_added", ({ conversationId, members }) => {
    dispatch(addMembersRealtime({ conversationId, members }));
  });

  socket.on("member_removed", ({ conversationId, userId }) => {
    dispatch(removeMemberRealtime({ conversationId, userId }));

    if (userId === currentUserId()) {
      dispatch(removeConversation(conversationId));
    }
  });
  socket.on("member_left", ({ conversationId, userId }) => {
    dispatch(removeMemberRealtime({ conversationId, userId }));
    if (userId === currentUserId()) {
      dispatch(removeConversation(conversationId));
    }
  });

  socket.on("conversation_blocked", ({ conversationId, blockedBy }) => {
    dispatch(
      updateConversation({
        conversationId,
        changes: { isBlocked: true, blockedBy },
      }),
    );
  });

  socket.on("conversation_unblocked", ({ conversationId }) => {
    dispatch(
      updateConversation({
        conversationId,
        changes: { isBlocked: false, blockedBy: null },
      }),
    );
  });
};
