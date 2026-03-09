import { MessageSquarePlus } from "lucide-react";
import React from "react";

const CreateConversation = ({ onCreate }) => {
  return (
    <div
      onClick={onCreate}
      className="flex items-center gap-3 p-4 cursor-pointer border-b hover:bg-gray-100 transition"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
        <MessageSquarePlus size={20} />
      </div>

      <div>
        <p className="font-medium">New Conversation</p>
        <p className="text-sm text-gray-500">Start chatting with someone</p>
      </div>
    </div>
  );
};

export default CreateConversation;