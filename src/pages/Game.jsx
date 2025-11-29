import { useState, useEffect, useRef} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socket from "../socketio";
import { FaInfoCircle } from "react-icons/fa";

export default function Game() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { name, playerNumber } = location.state || {};

  const [room, setRoom] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [code, setCode] = useState(["", "", "", ""]);
  const [guess, setGuess] = useState(["", "", "", ""]);
  const [showRematchPrompt, setShowRematchPrompt] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [showColorGuide, setShowColorGuide] = useState(false);
  const [notification, setNotification] = useState("");
  const [showSurrenderPrompt, setShowSurrenderPrompt] = useState(false);
  const [opponentSurrendered, setOpponentSurrendered] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const handleRoomUpdate = (updatedRoom) => {
      setRoom(updatedRoom);
      setCurrentTurn(updatedRoom.currentTurn);
    };

    // KEY FIX: Navigate away when opponent leaves
    const handlePlayerLeft = ({ name, surrendered }) => {
      showTempNotification(surrendered ? `${name} surrendered.` : `${name} left the game.`);
      
      // Navigate back to lobby after a short delay
      setTimeout(() => {
        navigate('/create-join', { replace: true });
      }, 2000);
    };

    socket.on("roomUpdate", handleRoomUpdate);
    socket.on("playerJoined", ({ name }) => showTempNotification(`${name} has joined the game!`));
    socket.on("playerLeft", handlePlayerLeft); // This now properly handles navigation
    socket.on("rematchRequested", () => setShowRematchPrompt(true));
    socket.on("rematchAccepted", () => {
      setCode(["", "", "", ""]);
      setGuess(["", "", "", ""]);
      setShowRematchPrompt(false);
      setWaitingForOpponent(false);
      setOpponentSurrendered(false);
    });
    socket.on("rematchDeclined", () => {
      showTempNotification("Opponent declined. Returning to home.");
      setTimeout(() => navigate('/create-join', { replace: true }), 1500);
    });

    socket.on("opponentSurrendered", ({ name }) => {
      setOpponentSurrendered(true);
      showTempNotification(`${name} surrendered. You win!`);
    });

    socket.on("surrendered", () => {
      setTimeout(() => navigate('/create-join', { replace: true }), 1000);
    });

    // Request initial room state
    socket.emit("getRoomState", roomId);

    return () => {
      socket.off("roomUpdate", handleRoomUpdate);
      socket.off("playerJoined");
      socket.off("playerLeft", handlePlayerLeft);
      socket.off("rematchRequested");
      socket.off("rematchAccepted");
      socket.off("rematchDeclined");
      socket.off("opponentSurrendered");
      socket.off("surrendered");
    };
  }, [roomId, navigate]);

  const showTempNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const submitCode = () => {
    if (code.some((c) => c === "")) return showTempNotification("Enter 4-digit code");
    socket.emit("setCode", { roomId, code: code.join("") });
  };

  const submitGuess = () => {
    if (guess.some((c) => c === "")) return showTempNotification("Guess must be 4 digits");
    socket.emit("makeGuess", { roomId, guess: guess.join("") });
    setGuess(["", "", "", ""]);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    showTempNotification("Room ID copied!");
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-emerald-950 to-gray-900">
        <div className="text-center text-white">
          <div className="text-6xl animate-pulse mb-4">🔐</div>
          <h2 className="text-2xl font-semibold">Loading game...</h2>
        </div>
      </div>
    );
  }

  const meKey = playerNumber === 1 ? "player1" : "player2";
  const opponentKey = playerNumber === 1 ? "player2" : "player1";
  const me = room[meKey];
  const opponent = room[opponentKey];

  const gameOver = !!room.winnerId;
  const canPlay = me.code && opponent?.code;
  const iWin = room.winnerId === socket.id;

  const colorMap = {
    green: "bg-green-500 border-green-600 shadow-green-500/50",
    yellow: "bg-yellow-400 border-yellow-500 shadow-yellow-400/50",
    red: "bg-red-500 border-red-600 shadow-red-500/50",
  };

  const renderHistory = (history) =>
    history?.map((h, idx) => (
      <div key={idx} className="flex mb-2">
        {h.guess.split("").map((num, i) => (
          <div
            key={i}
            className={`w-12 h-12 mr-2 flex items-center justify-center font-bold rounded-lg ${
              colorMap[h.results[i]] || "bg-gray-700 border-gray-600"
            } text-white border-2 shadow-lg`}
          >
            {num}
          </div>
        ))}
      </div>
    ));

  const getScore = (player) => {
    if (!room.score) return 0;
    return playerNumber === 1
      ? player === "player1"
        ? room.score.player1
        : room.score.player2
      : player === "player2"
      ? room.score.player1
      : room.score.player2;
  };

  const waitingMessage = !opponent
    ? "Waiting for opponent to join..."
    : !opponent.code
    ? "Waiting for opponent to set code..."
    : "";

  const requestRematch = () => {
    setWaitingForOpponent(true);
    socket.emit("requestRematch", { roomId });
  };

  const handleHomeClick = () => {
  if (opponent) {
    // If opponent exists, show surrender prompt
    setShowSurrenderPrompt(true);
  } else {
    // If alone, just leave the room without triggering surrender
    socket.emit("leaveRoom", { roomId }); // Optional: notify server
    navigate('/create-join', { replace: true });
  }
};

  const respondToRematch = (accept) => {
    socket.emit("respondRematch", { roomId, accept });
    setShowRematchPrompt(false);
    if (!accept) navigate('/create-join', { replace: true });
  };

  const respondToSurrender = (confirm) => {
    setShowSurrenderPrompt(false);
    if (confirm) {
      socket.emit("surrender", { roomId });
      // Don't navigate immediately - let the server response handle it
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-gray-900 p-6 relative">
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/20 text-white px-6 py-3 rounded-xl shadow-lg z-50 backdrop-blur-lg">
          {notification}
        </div>
      )}

      {/* Room ID + Back to Home */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <div
          className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-xl px-6 py-3 cursor-pointer hover:bg-white/15 transition"
          onClick={copyRoomId}
          title="Click to copy"
        >
          <span className="text-2xl">🔐</span>
          <div className="text-white">
            <p className="text-sm text-emerald-300">Room ID</p>
            <p className="font-mono font-bold text-xl">#{roomId}</p>
          </div>
        </div>

        <button
          onClick={handleHomeClick}
          className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
        >
          🏠 Home
        </button>
      </div>


      {/* Info Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowColorGuide(!showColorGuide)}
          className="inline-flex items-center gap-2 text-white bg-white/10 backdrop-blur-lg px-4 py-2 rounded-xl hover:bg-white/20 transition"
        >
          <FaInfoCircle className="text-emerald-300" />
          <span className="text-sm font-medium">How to Read Colors</span>
        </button>
      </div>

      {/* Color Guide */}
      {showColorGuide && (
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-xl mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 border border-green-600 shadow-lg"></div>
            <span className="text-white text-sm">Right number, right place</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 shadow-lg"></div>
            <span className="text-white text-sm">Right number, wrong place</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 border border-red-600 shadow-lg"></div>
            <span className="text-white text-sm">Wrong number</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Player Section */}
        <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border ${
          currentTurn === meKey ? "border-emerald-500/80" : "border-emerald-500/30"
        }`}>

          <div className="mb-6">
            <p className="text-emerald-200 text-sm font-medium mb-2">Your Secret Code</p>
            <div className="flex gap-2 mb-4">
              {me.code
                ? me.code.split("").map((num, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-xl rounded-xl border-2 border-emerald-400 shadow-lg"
                    >
                      {num}
                    </div>
                  ))
                : code.map((_, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      maxLength={1}
                      value={code[idx]}
                      inputMode="numeric"       // <— Forces numeric keyboard on mobile
                      pattern="[0-9]*" 
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/, "");

                        setCode((prev) => {
                          const arr = [...prev];
                          arr[idx] = val;
                          return arr;
                        });

                        // Auto move to next input
                        if (val && idx < code.length - 1) {
                          inputRefs.current[idx + 1]?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        // Move to previous input when pressing backspace on empty field
                        if (e.key === "Backspace" && !code[idx] && idx > 0) {
                          inputRefs.current[idx - 1]?.focus();
                        }
                      }}
                      className="w-14 h-14 text-center text-xl font-bold bg-white/10 border-2 border-emerald-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                  ))}
            </div>
            {!me.code && !gameOver && (
              <button
                onClick={submitCode}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
              >
                Lock Code 🔒
              </button>
            )}
          </div>

          <div>
            <p className="text-emerald-200 text-sm font-medium mb-2">Your Guesses</p>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
              {me.history && me.history.length > 0
                ? renderHistory(me.history)
                : <p className="text-gray-400 text-sm italic">No guesses yet</p>}
            </div>
          </div>
        </div>

        {/* Middle Guess Input */}
        <div className="flex flex-col justify-center items-center">
          {!canPlay ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 text-center w-full max-w-md">
              <div className="text-5xl mb-4 animate-pulse">⏳</div>
              <p className="text-white text-lg font-medium mb-2">{waitingMessage || "Waiting..."}</p>
            </div>
          ) : !gameOver ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-emerald-500/30 w-full max-w-md">
              {/* CURRENT TURN DISPLAY */}
              <div className="text-center mb-4">
                <span className="text-2xl block font-semibold text-white">
                  🕹️ {currentTurn === meKey ? "Your Turn" : `${opponent?.name}'s Turn`}
                </span>
              </div>

              <div className="text-center mb-4">
                <span className="text-4xl mb-2 block">🎯</span>
                <p className="text-white font-semibold text-lg">Make Your Guess</p>
                <p className="text-emerald-300 text-sm">Crack your opponent's code!</p>
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {guess.map((g, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  maxLength={1}
                  value={guess[idx]}
                  inputMode="numeric"       // <— Forces numeric keyboard on mobile
                  pattern="[0-9]*" 
                  onChange={(e) => {
                    if (currentTurn !== meKey) return;

                    const val = e.target.value.replace(/\D/, "");

                    setGuess((prev) => {
                      const arr = [...prev];
                      arr[idx] = val;
                      return arr;
                    });

                    // Auto focus NEXT input if value is entered
                    if (val && idx < guess.length - 1) {
                      inputRefs.current[idx + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (currentTurn !== meKey) return;

                    // If press backspace on empty, go to previous input
                    if (e.key === "Backspace" && !guess[idx] && idx > 0) {
                      inputRefs.current[idx - 1]?.focus();
                    }
                  }}
                  className={`w-16 h-16 text-center text-2xl font-bold bg-white/10 border-2 
                    border-emerald-500/50 rounded-xl text-white focus:outline-none 
                    focus:ring-2 focus:ring-emerald-500 transition ${
                      currentTurn !== meKey ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              ))}

              </div>
              <button
                onClick={submitGuess}
                disabled={currentTurn !== meKey}
                className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 rounded-xl hover:shadow-xl transform hover:scale-105 transition ${
                  currentTurn !== meKey ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Submit Guess
              </button>
            </div>
          ) : null}
        </div>

        {/* Opponent Section */}
        <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border ${
          currentTurn === opponentKey ? "border-rose-500/80" : "border-rose-500/30"
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎭</span>
            <h3 className="text-2xl font-bold text-white">Opponent</h3>
          </div>
          <p className="text-rose-300 text-sm mb-4">{opponent?.name || "Waiting..."}</p>

          {gameOver && opponent?.code && (
            <div className="mb-6">
              <p className="text-rose-200 text-sm font-medium mb-2">Their Secret Code</p>
              <div className="flex gap-2">
                {opponent.code.split("").map((num, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-rose-600 to-red-600 text-white font-bold text-xl rounded-xl border-2 border-rose-400 shadow-lg"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-rose-200 text-sm font-medium mb-2">Their Guesses</p>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
              {opponent?.history && opponent.history.length > 0
                ? renderHistory(opponent.history)
                : <p className="text-gray-400 text-sm italic">No guesses yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {(gameOver || opponentSurrendered) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center max-w-sm">
            <div className="text-6xl mb-4">
              {opponentSurrendered ? "🏆" : iWin ? "🏆" : "😢"}
            </div>
            <h2 className="text-3xl text-white font-bold mb-2">
              {opponentSurrendered ? "You Win!" : iWin ? "You Win!" : "You Lose"}
            </h2>
            <p className="text-white mb-4">Opponent: {opponent?.name || "N/A"}</p>
            <p className="text-emerald-300 mb-6 font-bold text-xl">
              Score: {getScore(meKey)} - {getScore(opponentKey)}
            </p>

            {opponentSurrendered ? (
              <button
                onClick={() => navigate('/create-join', { replace: true })}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold py-3 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
              >
                🏠 Back to Home
              </button>
            ) : waitingForOpponent ? (
              <p className="text-emerald-300 animate-pulse">Waiting for opponent...</p>
            ) : showRematchPrompt ? null : (
              <button
                onClick={requestRematch}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
              >
                🔄 Play Again?
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rematch Prompt */}
      {showRematchPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center max-w-sm">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-2xl text-white font-bold mb-4">Rematch Request</h3>
            <p className="text-emerald-300 mb-6">{opponent?.name} wants a rematch!</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => respondToRematch(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
              >
                ✓ Accept
              </button>
              <button
                onClick={() => respondToRematch(false)}
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
              >
                ✗ Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Surrender Prompt */}
      {showSurrenderPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center max-w-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl text-white font-bold mb-4">Leave Game?</h3>
            <p className="text-gray-300 mb-6">This will count as a loss and you'll return to the lobby.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => respondToSurrender(true)}
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
              >
                Yes, Leave
              </button>
              <button
                onClick={() => respondToSurrender(false)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-xl transform hover:scale-105 transition"
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}