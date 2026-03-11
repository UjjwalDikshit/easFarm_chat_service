// Bottom input area.
// User types message, attaches media, sends message (via socket/API).
import React from "react";
import { Send } from "lucide-react";
import { useState,useEffect } from "react";
import { getSocket } from "../../../socket/socket";
import { addMessage } from "../../../store/chatSlice";
import { useDispatch } from "react-redux";

export default function MessageInput(selectedConversation) {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();


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
    <>
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
  );
}
