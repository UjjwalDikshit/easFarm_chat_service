import { addConversation } from "../../../../store/conversationSlice";
import { joinViaInviteAPI } from "../../ChatSection/api/conversationAPI";
import { getSocket } from "../../../../socket/socket";

export const handleJoinViaInvite = async ({
  inviteCode,
  dispatch,
  setSelectedConversation,
  setShowJoinModal,
}) => {
  const socket = getSocket();

  try {
    console.log(inviteCode)
    const res = await joinViaInviteAPI(inviteCode);
    
    const conversation = res.data.data;
    console.log(conversation);
    /*
    ==========================
     PREVENT DUPLICATE
    ==========================
    */
    dispatch(addConversation(conversation));

    /*
    ==========================
     JOIN SOCKET
    ==========================
    */
    socket.emit("join_conversation", {
      conversationId: conversation._id,
    });

    /*
    ==========================
     OPEN CHAT
    ==========================
    */
    setSelectedConversation(conversation._id);

    setShowJoinModal(false);

  } catch (err) {
    console.error("Join failed:", err);
    alert(err.response?.data?.error || "Invalid invite code");
  }
};