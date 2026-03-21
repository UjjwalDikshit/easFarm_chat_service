import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import MessageBubble from "./MessageBubble";
import { fetchChats } from "../../../../store/chatSlice";
import { getSocket } from "../../../../socket/socket";

export default function MessageList({ selectedConversation }) {
  const dispatch = useDispatch();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const myId = useSelector((state) => state.auth.user?._id);

  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // ✅ NEW
  const [initialLoading, setInitialLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const socket = getSocket();

  const messages = useSelector(
    (state) => state.chat.messages[selectedConversation] || []
  );

  const loading = useSelector((state) => state.chat.loading);

  /*
  ==========================
  READ RECEIPT
  ==========================
  */
  useEffect(() => {
    if (!selectedConversation || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    if (String(lastMessage.senderId) === String(myId)) return;

    socket?.emit("read_conversation", {
      conversationId: selectedConversation,
      lastMessageId: lastMessage._id,
    });
  }, [selectedConversation, messages, myId]);

  /*
  ==========================
  LOAD MESSAGES
  ==========================
  */
  useEffect(() => {
    if (!selectedConversation) return;

    // ✅ NEW
    setInitialLoading(true);
    setCursor(null);
    setHasMore(true);

    dispatch(
      fetchChats({
        conversationId: selectedConversation,
      })
    ).then((res) => {
      const next = res.payload?.nextCursor || null;

      setCursor(next);
      setHasMore(!!next); // ✅ NEW
      setInitialLoading(false); // ✅ NEW
    });
  }, [selectedConversation, dispatch]);

  /*
  ==========================
  AUTO SCROLL
  ==========================
  */
  useEffect(() => {
    if (!loadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /*
  ==========================
  PAGINATION
  ==========================
  */
  const handleScroll = async () => {
    if (!containerRef.current || loadingMore || !cursor || !hasMore) return; // ✅ updated

    if (containerRef.current.scrollTop === 0) {
      const prevHeight = containerRef.current.scrollHeight; // ✅ NEW

      setLoadingMore(true);

      const res = await dispatch(
        fetchChats({
          conversationId: selectedConversation,
          cursor: cursor,
        })
      );

      const next = res.payload?.nextCursor || null;

      setCursor(next);
      setHasMore(!!next); // ✅ NEW
      setLoadingMore(false);

      // ✅ FIX SCROLL JUMP
      setTimeout(() => {
        const newHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop = newHeight - prevHeight;
      }, 0);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50"
    >
      {/* ✅ NEW */}
      {initialLoading && (
        <div className="text-center text-gray-400 text-sm">
          Loading messages...
        </div>
      )}

      {/* EXISTING */}
      {loadingMore && (
        <div className="text-center text-gray-400 text-sm">
          Loading older messages...
        </div>
      )}

      {/* ✅ FIXED */}
      {!initialLoading && messages.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          No messages yet
        </div>
      )}

      {/* EXISTING */}
      {messages.map((msg) => (
        <MessageBubble key={msg.clientId || msg._id} msg={msg} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}