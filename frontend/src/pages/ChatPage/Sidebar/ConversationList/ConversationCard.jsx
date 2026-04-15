import React from "react";

export default function ConversationCard({ conversation, isActive, onClick }) {
  //  Name logic
  const name =
    conversation.type === "private"
      ? conversation.otherMember?.name || "Unknown User"
      : conversation.name || "Unnamed Group";

  //  Avatar letter
  const avatarLetter = name.charAt(0).toUpperCase();

  //  Last message
  const lastMessage =
    conversation.lastMessage?.content || "Start chatting";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 border-b cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
        isActive ? "bg-gray-200" : ""
      }`}
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold shadow">
        {avatarLetter}
      </div>

      {/* Chat Info */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="font-medium truncate">{name}</span>

          {conversation.unreadCount > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>

        <div className="text-sm text-gray-500 truncate">
          {lastMessage.slice(0, 40)}
        </div>
      </div>
    </div>
  );
}