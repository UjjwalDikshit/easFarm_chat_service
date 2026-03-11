import React, { useState, useEffect, useRef } from "react";
import {  Send } from "lucide-react";
import { connectSocket, getSocket } from "../socket/socket";
import { registerSocketEvents } from "../socket/registerEvents";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../store/chatSlice";
import ChatHeader from "./ChatPage/ChatSection/ChatHeader";
import Sidebar from "./ChatPage/Sidebar/ConversationList/Sidebar";
import MessageInput from "./ChatPage/ChatSection/MessageInput";
import MessageList from "./ChatPage/ChatSection/MessageList/MessageList";

export default function ChatPage() {
  const dispatch = useDispatch();

  const [selectedConversation, setSelectedConversation] = useState(null);
  

  /* ================= SOCKET SETUP ================= */

  useEffect(() => {
    const socket = connectSocket();
    registerSocketEvents(dispatch);

    return () => {
      socket.off("new_message");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("typing");
    };
  }, [dispatch]);

  /* ================= JOIN / LEAVE ROOM ================= */

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedConversation) return;

    socket.emit("join_conversation", {conversationId:selectedConversation});

    return () => {
      socket.emit("leave_conversation", {conversationId:selectedConversation});
    };
  }, [selectedConversation]);


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
            <ChatHeader/>
            {/* MESSAGE LIST */}
            <MessageList selectedConversation = {selectedConversation}/>

            {/* INPUT */}
            <MessageInput selectedConversation={selectedConversation}/>
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
