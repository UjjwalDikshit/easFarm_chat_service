import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "../../../../socket/socket";
import { replaceTempMessage } from "../../../../store/chatSlice";

export default function MessageBubble({ msg }) {
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  if (!currentUser) {
    return <p>You are not valid User.</p>;
  }

  console.log("senderId of msg", msg.senderId, "current user_id", currentUser.user._id);
  console.dir(msg.senderId);
  console.dir(currentUser.user._id);

  // const myId = currentUser?._id || currentUser?.user?._id;
  // console.log(msg.senderId);
  // const isMe = String(msg.senderId) === String(myId);
  const isMe = msg.senderId === currentUser.user._id;

  console.log(isMe);
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
          className={`text-[10px] mt-1 flex items-center gap-2 ${
            isMe ? "text-blue-100 justify-end" : "text-gray-400"
          }`}
        >
          <span>{time}</span>

          {isMe && msg.status !== "failed" && <span>✓</span>}

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
