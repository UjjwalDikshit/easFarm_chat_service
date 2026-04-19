import React, { useEffect, useState, useRef } from "react";
import { Link2, AlertCircle, Check, Copy, Loader2 } from "lucide-react";
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
        className={`p-2 rounded-full transition-all duration-200 ${
          open ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 text-blue-600"
        }`}
        title="Invite Link"
      >
        <Link2 className="w-5 h-5" />
      </button>

      {/* POPOVER */}
      {open && (
        <div className="absolute right-0 top-12 w-72 bg-white border border-blue-100 rounded-2xl shadow-xl p-5 z-50 animate-in fade-in zoom-in duration-200">
          <div className="text-sm font-bold text-blue-950 mb-3 flex items-center gap-2">
            <Link2 size={16} className="text-blue-600" />
            Invite to Group
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-blue-400 py-2">
              <Loader2 size={16} className="animate-spin" />
              Generating link...
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <div className="flex items-center gap-2 text-error text-xs bg-error/10 p-3 rounded-lg border border-error/20">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS STATE */}
          {!loading && invite && (
            <div className="space-y-3">
              <p className="text-[11px] text-blue-900/50 uppercase font-bold tracking-wider">
                Share this code
              </p>
              
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 px-3 py-2.5 rounded-xl group transition-all">
                <span className="font-mono text-sm font-bold text-blue-800">
                  {invite.inviteCode}
                </span>

                <button
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg transition-all ${
                    copied 
                      ? "bg-success/10 text-success" 
                      : "hover:bg-blue-200/50 text-blue-500"
                  }`}
                >
                  {copied ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              {copied && (
                <div className="text-[11px] font-medium text-success flex items-center gap-1 animate-in slide-in-from-left-1">
                  <Check size={12} />
                  Link copied to clipboard
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-blue-50">
            <p className="text-[10px] text-blue-900/40 text-center italic">
              Anyone with this code can join the group.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}