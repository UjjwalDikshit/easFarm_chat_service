import { axiosClient } from "../../../../utils/axiosClient";

export const leaveConversationAPI = (conversationId) => {
  return axiosClient.post(`/conversation/leave/${conversationId}`);
};

export const blockConversationAPI = (conversationId) => {
  return axiosClient.post("/conversation/block", { conversationId });
};

export const unblockConversationAPI = (conversationId) => {
  return axiosClient.post("/conversation/unblock", { conversationId });
};
export const removeMemberAPI = (conversationId, memberId) => {
  return axiosClient.post("/conversation/remove-member", {
    conversationId,
    memberId,
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