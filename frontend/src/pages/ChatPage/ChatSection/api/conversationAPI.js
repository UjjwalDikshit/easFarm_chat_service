import { axiosClient } from "../../../../utils/axiosClient";

export const LeaveAndDeleteConversationAPI = (conversationId) => {
  return axiosClient.delete(`/user/conversation/leaveanddelete?conversationId=${conversationId}`);
};

export const blockConversationAPI = (conversationId) => {
  return axiosClient.post("/conversation/block", { conversationId });
};

export const unblockConversationAPI = (conversationId) => {
  return axiosClient.post("/conversation/unblock", { conversationId });
};
export const removeMemberAPI = (conversationId, uniqueId) => {
  return axiosClient.delete("/user/conversation/removeMember", {
    data: {
      conversationId,
      uniqueId,
    },
  });
};
export const addMemberAPI = (conversationId, uniqueId) => {
  return axiosClient.post("/user/conversation/addMember", {
    conversationId,
    uniqueId,
  });
};
export const joinViaInviteAPI = (code) => {
  return axiosClient.post("/user/conversation/joinViaInvite", { code });
};