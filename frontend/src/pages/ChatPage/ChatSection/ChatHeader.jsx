// ChatHeader.jsx
import React from "react";
import { MoreVertical } from "lucide-react";
import { useSelector } from "react-redux";

export default function ChatHeader({ conversationId }) {
  const presence = useSelector((state) => state.presence.users);

  const conversation = useSelector(
    (state) => state.conversations.byId[conversationId],
  );

  const typingUsers =
    useSelector((state) => state.chat.typing[conversationId]) || {};

  const users = Object.keys(typingUsers);
  console.log(users);
  if (!conversation) return null;

  const title =
    conversation.type === "private"
      ? conversation.otherMember?.name
      : conversation.name;

  const isOnline =
    conversation.type === "private" &&
    presence?.[conversation.otherMember?._id];

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
          {title?.charAt(0) || "U"}
        </div>

        <div>
          <div className="font-semibold">{title?.toUpperCase()}</div>

          <div className="text-sm">
            {users.length > 0 ? (
              <span className="text-blue-500">
                {users.join(", ")} typing...
              </span>
            ) : conversation.type === "private" ? (
              isOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span className="text-gray-400">Offline</span>
              )
            ) : null}
          </div>
        </div>
      </div>

      <MoreVertical className="cursor-pointer text-gray-600 hover:text-black" />
    </div>
  );
}
