import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socketio";

export default function CreateJoin() {
  const [inputName, setInputName] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const updateRoomList = (list) => {
      const filtered = list.filter(
        (r) => r.status === "waiting" || r.status === "started"
      );
      setRooms(filtered);
    };

    // Listen for room list updates (this persists throughout the component lifecycle)
    socket.on("roomList", updateRoomList);

    // Request rooms when socket connects
    const requestRooms = () => socket.emit("requestRooms");
    socket.on("connect", requestRooms);

    // If already connected, request rooms immediately
    if (socket.connected) {
      requestRooms();
    }

    // Cleanup listeners on unmount
    return () => {
      socket.off("roomList", updateRoomList);
      socket.off("connect", requestRooms);
    };
  }, []); // Empty dependency array ensures this runs once and persists

  const handleCreate = () => {
    if (!inputName) return alert("Enter your name");
    socket.emit(
      "createRoom",
      { name: inputName },
      ({ roomId, playerNumber }) => {
        navigate(`/game/${roomId}`, { state: { name: inputName, playerNumber } });
      }
    );
  };

  const handleJoin = (roomId) => {
    if (!inputName) return alert("Enter your name");
    socket.emit(
      "joinRoom",
      { roomId, name: inputName },
      ({ error, playerNumber }) => {
        if (error) return alert(error);
        navigate(`/game/${roomId}`, { state: { name: inputName, playerNumber } });
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-gray-900 p-4 relative overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-40 sm:w-72 h-40 sm:h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 right-1/5 w-40 sm:w-72 h-40 sm:h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-[pulse_7s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 sm:w-72 h-40 sm:h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-[pulse_8s_ease-in-out_infinite]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 sm:mb-3">Crack The Code</h1>
          <p className="text-emerald-300 text-sm sm:text-lg">Choose your path to victory</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* Create/Join Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">Start Playing</h2>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-emerald-200 text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Create Room */}
            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 mb-4"
            >
              Create New Room
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-emerald-300 text-xs font-medium">OR</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Join Room */}
            <div>
              <label className="block text-emerald-200 text-sm font-medium mb-2">Room ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Room ID..."
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  className="flex-1 bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button
                  onClick={() => handleJoin(roomInput)}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Available Rooms Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 flex flex-col">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">Available Rooms</h3>

            {rooms.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <div className="text-6xl mb-3 opacity-50">🔍</div>
                <p className="text-gray-400 text-sm sm:text-base">No rooms available</p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Be the first to create one!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white/5 border border-emerald-500/20 rounded-xl p-3 sm:p-4 hover:bg-white/10 hover:border-emerald-500/40 transition-all duration-300 group flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-emerald-400 font-mono font-bold text-sm sm:text-lg">#{r.id}</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
                          {r.status === "waiting" ? "OPEN" : "IN GAME"}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">
                        Host: <span className="text-white font-medium">{r.player1}</span>
                      </p>
                    </div>
                    {r.status === "waiting" && (
                      <button
                        onClick={() => handleJoin(r.id)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-3 sm:px-5 py-2 rounded-lg hover:shadow-lg transform group-hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
                      >
                        Join →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-emerald-300 hover:text-white transition-colors duration-300 flex items-center gap-1 mx-auto text-sm sm:text-base"
          >
            <span>←</span> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}