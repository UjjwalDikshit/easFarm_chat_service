import React, { useState } from "react";
import { useSelector } from "react-redux";
import ChatOptionsMenu from "./ChatOptionsMenu";
import {
  MoreVertical,
  Users,
  Share2,
  ChevronLeft,
  Plus, // Using the vertical plus sign as requested
} from "lucide-react";

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
    // Update background to a light blue shade, remove backdrop blur for a solid look
    <div className="h-16 md:h-20 bg-blue-50 border-b border-blue-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Back Button - Update hover color to match blue theme */}
        <button
          onClick={() => window.history.back()}
          className="md:hidden btn btn-ghost btn-circle btn-sm text-blue-800 hover:bg-blue-100"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Avatar - Use blue shade for the background */}
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-inner">
            {title?.charAt(0).toUpperCase() || "U"}
          </div>
          {conversation.type === "private" && (
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-blue-50 ${isOnline ? "bg-success" : "bg-base-300"}`}
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            {/* Update text color to a darker blue for contrast */}
            <h3 className="font-bold text-base md:text-lg leading-tight truncate max-w-[150px] md:max-w-xs text-blue-950">
              {title}
            </h3>
            {groupLabel && (
              // Update badge to match the new color scheme
              <span className="badge badge-info badge-sm font-medium text-black">
                {groupLabel}
              </span>
            )}
          </div>

          <div className="text-xs md:text-sm">
            {users.length > 0 ? (
              // Keep typing status blue, matches the theme
              <span className="text-blue-600 font-medium animate-pulse">
                typing...
              </span>
            ) : conversation.type === "private" ? (
              <span
                className={
                  isOnline ? "text-success font-medium" : "text-blue-950/40"
                }
              >
                {isOnline ? "Active now" : "Offline"}
              </span>
            ) : (
              <span className="text-blue-950/40">Group conversation</span>
            )}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-1 md:gap-3">
        {conversation.type === "free-group" && (
          <InviteLinkButton conversationId={conversationId}>
            <button
              className="btn btn-ghost btn-circle btn-sm text-blue-600 hover:bg-blue-100"
              title="Invite"
            >
              <Share2 size={20} />
            </button>
          </InviteLinkButton>
        )}

        {conversation.type === "private-group" && (
          <button
            onClick={() => setShowMembersModal(true)}
            className="btn btn-ghost btn-circle btn-sm text-blue-600 hover:bg-blue-100"
            title="View Members"
          >
            <Users size={20} />
          </button>
        )}

        {/* Menu Dropdown - Vertical More sign */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className={`btn btn-ghost btn-circle btn-sm text-blue-600 hover:bg-blue-100 ${showMenu ? "btn-active bg-blue-100" : ""}`}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 z-[50]">
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
            </div>
          )}
        </div>
      </div>

      {/* MODALS - Remain unchanged */}
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
  );
}
