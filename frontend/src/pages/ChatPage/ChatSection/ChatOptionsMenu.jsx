import React from "react";
import { useSelector } from "react-redux";

export default function ChatOptionsMenu({
  conversation,
  onClose,
  onAddMember,
  onLeave,
  onBlock,
  onUnblock,
  onRemoveMember,
  onDeleteGroup,
}) {
  const myId = useSelector((state) => state.auth.user?._id);

  const isAdmin = conversation.role === "admin";
  const isBlocked = conversation.isBlocked;

  const isPrivateChat = conversation.type === "private";
  const isPrivateGroup = conversation.type === "private-group";
  const isPublicGroup = conversation.type === "free-group";

  /*
  ==========================
  CONFIRM HELPERS 
  ==========================
  */
  const confirmAction = (message, action) => {
    if (window.confirm(message)) {
      action();
      onClose(); // close menu after action
    }
  };

  return (
    <div className="absolute right-4 top-14 bg-white shadow-lg rounded w-52 z-50 border overflow-hidden">

      {/* ADMIN BADGE */}
      {isAdmin && (
        <div className="px-4 py-2 text-xs bg-yellow-50 text-yellow-700 font-medium border-b">
          Admin Controls
        </div>
      )}

      {/* ==========================
          PRIVATE GROUP
      ========================== */}
      {isPrivateGroup && (
        <>
          {isAdmin ? (
            <>
              <MenuItem label="Add Member" onClick={onAddMember} />

              <MenuItem
                label="Remove Member"
                onClick={() =>
                  confirmAction(
                    "Remove a member from this group?",
                    onRemoveMember
                  )
                }
              />

              <MenuItem
                label="Delete Group"
                danger
                onClick={() =>
                  confirmAction(
                    "Are you sure you want to delete this group?",
                    onDeleteGroup
                  )
                }
              />
            </>
          ) : (
            <MenuItem
              label="Leave Group"
              danger
              onClick={() =>
                confirmAction(
                  "Are you sure you want to leave this group?",
                  onLeave
                )
              }
            />
          )}
        </>
      )}

      {/* ==========================
          PUBLIC GROUP
      ========================== */}
      {isPublicGroup && (
        <>
          {isAdmin ? (
            <MenuItem
              label="Delete Group"
              danger
              onClick={() =>
                confirmAction(
                  "Are you sure you want to delete this group?",
                  onDeleteGroup
                )
              }
            />
          ) : (
            <MenuItem
              label="Leave Group"
              danger
              onClick={() =>
                confirmAction(
                  "Are you sure you want to leave this group?",
                  onLeave
                )
              }
            />
          )}
        </>
      )}

      {/* ==========================
          PRIVATE CHAT
      ========================== */}
      {isPrivateChat && (
        <>
          {isBlocked ? (
            <MenuItem label="Unblock" onClick={onUnblock} />
          ) : (
            <MenuItem label="Block" onClick={onBlock} />
          )}
        </>
      )}

      {/* CLOSE */}
      <MenuItem label="Cancel" onClick={onClose} muted />
    </div>
  );
}

/*
==========================
REUSABLE MENU ITEM
==========================
*/
function MenuItem({ label, onClick, danger, muted }) {
  return (
    <div
      onClick={onClick}
      className={`
        px-4 py-2 cursor-pointer transition-colors
        hover:bg-gray-100
        ${danger ? "text-red-500 hover:bg-red-50" : ""}
        ${muted ? "text-gray-400" : ""}
      `}
    >
      {label}
    </div>
  );
}