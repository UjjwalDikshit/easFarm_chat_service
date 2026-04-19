import { axiosClient } from "../../../../utils/axiosClient";
import { getSocket } from "../../../../socket/socket";
import createConversationAPI from "./createConversationAPI";

import {
  addConversation,
  replaceConversation,
  removeConversation,
} from "../../../../store/conversationSlice";

export const handleCreateConversation = async ({
  data,
  dispatch,
  setSelectedConversation,
  setShowModal,
}) => {
  const socket = getSocket();
  const tempId = "temp-" + Date.now();

  /*
  ==========================
   VALIDATION
  ==========================
  */

  if (data.type === "private" && (!data.members || data.members.length !== 1)) {
    alert("Select exactly 1 user");
    return;
  }

  if (
    data.type === "private-group" &&
    (!data.members || data.members.length === 0)
  ) {
    alert("Add at least 1 member");
    return;
  }

  if (data.type !== "private" && (!data.name || data.name.trim().length < 3)) {
    alert("Group name must be at least 3 characters");
    return;
  }

  // first here check is conversation for private chat, for this private key exist;
  // CHECK EXISTING PRIVATE CHAT
  if (data.type === "private") {
    const state = dispatch((_, getState) => getState());
    const conversations = state.conversations.byId;

    const existingConv = Object.values(conversations).find((conv) => {
      return (
        conv.type === "private" && conv.otherMember?.uniqueId === data.members[0]
      );
    });

    if (existingConv) {
      console.log("yes found already existed conversation");
      setSelectedConversation(existingConv._id);
      setShowModal(false);

      return; //  STOP HERE (NO API CALL)
    }
  }
  /*
  ==========================
  1️ OPTIMISTIC ADD
  ==========================
  */

  dispatch(
    addConversation({
      _id: tempId,
      type: data.type,
      name: data.type === "private" ? data.members[0] : data.name,
      otherMember:
        data.type === "private"
          ? { uniqueId: data.members[0], name: data.members[0] }
          : null,

      isTemp: true,
      lastMessage: null,
      lastMessageAt: new Date().toISOString(),

      unreadCount: 0,
      role: "admin", //  add this
    }),
  );

  /*
  ==========================
  2️OPEN TEMP CHAT
  ==========================
  */

  setSelectedConversation(tempId);
  setShowModal(false);

  try {
    /*
    ==========================
    3️ API CALL
    ==========================
    */

    const res = await createConversationAPI(data);

    const realConv = res.data.data.conversation;

    /*
    ==========================
    4️ REPLACE TEMP
    ==========================
    */

    dispatch(
      replaceConversation({
        tempId,
        conversation: realConv,
      }),
    );

    /*
    ==========================
    5️ JOIN SOCKET
    ==========================
    */

    if (socket) {
      socket.emit("join_conversation", {
        conversationId: realConv._id,
      });
    }
    /*
    ==========================
    6️ OPEN REAL CHAT
    ==========================
    */

    setSelectedConversation(realConv._id);
  } catch (err) {
    console.error("Create conversation error:", err);

    /*
    ==========================
     ROLLBACK
    ==========================
    */

    dispatch(removeConversation(tempId));

    alert(err.response?.data?.error || "Failed to create conversation");
  }
};
