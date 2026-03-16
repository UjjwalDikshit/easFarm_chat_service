// Displays the list of all messages.
// Handles scrolling, pagination (load older messages on scroll up).
import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MessageBubble from "./MessageBubble";
import { fetchChats } from "../../../../store/chatSlice";

export default function MessageList({ selectedConversation }) {
  const dispatch = useDispatch();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const messages = useSelector(
    (state) => state.chat.messages[selectedConversation] || [],
  );

  const loading = useSelector((state) => state.chat.loading);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedConversation) return;

    dispatch(
      fetchChats({
        conversationId: selectedConversation,
      }),
    ).then((res) => {
      setCursor(res.payload.nextCursor);
    });
  }, [selectedConversation, dispatch]);

  // Auto scroll to bottom when new message comes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pagination (scroll up)
  const handleScroll = async () => {
    if (!containerRef.current || loadingMore || !cursor) return;

    if (containerRef.current.scrollTop === 0) {
      setLoadingMore(true);

      const res = await dispatch(
        fetchChats({
          conversationId: selectedConversation,
          cursor: cursor,
        }),
      );

      setCursor(res.payload.nextCursor);
      setLoadingMore(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50"
    >
      {/* Loading older messages */}
      {loadingMore && (
        <div className="text-center text-gray-400 text-sm">
          Loading older messages...
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="text-center text-gray-400 mt-10">No messages yet</div>
      )}

      {/* Message list */}
      {messages.map((msg) => (

        <MessageBubble key={msg.clientId || msg._id} msg={msg} />
      ))}

      {/* Bottom scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
