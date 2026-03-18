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
  ✅ GET OTHER USER ID (FIXED)
  ==========================================
  */
  const membersIds = Object.keys(conversation?.members || {});
  const otherUserId = membersIds.find((id) => String(id) !== String(myId));

  /*
  ==========================================
  ✅ LAST READ ID
  ==========================================
  */
  const lastReadId = conversation?.members?.[otherUserId]?.lastReadMessageId;

  /*
  ==========================================
  ✅ CHECK IF MESSAGE IS MINE
  ==========================================
  */
  const isMe = String(msg.senderId) === String(myId);

  /*
  ==========================================
  ✅ BLUE TICK LOGIC (FIXED)
  ==========================================
  */
  const isSeen = isMe && lastReadId && String(msg._id) <= String(lastReadId);

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
          className={`text-[10px] mt-1 flex items-center gap-2 ${
            isMe ? "text-blue-100 justify-end" : "text-gray-400"
          }`}
        >
          {/* <span>{time}</span> */}
          <span>{formatMessageTime(msg.createdAt)}</span>

          {isMe && msg.status !== "failed" && (
            <span className="flex items-center ml-1 transition-all duration-300 ease-in-out">
              {isSeen ? (
                <CheckCheck
                  size={14}
                  className="text-blue-950 transition-all duration-300 ease-in-out opacity-100 scale-100"
                />
              ) : (
                <Check
                  size={14}
                  className="text-gray-400 transition-all duration-300 ease-in-out opacity-80 scale-95"
                />
              )}
            </span>
          )}

          {msg.status === "failed" && (
            <button
              onClick={retryMessage}
              className="text-red-500 text-[10px] underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
