import { io } from "socket.io-client";

// Ensure the environment variable is used
//const SERVER_URL = process.env.REACT_APP_SOCKET_SERVER;

const SERVER_URL = "http://localhost:3001"; // Replace with your server URL

if (!SERVER_URL) {
  console.error("Connecting to server");
}

const socket = io(SERVER_URL, {
  transports: ["websocket"], // force WebSocket
  withCredentials: true,
});

export default socket;
