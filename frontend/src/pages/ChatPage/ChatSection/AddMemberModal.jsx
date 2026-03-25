import React, { useState } from "react";
import { addMemberAPI } from "./api/conversationAPI";

export default function AddMemberModal({
  conversationId,
  onClose,
}) {
  const [uniqueId, setUniqueId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!uniqueId.trim()) {
      alert("Please enter Unique ID");
      return;
    }

    setLoading(true);

    try {
      console.log(uniqueId.trim());
      await addMemberAPI(conversationId, uniqueId.trim());

      /*
      ==========================
      SOCKET WILL HANDLE UI UPDATE
      ==========================
      */
      alert("Member added successfully");
      onClose();

    } catch (err) {
      console.error("Add member failed:", err);

      alert(
        err?.response?.data?.error || "Failed to add member"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    
    {/* CARD */}
    <div className="bg-white rounded-lg shadow-lg w-80 p-5 pointer-events-auto border">

      <h2 className="text-lg font-semibold mb-4">
        Add Member
      </h2>

      {/* INPUT */}
      <input
        type="text"
        placeholder="Enter Unique ID"
        value={uniqueId}
        onChange={(e) => setUniqueId(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4 outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-500 hover:text-black"
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