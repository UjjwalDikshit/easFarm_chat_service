// src/pages/ChatPage/Sidebar/Sidebar.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleCreateConversation } from "./handleCreateConversation";
import { fetchConversations } from "../../../../store/conversationSlice";
import {
  addConversation,
  replaceConversation,
  removeConversation,
} from "../../../../store/conversationSlice";

import ConversationCard from "./ConversationCard";
import CreateConversation from "./ConversationItem";
import CreateConversationModal from "./CreateConversationModel";

import { axiosClient } from "../../../../utils/axiosClient";
import { getSocket } from "../../../../socket/socket";

export default function Sidebar({
  selectedConversation,
  setSelectedConversation,
}) {
  const dispatch = useDispatch();
  const socket = getSocket();

  const { byId, allIds, loading } = useSelector((state) => state.conversations);

  const [showModal, setShowModal] = useState(false);

  const conversations = allIds.map((id) => byId[id]);

  /*
  ==========================================
  FETCH CONVERSATIONS
  ==========================================
  */
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  /*
  ==========================================
  CREATE CONVERSATION (CORE)
  ==========================================
  */
  return (
    <div className="w-80 bg-white border-r flex flex-col">
      {/* HEADER */}
      <div className="h-16 flex items-center px-4 border-b font-semibold text-lg">
        Chats
      </div>

      {/* CREATE BUTTON */}
      <CreateConversation onCreate={() => setShowModal(true)} />

      {/* MODAL */}
      {showModal && (
        <CreateConversationModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) =>
            handleCreateConversation({
              data,
              dispatch,
              setSelectedConversation,
              setShowModal,
            })
          }
        />
      )}

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
