import React from "react";

export default function ConversationCard({ conversation, isActive, onClick }) {
  console.log(conversation)
  const name =
    conversation.name ||
    (conversation.type === "private"
      ? "Private Chat"
      : "Unnamed Group");

  const avatarLetter = name.charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 border-b cursor-pointer transition hover:bg-gray-100 ${
        isActive ? "bg-gray-100" : ""
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
        {avatarLetter}
      </div>

      {/* Chat Info */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="font-medium truncate">{name}</span>

          {conversation.unreadCount > 0 && (
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>

        <div className="text-sm text-gray-500 truncate">
          {conversation.lastMessage?.content?.slice(0, 40) || "Start chatting"}
        </div>
      </div>
    </div>
  );
}