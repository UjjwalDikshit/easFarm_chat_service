import React, { useState } from "react";
import { addMemberAPI } from "./api/conversationAPI";

export default function AddMemberModal({
  conversationId,
  onClose,
}) {
  const [uniqueId, setUniqueId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedId = uniqueId.trim(); //  FIX: avoid repeating trim

    if (!trimmedId) {
      alert("Please enter Unique ID");
      return;
    }

    if (!conversationId) { //  SAFETY CHECK
      alert("Invalid conversation");
      return;
    }

    setLoading(true);

    try {
      console.log(trimmedId);

      await addMemberAPI(conversationId, trimmedId);

      /*
      ==========================
      SOCKET WILL HANDLE UI UPDATE
      ==========================
      */

      alert("Member added successfully");

      setUniqueId(""); // FIX: reset input after success
      onClose();

    } catch (err) {
      console.error("Add member failed:", err);

      //  BETTER ERROR MESSAGE
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to add member";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      
      {/*  FIX: added backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* CARD */}
      <div className="relative bg-white rounded-lg shadow-lg w-80 p-5 border">

        <h2 className="text-lg font-semibold mb-4">
          Add Member
        </h2>

        {/* INPUT */}
        <input
          type="text"
          placeholder="Enter Unique ID"
          value={uniqueId}
          onChange={(e) => setUniqueId(e.target.value)}
          disabled={loading} //  prevent typing while loading
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit(); //  ENTER support
          }}
          className="w-full border px-3 py-2 rounded mb-4 outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          
          <button
            onClick={onClose}
            disabled={loading} //  disable while loading
            className="px-4 py-2 text-gray-500 hover:text-black disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>

        </div>
      </div>
    </div>
  );
}