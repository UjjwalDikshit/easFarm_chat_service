// UI for a single message.
// Shows text/media, sender, time, message status (sent/read).
import React from "react";
import { useSelector } from "react-redux";

export default function MessageBubble({ msg }) {
  const currentUser = useSelector((state) => state.auth.user);

  const isMe = msg.senderId === currentUser?._id;

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderContent = () => {
    switch (msg.type) {
      case "image":
        return (
          <img
            src={msg.content}
            alt="image"
            className="rounded-lg max-w-[200px]"
          />
        );

      case "video":
        return (
          <video controls className="rounded-lg max-w-[200px]">
            <source src={msg.content} />
          </video>
        );

      case "file":
        return (
          <a
            href={msg.content}
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-600"
          >
            Download File
          </a>
        );

      default:
        return <span>{msg.content}</span>;
    }
  };

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-xs break-words shadow-sm ${
          isMe
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
      >
        {/* Message Content */}
        <div>{renderContent()}</div>

        {/* Time + Status */}
        <div
          className={`text-[10px] mt-1 flex items-center gap-1 ${
            isMe ? "text-blue-100 justify-end" : "text-gray-400"
          }`}
        >
          <span>{time}</span>

          {isMe && <span>✓</span>}
        </div>
      </div>
    </div>
  );
}