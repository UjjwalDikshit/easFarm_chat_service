import { axiosClient } from "../../../../utils/axiosClient";

export const fetchConversationsAPI = async () => {
  const response = await axiosClient.get("/mything/fetch");
  return response.data.conversations;
};