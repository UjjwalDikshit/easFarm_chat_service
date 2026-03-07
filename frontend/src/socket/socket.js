import {io} from "socket.io-client"

let socket;

export const connectSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      withCredentials: true, // important for cookies
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = ()=>{
    return socket;
}

export const disconnectScoket = ()=>{
    if(socket){
        socket.disconnect();
        socket = null;
    }
};