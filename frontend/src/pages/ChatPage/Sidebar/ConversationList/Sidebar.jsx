// src/pages/ChatPage/Sidebar/Sidebar.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleCreateConversation } from "./handleCreateConversation";
import { fetchConversations } from "../../../../store/conversationSlice";
import { handleJoinViaInvite } from "./handleJoinViaInvite";

import {
  addConversation,
  replaceConversation,
  removeConversation,
} from "../../../../store/conversationSlice";

import ConversationCard from "./ConversationCard";
import CreateConversation from "./ConversationItem";
import CreateConversationModal from "./CreateConversationModel";
import JoinConversationModal from "./JoinConversationModal";

import { axiosClient } from "../../../../utils/axiosClient";
import { getSocket } from "../../../../socket/socket";
import { LetterText } from "lucide-react";

export default function Sidebar({
  selectedConversation,
  setSelectedConversation,
}) {
  const dispatch = useDispatch();
  const socket = getSocket();

  const { byId, allIds, loading } = useSelector((state) => state.conversations);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
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
    <div className="w-80 h-screen bg-slate-50 border-r border-gray-200/60 flex flex-col shadow-[4px_0_24px_rgba(59,130,246,0.05)]">
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Chats
        </h2>
        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
      </div>

      {/* USER PROFILE CARD */}
      <div className="mx-4 my-4 p-4 rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50/50 flex items-center gap-3 transition-all hover:shadow-blue-100/50">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
          {currentUser?.user?.name?.charAt(0) || "?"}
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-gray-800 truncate">
            {currentUser?.user?.name || "Loading..."}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-blue-500/70">
            ID: {currentUser?.user?.uniqueId || "..."}
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-4 pb-6 space-y-3">
        <button
          className="w-full group relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] active:scale-[0.98]"
          onClick={() => setShowJoinModal(true)}
        >
          <span>Join via Invite</span>
        </button>

        <div className="relative">
          <CreateConversation onCreate={() => setShowModal(true)} />
        </div>
      </div>

      {/* DIVIDER */}
      <div className="px-6 pb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
          Recent Messages
        </p>
      </div>

      {/* CONVERSATION LIST */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-gray-200/50 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-6">
            <div className="w-12 h-12 bg-blue-50 rounded-full mb-3 flex items-center justify-center text-blue-200">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">
              No active conversations
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <ConversationCard
                key={conv._id}
                conversation={conv}
                isActive={selectedConversation === conv._id}
                onClick={() => setSelectedConversation(conv._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showJoinModal && (
        <JoinConversationModal
          onClose={() => setShowJoinModal(false)}
          onSubmit={(inviteCode) =>
            handleJoinViaInvite({
              inviteCode,
              dispatch,
              setSelectedConversation,
              setShowJoinModal,
            })
          }
        />
      )}

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
    </div>
  );
}
