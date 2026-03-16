// ChatHeader.jsx
import React from "react";
import { MoreVertical } from "lucide-react";
import { useSelector } from "react-redux";

export default function ChatHeader({ conversationId }) {
  const presence = useSelector((state) => state.presence.users);

  const conversation = useSelector(
    (state) => state.conversations.byId[conversationId]
  );

  if (!conversation) return null;

  const title =
    conversation.type === "private"
      ? conversation.otherMember?.name
      : conversation.name;

  const avatar =
    conversation.type === "private"
      ? conversation.otherMember?.avatar
      : conversation.avatar;

  const isOnline = // seems here wrong
    conversation.type === "private" &&
    presence[conversation.otherMember?._id];


  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
          {title?.charAt(0) || "U"}
        </div>

        <div>
          <div className="font-semibold">{title.toUpperCase()}</div>
          {conversation.type === "private" && (
            <div className="text-sm">
              {isOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span className="text-gray-400">Offline</span>
              )}
            </div>
          )}
        </div>
      </div>

      <MoreVertical className="cursor-pointer text-gray-600 hover:text-black" />
    </div>
  );
}
