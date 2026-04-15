import React, { useEffect, useState, useRef } from "react";
import { Link2, Copy, Check, AlertCircle } from "lucide-react";
import { getInviteLinkAPI } from "./api/fetchChatsAPI";

export default function InviteLinkButton({ conversationId }) {
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const ref = useRef();

  /*
  ==========================
  FETCH ON OPEN
  ==========================
  */
  useEffect(() => {
    if (!open) return;

    const fetchInvite = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getInviteLinkAPI(conversationId);

        if (res.success) {
          setInvite(res.invite);
        } else {
          setError("Failed to fetch invite");
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [open, conversationId]);

  /*
  ==========================
  CLOSE ON OUTSIDE CLICK
  ==========================
  */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /*
  ==========================
  COPY
  ==========================
  */
  const handleCopy = () => {
    if (!invite?.inviteCode) return;

    navigator.clipboard.writeText(invite.inviteCode);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative" ref={ref}>
      {/* BUTTON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Link2 className="w-5 h-5 text-gray-600 hover:text-black" />
      </button>

      {/* POPOVER */}
      {open && (
        <div className="absolute right-0 top-12 w-72 bg-white border rounded-xl shadow-lg p-4 z-50">
          <div className="text-sm font-semibold mb-2">
            Invite to Group
          </div>

          {/* LOADING */}
          {loading && (
            <div className="text-sm text-gray-400">Loading...</div>
          )}

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {!loading && invite && (
            <>
              {/* CODE BOX */}
              <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg mb-3">
                <span className="font-mono text-sm">
                  {invite.inviteCode}
                </span>

                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              {/* COPY STATUS */}
              {copied && (
                <div className="text-xs text-green-500">
                  Copied to clipboard
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}