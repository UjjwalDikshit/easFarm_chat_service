import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Send } from "lucide-react";
import { connectSocket, getSocket } from "../socket/socket";
import { registerSocketEvents } from "../socket/registerEvents";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../store/chatSlice";
import Sidebar from "./ChatPage/Sidebar/ConversationList/Sidebar";

export default function ChatPage() {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");

  const messages = useSelector(
    (state) => state.chat.messages[selectedConversation] || [],
  );

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

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    const socket = getSocket();

    const tempMessage = {
      _id: Date.now(),
      conversationId: selectedConversation,
      content: message,
      senderId: "me",
    };

    dispatch(addMessage(tempMessage));

    socket.emit("send_message", {
      type: "text",

      conversationId: selectedConversation,
      content: message,
    });

    setMessage("");
  };

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
            <div className="h-16 bg-white border-b flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                  R
                </div>
                <div>
                  <div className="font-semibold">Rahul</div>
                  <div className="text-sm text-green-500">Online</div>
                </div>
              </div>

              <MoreVertical className="cursor-pointer text-gray-600 hover:text-black" />
            </div>

            {/* MESSAGE LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                  No messages yet
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderId === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs break-words shadow-sm ${
                      msg.senderId === "me"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="h-20 bg-white border-t flex items-center px-6 gap-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-600 transition p-3 rounded-full text-white"
              >
                <Send size={18} />
              </button>
            </div>
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
