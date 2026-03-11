// Top bar of chat.
// Shows user/group name, avatar, online status, actions (call, menu).
import React from "react";
import { MoreVertical } from "lucide-react";

export default function ChatHeader(){
    return (
        <>
            <div className="h-16 bg-white border-b flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                    R
                    </div>
                    <div>
                    <div className="font-semibold">Rahul</div>
                    <div className="text-sm text-green-500">Online</div>
                    </div>
                </div>

                <MoreVertical className="cursor-pointer text-gray-600 hover:text-black" />
            </div>

        </>
    )
}

