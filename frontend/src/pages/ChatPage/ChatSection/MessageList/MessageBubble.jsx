import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "../../../../socket/socket";
import { replaceTempMessage } from "../../../../store/chatSlice";
import { Check, CheckCheck, AlertCircle, RefreshCw } from "lucide-react";

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
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 px-2`}>
      <div
        className={`
          relative px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-md break-words shadow-sm transition-all
          ${
            isMe
              ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200/50"
              : "bg-blue-50 border border-blue-100 text-blue-950 rounded-tl-none shadow-sm"
          }
        `}
      >
        {/* Message Content */}
        <div className="text-[14.5px] leading-relaxed">
          {renderContent()}
        </div>

        {/* Metadata Footer */}
        <div
          className={`flex items-center gap-2 mt-1.5 text-[10px] font-medium ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          {/* Timestamp */}
          <span className={isMe ? "text-blue-100" : "text-blue-400"}>
            {formatMessageTime(msg.createdAt)}
          </span>

          {/* Unique ID */}
          {msg.uniqueId && (
            <span
              className={`font-mono opacity-70 ${
                isMe ? "text-blue-200" : "text-blue-300"
              }`}
            >
              #{msg.uniqueId}
            </span>
          )}

          {/* Status Indicators */}
          {isMe && (
            <span className="flex items-center ml-0.5">
              {msg.status === "failed" ? (
                <button
                  onClick={retryMessage}
                  className="flex items-center gap-1 text-white hover:underline transition-colors font-bold"
                >
                  <RefreshCw size={10} />
                  Retry
                </button>
              ) : isSeen ? (
                <CheckCheck size={13} className="text-white" />
              ) : (
                <Check size={13} className="text-blue-200" />
              )}
            </span>
          )}
        </div>

        {/* Tail shadow effect for professional look */}
        <div className={`absolute top-0 w-2 h-2 ${
          isMe 
            ? "-right-1 bg-blue-600 [clip-path:polygon(0_0,0_100%,100%_0)]" 
            : "-left-1 bg-blue-50 border-l border-t border-blue-100 [clip-path:polygon(0_0,100%_100%,100%_0)]"
        }`} />
      </div>
    </div>
  );
}
