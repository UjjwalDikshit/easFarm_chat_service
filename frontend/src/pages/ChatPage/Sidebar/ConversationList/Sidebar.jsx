import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../../../store/conversationSlice";
import ConversationCard from "./ConversationCard";
import CreateConversation from "./ConversationItem";

export default function Sidebar({
  selectedConversation,
  setSelectedConversation,
}) {
  const dispatch = useDispatch();

  const { byId, allIds, loading } = useSelector((state) => state.conversations);

  const conversations = allIds.map((id) => byId[id]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      {/* HEADER */}
      <div className="h-16 flex items-center px-4 border-b font-semibold text-lg">
        Chats
      </div>
      <CreateConversation />
      {/* CONVERSATION LIST */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-gray-500">Loading conversations...</div>
        )}

        {conversations.map((conv) => (
          <ConversationCard
            key={conv._id}
            conversation={conv}
            isActive={selectedConversation === conv._id}
            onClick={() => setSelectedConversation(conv._id)}
          />
        ))}
      </div>
    </div>
  );
}
