import React, { useState, useRef } from "react";
import { removeMemberAPI } from "./api/conversationAPI";

export default function RemoveMemberModal({ conversationId, onClose }) {
  const [uniqueId, setUniqueId] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleRemove = async () => {
    const trimmedId = uniqueId.trim();

    if (!trimmedId) {
      alert("Please enter Unique ID");
      return;
    }

    if (loading) return; //  prevent double click

    setLoading(true);

    try {
      await removeMemberAPI(conversationId, trimmedId);

      alert("Member removed successfully");

      setUniqueId(""); //  reset input
      onClose();

    } catch (err) {
      console.error("Remove member error:", err);

      alert(
        err?.response?.data?.error ||
        err?.message ||
        "Failed to remove member"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ==========================
  HANDLE ENTER KEY
  ==========================
  */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRemove();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      
      {/* CARD */}
      <div className="bg-white rounded-lg shadow-lg w-80 p-5 pointer-events-auto border">

        <h2 className="text-lg font-semibold mb-4">
          Remove Member
        </h2>

        {/* INPUT */}
        <input
          ref={inputRef}
          autoFocus
          type="text"
          placeholder="Enter Unique ID"
          value={uniqueId}
          onChange={(e) => setUniqueId(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border px-3 py-2 rounded mb-4 outline-none focus:ring-2 focus:ring-red-400"
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-500 hover:text-black disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleRemove}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Removing..." : "Remove"}
          </button>

        </div>
      </div>
    </div>
  );
}