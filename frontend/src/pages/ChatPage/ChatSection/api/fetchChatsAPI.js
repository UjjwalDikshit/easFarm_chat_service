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