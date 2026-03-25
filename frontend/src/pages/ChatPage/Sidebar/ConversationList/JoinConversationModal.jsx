// JoinConversationModal.jsx
import React, { useState } from "react";

export default function JoinConversationModal({ onClose, onSubmit }) {
  const [inviteCode, setInviteCode] = useState("");

  const handleJoin = () => {
    if (!inviteCode.trim()) {
      alert("Enter invite code");
      return;
    }

    onSubmit(inviteCode);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-[320px]">
        <h2 className="text-lg font-semibold mb-4">
          Join via Invite
        </h2>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Enter invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={handleJoin}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}