import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socketio";

export default function CreateJoin() {
  const [inputName, setInputName] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for room list updates from server
    const handleRoomList = (list) => setRooms(list);
    socket.on("roomList", handleRoomList);

    // Request current rooms immediately on mount
    socket.emit("requestRooms");

    // Cleanup on unmount
    return () => socket.off("roomList", handleRoomList);
  }, []);

  const handleCreate = () => {
    if (!inputName) return alert("Enter your name");
    socket.emit(
      "createRoom",
      { name: inputName },
      ({ roomId, playerNumber }) => {
        navigate(`/game/${roomId}`, {
          state: { name: inputName, playerNumber },
        });
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
        navigate(`/game/${roomId}`, {
          state: { name: inputName, playerNumber },
        });
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-gray-900 p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <span>Crack The Code</span>
          </h1>
          <p className="text-emerald-300 text-lg">Choose your path to victory</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Create/Join Room */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
              Start Playing
            </h2>

            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>

              {/* Create Room Button */}
              <button
                onClick={handleCreate}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Create New Room
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-emerald-300 text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Join Room */}
              <div>
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Room ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter Room ID..."
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="flex-1 bg-white/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <button
                    onClick={() => handleJoin(roomInput)}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Available Rooms */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
              Available Rooms
            </h3>

            {rooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">🔍</div>
                <p className="text-gray-400 text-lg">No rooms available</p>
                <p className="text-gray-500 text-sm mt-2">Be the first to create one!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white/5 border border-emerald-500/20 rounded-xl p-4 hover:bg-white/10 hover:border-emerald-500/40 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-emerald-400 font-mono font-bold text-lg">
                            #{r.id}
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full">
                            {r.status === "waiting" ? "OPEN" : "IN GAME"}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Host: <span className="text-white font-medium">{r.player1}</span>
                        </p>
                      </div>
                      {r.status === "waiting" && (
                        <button
                          onClick={() => handleJoin(r.id)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-5 py-2 rounded-lg hover:shadow-lg transform group-hover:scale-105 transition-all duration-300"
                        >
                          Join →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="text-emerald-300 hover:text-white transition-colors duration-300 flex items-center gap-2 mx-auto"
          >
            <span>←</span>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
