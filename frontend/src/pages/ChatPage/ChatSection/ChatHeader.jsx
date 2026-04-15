import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useSelector } from "react-redux";
import ChatOptionsMenu from "./ChatOptionsMenu";
import { Users, Share2 } from "lucide-react";

import { LeaveAndDeleteConversationAPI } from "./api/conversationAPI";
import {
  removeConversation,
  addConversation,
  updateConversation,
} from "../../../store/conversationSlice";
import AddMemberModal from "./AddMemberModal";
import RemoveMemberModal from "./RemoveMemberModal";
import MembersModal from "./MembersModal";
import InviteLinkButton from "./InviteLinkButton";

import { getSocket } from "../../../socket/socket";
import { useDispatch } from "react-redux";

export default function ChatHeader({
  conversationId,
  setSelectedConversation,
}) {
  const dispatch = useDispatch();

  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  // values: "add" | "remove" | null

  const presence = useSelector((state) => state.presence.users);
  const conversation = useSelector(
    (state) => state.conversations.byId[conversationId],
  );
  const typingUsers =
    useSelector((state) => state.chat.typing[conversationId]) || {};

  const users = Object.keys(typingUsers);

  if (!conversation) return null;

  const groupLabel =
    conversation.type === "private-group"
      ? "Private Group"
      : conversation.type === "free-group"
        ? "Business Group"
        : null;

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
    setActiveModal("add");
  };
  const handleLeaveAndDelete = async () => {
    if (!conversation?._id) return;
    const backup = conversation;

    /*
  ==========================
  1. OPTIMISTIC REMOVE
  ==========================
  */
    if (conversation._id === conversationId) {
      setSelectedConversation(null);
    }

    dispatch(removeConversation(conversationId));
    setShowMenu(false);

    try {
      /*
    ==========================
    2. API CALL
    ==========================
    */
      await LeaveAndDeleteConversationAPI(conversationId);

      /*
    ==========================
    3. SOCKET CLEANUP 
    ==========================
    */
      const socket = getSocket(); // make sure you import this
      socket.emit("leave_conversation", conversationId);
    } catch (err) {
      console.error("Leave/Delete failed:", err);

      /*
    ==========================
    4. ROLLBACK
    ==========================
    */
      dispatch(addConversation(backup));

      alert(err?.response?.data?.error || "Failed to leave conversation");
    }
  };

  const handleRemoveMember = async () => {
    setShowMenu(false);
    setActiveModal("remove");
  };

  const handleBlock = async () => {
    if (!conversation) return;

    const prev = conversation.isBlocked;

    /*
  ==========================
  1️OPTIMISTIC UPDATE
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
     ROLLBACK
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

  return (
    <div className="relative h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
          {title?.charAt(0) || "U"}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{title?.toUpperCase()}</span>

            {groupLabel && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                {groupLabel}
              </span>
            )}
          </div>

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
      <div className="flex items-center gap-2 relative">
        {conversation.type === "free-group" && (
          <InviteLinkButton conversationId={conversationId}>
            <Share2 className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
          </InviteLinkButton>
        )}
        {/* MEMBERS BUTTON (ONLY PRIVATE GROUP) */}
        {conversation.type === "private-group" && (
          <Users
            onClick={() => setShowMembersModal(true)}
            className="cursor-pointer text-gray-600 hover:text-black mr-2"
          />
        )}

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
            onLeave={handleLeaveAndDelete}
            onBlock={handleBlock}
            onUnblock={handleUnblock}
            onRemoveMember={handleRemoveMember}
            onDeleteGroup={handleLeaveAndDelete}
          />
        )}

        {activeModal === "add" && (
          <AddMemberModal
            conversationId={conversationId}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === "remove" && (
          <RemoveMemberModal
            conversationId={conversationId}
            onClose={() => setActiveModal(null)}
          />
        )}

        {showMembersModal && (
          <MembersModal
            conversationId={conversationId}
            onClose={() => setShowMembersModal(false)}
          />
        )}
      </div>
    </div>
  );
}
