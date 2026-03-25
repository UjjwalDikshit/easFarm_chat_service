import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useSelector } from "react-redux";
import ChatOptionsMenu from "./ChatOptionsMenu";

import { leaveConversationAPI } from "./api/conversationAPI";
import {
  removeConversation,
  addConversation,
  updateConversation,
} from "../../../store/conversationSlice";
import AddMemberModal from "./AddMemberModal";

export default function ChatHeader({ conversationId }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const presence = useSelector((state) => state.presence.users);

  const conversation = useSelector(
    (state) => state.conversations.byId[conversationId],
  );

  const typingUsers =
    useSelector((state) => state.chat.typing[conversationId]) || {};

  const users = Object.keys(typingUsers);

  if (!conversation) return null;

  const title =
    conversation.type === "private"
      ? conversation.otherMember?.name
      : conversation.name;

  const isOnline =
    conversation.type === "private" &&
    presence?.[conversation.otherMember?._id];

  /*
  ==========================
  ACTION HANDLERS
  ==========================
  */

  const handleAddMember = () => {
    setShowMenu(false);
    setShowAddMemberModal(true);
  };

  const handleLeave = async () => {
    if (!conversation) return;

    const backup = conversation; // keep backup for rollback

    /*
  ==========================
   1. OPTIMISTIC REMOVE
  ==========================
  */
    if (conversation._id === selectedConversation) {
      setSelectedConversation(null); // move to safe place
    }
    dispatch(removeConversation(conversation._id));

    setShowMenu(false);

    try {
      /*
    ==========================
    2 API CALL
    ==========================
    */
      await leaveConversationAPI(conversation._id);

      /*
    ==========================
    3 SUCCESS → do nothing
    ==========================
    */
    } catch (err) {
      console.error("Leave failed:", err);

      /*
    ==========================
    4 ROLLBACK
    ==========================
    */
      dispatch(addConversation(backup));

      alert("Failed to leave conversation");
    }
  };

  const handleBlock = async () => {
    if (!conversation) return;

    const prev = conversation.isBlocked;

    /*
  ==========================
  1️⃣ OPTIMISTIC UPDATE
  ==========================
  */
    dispatch(
      updateConversation({
        conversationId: conversation._id,
        changes: { isBlocked: true },
      }),
    );

    setShowMenu(false);

    try {
      await blockConversationAPI(conversation._id);
    } catch (err) {
      console.error("Block failed:", err);

      /*
    ==========================
    ❌ ROLLBACK
    ==========================
    */
      dispatch(
        updateConversation({
          conversationId: conversation._id,
          changes: { isBlocked: prev },
        }),
      );
    }
  };
  const handleUnblock = async () => {
    if (!conversation) return;

    const prev = conversation.isBlocked;

    dispatch(
      updateConversation({
        conversationId: conversation._id,
        changes: { isBlocked: false },
      }),
    );

    setShowMenu(false);

    try {
      await unblockConversationAPI(conversation._id);
    } catch (err) {
      console.error("Unblock failed:", err);

      dispatch(
        updateConversation({
          conversationId: conversation._id,
          changes: { isBlocked: prev },
        }),
      );
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!conversation) return;

    setShowMenu(false);

    try {
      await removeMemberAPI(conversation._id, userId);

      /*
    ==========================
     REFRESH (ONLY IF NEEDED)
    ==========================
    */
      dispatch(fetchConversations());
    } catch (err) {
      console.error("Remove member failed:", err);
      alert("Failed to remove member");
    }
  };

  return (
    <div className="relative h-16 bg-white border-b flex items-center justify-between px-6">
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

      {/* MENU BUTTON */}
      <div className="relative">
        <MoreVertical
          onClick={() => setShowMenu((prev) => !prev)}
          className="cursor-pointer text-gray-600 hover:text-black"
        />

        {/* DROPDOWN */}
        {showMenu && (
          <ChatOptionsMenu
            conversation={conversation}
            onClose={() => setShowMenu(false)}
            onAddMember={handleAddMember}
            onLeave={handleLeave}
            onBlock={handleBlock}
            onUnblock={handleUnblock}
            onRemoveMember={handleRemoveMember}
          />
        )}
        {/* show card to add member */}
        {showAddMemberModal && (
          <AddMemberModal
            conversationId={conversationId}
            onClose={() => setShowAddMemberModal(false)}
          />
        )}
      </div>
    </div>
  );
}
