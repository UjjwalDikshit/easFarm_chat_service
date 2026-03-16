import { axiosClient } from "./axiosClient";

export const checkMeAPI = async () => {
  const response = await axiosClient.get("/authenticate/user");
  return response.data;
};