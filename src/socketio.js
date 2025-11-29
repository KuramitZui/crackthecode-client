import { io } from "socket.io-client";

const SERVER_URL = process.env.REACT_APP_SOCKET_SERVER;

const socket = io(SERVER_URL, {
  transports: ["websocket"], // force WebSocket, skip polling
  withCredentials: true,     // optional for CORS/session handling
});

export default socket;
