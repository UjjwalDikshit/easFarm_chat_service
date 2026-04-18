import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "../../../../socket/socket";
import { replaceTempMessage } from "../../../../store/chatSlice";
import { Check, CheckCheck } from "lucide-react";

export default function MessageBubble({ msg }) {
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  if (!currentUser) {
    return <p>You are not valid User.</p>;
  }

  const myId = currentUser?.user?._id;

  const conversation = useSelector(
    (state) => state.chat.conversations[msg.conversationId],
  );

  console.log("conversation members", conversation?.members);

  /*
  ==========================================
   GET OTHER USER ID (FIXED)
  ==========================================
  */
  const membersIds = Object.keys(conversation?.members || {});
  const otherUserId = membersIds.find((id) => String(id) !== String(myId));

  /*
  ==========================================
   LAST READ ID
  ==========================================
  */
  const lastReadId = conversation?.members?.[otherUserId]?.lastReadMessageId;

  /*
  ==========================================
   CHECK IF MESSAGE IS MINE
  ==========================================
  */
  const isMe = String(msg.senderId) === String(myId);

  /*
  ==========================================
   BLUE TICK LOGIC (FIXED)
  ==========================================
  */
  const isSeen = isMe && lastReadId && String(msg._id) <= String(lastReadId);
  const hasUniqueId = !!msg.uniqueId;
  /*
  ==========================================
  RETRY MESSAGE
  ==========================================
  */
  const retryMessage = () => {
    const socket = getSocket();
    socket.emit(
      "send_message",
      {
        type: msg.type || "text",
        conversationId: msg.conversationId,
        content: msg.content,
        clientId: msg._id,
      },
      (response) => {
        if (!response.success) return;

        dispatch(
          replaceTempMessage({
            clientId: msg._id,
            message: response.message,
          }),
        );
      },
    );
  };

  // const time = new Date(msg.createdAt).toLocaleTimeString([], {
  //   hour: "2-digit",
  //   minute: "2-digit",
  // });

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return time;
    if (isYesterday) return `Yesterday, ${time}`;

    return (
      date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
      }) + `, ${time}`
    );
  };

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
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`
        px-4 py-2.5 rounded-2xl max-w-xs break-words shadow-md transition-all
        ${
          isMe
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
            : "bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm"
        }
      `}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed">{renderContent()}</div>

        {/* Metadata Footer */}
        <div
          className={`flex items-center gap-2 mt-1.5 text-[10px] ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          {/* Timestamp */}
          <span className={isMe ? "text-blue-100" : "text-gray-400"}>
            {formatMessageTime(msg.createdAt)}
          </span>

          {/* Unique ID (if exists) */}
          {msg.uniqueId && (
            <span
              className={`text-[9px] font-mono ${
                isMe ? "text-blue-200/80" : "text-gray-400"
              }`}
            >
              #{msg.uniqueId}
            </span>
          )}

          {/* Status Indicators */}
          {isMe && (
            <span className="flex items-center ml-0.5">
              {msg.status === "sent" && !isSeen && (
                <Check size={12} className="text-blue-200" />
              )}
              {isSeen && <CheckCheck size={12} className="text-blue-950" />}
              {msg.status === "failed" && (
                <button
                  onClick={retryMessage}
                  className="text-red-400 hover:text-red-300 underline transition-colors"
                >
                  Retry
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
