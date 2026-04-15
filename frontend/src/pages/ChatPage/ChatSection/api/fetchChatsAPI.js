import { axiosClient } from "../../../../utils/axiosClient";


export const fetchChatsAPI = async (conversationId, cursor = null) => {
  const response = await axiosClient.get("/mything/getUserConversation", {
    params: {
      conversationId,
      cursor
    }
  });

  return response.data;
};

export const getMembersAPI = (conversationId) => {
  return axiosClient.get(
    `/mything/conversation/${conversationId}/members`
  );
};

export const getInviteLinkAPI = async (conversationId) => {
  try {
    const res = await axiosClient.get(
      `/user/conversations/${conversationId}/invite-link`
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};