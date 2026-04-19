// Bottom input area.
// User types message, attaches media, sends message (via socket/API).
import React from "react";
import { useState, useEffect } from "react";
import { getSocket } from "../../../socket/socket";
import {
  addMessage,
  replaceTempMessage,
  markMessageFailed,
} from "../../../store/chatSlice";
import { setTyping, clearTyping } from "../../../store/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import {
  Send,
  Plus,
  Image as ImageIcon,
  Mic,
  Camera,
  Smile,
  Paperclip,
} from "lucide-react";
export default function MessageInput({ selectedConversation }) {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const typingTimeout = React.useRef(null);
  const isTyping = React.useRef(false);
  const socket = getSocket();

  useEffect(() => {
    return () => {
      if (isTyping.current && selectedConversation) {
        socket.emit("stop_typing", {
          conversationId: selectedConversation,
        });

        clearTimeout(typingTimeout.current);
        typingTimeout.current = null;
        isTyping.current = false;
      }
    };
  }, [selectedConversation]);

  const sendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

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

    socket.emit("stop_typing", {
      conversationId: selectedConversation,
    });

    clearTimeout(typingTimeout.current);
    isTyping.current = false;
    setMessage("");
  };

  const handleTyping = (value) => {
    if (!selectedConversation) return;
    if (!value.trim()) return;

    // emit start only once
    if (!isTyping.current) {
      socket.emit("start_typing", {
        conversationId: selectedConversation,
      });
      isTyping.current = true;
    }

    // reset stop timer
    // if (typingTimeout.current) {
    clearTimeout(typingTimeout.current);
    //}

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: selectedConversation,
      });
      typingTimeout.current = null;
      isTyping.current = false;
    }, 3000);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-base-100 border-t border-base-200 px-4 py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {/* LEFT ACTIONS */}
        <div className="flex items-center gap-1">
          <button className="btn btn-circle btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100">
            <Plus size={20} />
          </button>

          <button className="btn btn-circle btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hidden sm:flex">
            <Camera size={18} />
          </button>

          <button className="btn btn-circle btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hidden sm:flex">
            <ImageIcon size={18} />
          </button>

          <button className="btn btn-circle btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 hidden sm:flex">
            <Paperclip size={18} />
          </button>
        </div>

        {/* INPUT */}
        <div className="flex-1 flex items-center bg-base-200 rounded-full px-3 border border-base-300 focus-within:border-blue-400 transition">
          <textarea
            rows={1}
            value={message}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
              handleTyping(value);
            }}
            onKeyDown={onKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none resize-none py-2 text-base-content"
          />

          <button className="text-blue-500 hover:text-blue-600 px-2">
            <Smile size={18} />
          </button>
        </div>

        {/* RIGHT ACTIONS (SAME ROW FIXED) */}
        <div className="flex items-center gap-1">
          {!message.trim() ? (
            <button className="btn btn-circle btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100">
              <Mic size={18} />
            </button>
          ) : (
            <button
              onClick={sendMessage}
              className="btn btn-circle btn-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-blue-500/80 animate-float">
          <span className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-ping"></span>
          Secure Chat with FarmBazaar
        </div>
      </div>
    </div>
  );
}
