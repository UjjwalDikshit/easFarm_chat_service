// Bottom input area.
// User types message, attaches media, sends message (via socket/API).
import React from "react";
import { Send } from "lucide-react";
import { useState, useEffect } from "react";
import { getSocket } from "../../../socket/socket";
import {
  addMessage,
  replaceTempMessage,
  markMessageFailed,
} from "../../../store/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

export default function MessageInput({ selectedConversation }) {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const sendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    const socket = getSocket();

    const tempId = uuid(); // unique temporary id
    // console.log(user.user._id,typeof user.user._id);
    const tempMessage = {
      _id: tempId,
      clientId: tempId,
      conversationId: selectedConversation,
      content: message,
      senderId: String(user.user._id),
      status: "sending",
      createdAt: new Date().toISOString(),
    };
    console.log(tempMessage);
    dispatch(addMessage(tempMessage));

    socket.emit(
      "send_message",
      {
        type: "text",
        conversationId: selectedConversation,
        content: message,
        clientId: tempId,
      },
      (response) => {
        if (!response.success) {
          dispatch(markMessageFailed(tempId));
          return;
        }
        console.log(response.message);
        console.log(typeof response.message.senderId);
        dispatch(
          replaceTempMessage({
            clientId: tempId,
            message: {
              ...response.message,
              senderId: String(response.message.senderId),
            },
          }),
        );
      },
    );

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
