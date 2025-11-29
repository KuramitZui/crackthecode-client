import { io } from "socket.io-client";

// Ensure the environment variable is used
const SERVER_URL = process.env.REACT_APP_SOCKET_SERVER;

if (!SERVER_URL) {
  console.error("Connecting to server");
}

const socket = io(SERVER_URL, {
  transports: ["websocket"], // force WebSocket
  withCredentials: true,
});

export default socket;
