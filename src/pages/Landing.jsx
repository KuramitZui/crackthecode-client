import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 right-1/5 w-48 sm:w-72 h-48 sm:h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[pulse_7s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[pulse_8s_ease-in-out_infinite]"></div>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md sm:max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-12 shadow-2xl border border-white/20 text-center sm:text-left transition-transform duration-500 hover:scale-[1.02]">
        
        {/* Logo */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="relative">
            <div className="text-6xl sm:text-8xl animate-[bounce_2s_infinite]">🔐</div>
            <div className="absolute inset-0 text-6xl sm:text-8xl blur-sm opacity-40 animate-[pulse_2s_infinite]">🔐</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
          Crack The Code
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-xl text-emerald-200 mb-6 sm:mb-10 font-light leading-relaxed">
          Test your logic. Break the sequence. Claim victory.
        </p>

        {/* CTA Button */}
<div className="flex justify-center">
  <button
    onClick={() => navigate("/create-join")}
    className="group relative w-full max-w-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg sm:text-xl font-semibold py-4 sm:py-5 px-6 sm:px-10 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-300 overflow-hidden"
  >
    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
      Start Game
      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
    </span>
    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
  </button>
</div>


        {/* Features */}
        <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="text-white/80">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🧩</div>
            <div className="text-xs sm:text-sm font-medium">Strategic</div>
          </div>
          <div className="text-white/80">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⚡</div>
            <div className="text-xs sm:text-sm font-medium">Fast-Paced</div>
          </div>
          <div className="text-white/80">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏆</div>
            <div className="text-xs sm:text-sm font-medium">Competitive</div>
          </div>
        </div>
      </div>
    </div>
  );
}
