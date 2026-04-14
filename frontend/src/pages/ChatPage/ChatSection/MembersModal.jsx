import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getMembersAPI } from "./api/fetchChatsAPI";

export default function MembersModal({ conversationId, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  ==========================
  FETCH MEMBERS
  ==========================
  */
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getMembersAPI(conversationId);
        setMembers(res.data.members || []);
      } catch (err) {
        console.error("Failed to fetch members", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [conversationId]);

  /*
  ==========================
  ESC KEY CLOSE
  ==========================
  */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* CARD */}
      <div
        className="w-[380px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold tracking-wide">
            Group Members
          </h2>

          <X
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-black transition"
          />
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {loading ? (
            <div className="text-center py-10 text-gray-500 animate-pulse">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No members found
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                {/* LEFT */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold shadow">
                    {member.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="font-medium text-sm">
                      {member.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      @{member.uniqueId}
                    </div>
                  </div>
                </div>

                {/* ROLE */}
                {member.role === "admin" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                    Admin
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}