import { axiosClient } from "../../../../utils/axiosClient";

export default async function createConversationAPI(data){
    const res = await axiosClient.post("/user/conversation/create", data);
    return res;
}
