import React from "react";
import { useSelector, useDispatch } from "react-redux";

export default function ChatOptionsMenu({
  conversation,
  onClose,
  onAddMember,
  onLeave,
  onBlock,
  onUnblock,
  onRemoveMember,
}) {
  const myId = useSelector((state) => state.auth.user?._id);

  const isAdmin = conversation.role === "admin";
  const isBlocked = conversation.isBlocked;

  return (
    <div className="absolute right-4 top-14 bg-white shadow-lg rounded w-48 z-50 border">
      {/* ADD MEMBER (ONLY ADMIN + GROUP) */}
      {conversation.type !== "private" && isAdmin && (
        <div
          onClick={onAddMember}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          Add Member
        </div>
      )}

      {/* REMOVE MEMBER (ONLY ADMIN) */}
      {conversation.type !== "private" && isAdmin && (
        <div
          onClick={onRemoveMember}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          Remove Member
        </div>
      )}

      {/* LEAVE GROUP */}
      {conversation.type !== "private" && !isAdmin && (
        <div
          onClick={onLeave}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
        >
          Leave Group
        </div>
      )}

      {/* BLOCK / UNBLOCK */}
      {isBlocked ? (
        <div
          onClick={onUnblock}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          Unblock
        </div>
      ) : (
        <div
          onClick={onBlock}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          Block
        </div>
      )}

      {/* CLOSE */}
      <div
        onClick={onClose}
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-400"
      >
        Cancel
      </div>
    </div>
  );
}