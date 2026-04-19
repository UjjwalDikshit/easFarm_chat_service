import React from "react";

export default function ConversationCard({ conversation, isActive, onClick }) {
  const name =
    conversation.type === "private"
      ? conversation.otherMember?.fullName || conversation.otherMember?.name || "Unknown User"
      : conversation.name || "Unnamed Group";

  const avatarLetter = name.charAt(0).toUpperCase();

  const lastMessage =
    conversation.lastMessage?.content || "Start chatting";

  const lastMessageTime = conversation.lastMessage?.createdAt 
    ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 border-b border-blue-50 cursor-pointer transition-all duration-300 relative
        ${isActive 
          ? "bg-blue-100/70 border-r-4 border-r-blue-600 shadow-inner" 
          : "hover:bg-blue-50 bg-white"
        }`}
    >
      {/* Avatar Section */}
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform duration-300 ${
          isActive ? "bg-blue-600 text-white scale-105" : "bg-blue-100 text-blue-700"
        }`}>
          {avatarLetter}
        </div>
        {conversation.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-white rounded-full"></div>
        )}
      </div>

      {/* Chat Info Section */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-start mb-0.5">
          <span className={`font-bold truncate text-[15px] ${
            isActive ? "text-blue-900" : "text-blue-950"
          }`}>
            {name}
          </span>
          
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-medium text-blue-400 uppercase">
              {lastMessageTime}
            </span>
            {conversation.unreadCount > 0 && (
              <span className="min-w-[18px] h-[18px] flex items-center justify-center text-[10px] bg-blue-600 text-white font-bold rounded-full px-1.5 shadow-md shadow-blue-200">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className={`text-sm truncate pr-2 ${
          conversation.unreadCount > 0 
            ? "text-blue-900 font-semibold" 
            : "text-blue-950/50"
        }`}>
          {lastMessage.length > 40 ? `${lastMessage.slice(0, 40)}...` : lastMessage}
        </div>
      </div>
    </div>
  );
}