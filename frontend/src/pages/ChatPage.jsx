import React, { useState, useEffect, useRef } from "react";
import { connectSocket, getSocket } from "../socket/socket";
import { registerSocketEvents } from "../socket/registerEvents";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../store/chatSlice";
import ChatHeader from "./ChatPage/ChatSection/ChatHeader";
import Sidebar from "./ChatPage/Sidebar/ConversationList/Sidebar";
import MessageInput from "./ChatPage/ChatSection/MessageInput";
import MessageList from "./ChatPage/ChatSection/MessageList/MessageList";
import { markConversationReadOptimistic } from "../store/conversationSlice";

export default function ChatPage() {
  const dispatch = useDispatch();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const myId = useSelector((state) => state.auth.user?._id);

  const conversation = useSelector(
    (state) => state.conversations.byId[selectedConversation],
  );

  /* ================= SOCKET SETUP ================= */

  useEffect(() => {
    const socket = connectSocket();
    registerSocketEvents(dispatch, myId);

    return () => {
      socket.off("new_message");
      socket.off("presence:state");
      socket.off("presence:update");
      socket.off("start_typing");
      socket.off("stop_typing");
      socket.off("read_conversation");
      socket.off("member_added");
      socket.off("conversation_added");
      socket.off("conversation_removed");
      socket.off("member_removed");
      socket.off("member_left");
      socket.off("conversation_blocked");
      socket.off("conversation_unblocked");
    };
  }, [dispatch]);

  /* ================= JOIN / LEAVE ROOM ================= */

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedConversation) return;

    const userIds =
      conversation.type === "private" ? [conversation.otherMember._id] : [];

    // join conversation for messages
    socket.emit("join_conversation", {
      conversationId: selectedConversation,
    });

    // subscribe to presence
    userIds.forEach((userId) => {
      socket.emit("presence:subscribe", { userId });
    });

    // check current presence
    // socket.emit("presence:check", { userIds });

    dispatch(
      markConversationReadOptimistic({ conversationId: selectedConversation }),
    );

    return () => {
      socket.emit("leave_conversation", {
        conversationId: conversation._id,
      });

      userIds.forEach((userId) => {
        socket.emit("presence:unsubscribe", {
          user: [conversation.otherMember._id],
        });
      });
    };
  }, [selectedConversation]);
  
  // if conversation removed and but still selectedConversation hold id, then ui break so fix and set selectedConversation = null;
  useEffect(() => {
    //  if conversation is deleted / removed
    if (selectedConversation && !conversation) {
      setSelectedConversation(null);
    }
  }, [selectedConversation, conversation, setSelectedConversation]);
  const auth = useSelector((state) => state.auth);

  if (auth.loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <div className="h-screen flex bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <Sidebar
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />

      {/* ================= CHAT SECTION ================= */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* HEADER */}
            <ChatHeader
              conversationId={selectedConversation}
              setSelectedConversation={setSelectedConversation}
            />
            {/* MESSAGE LIST */}
            <MessageList selectedConversation={selectedConversation} />

            {/* INPUT */}
            <MessageInput selectedConversation={selectedConversation} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
