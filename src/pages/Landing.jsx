import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        {/* Main content */}
        <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20">
          {/* Icon/Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="text-8xl animate-bounce">🔐</div>
              <div className="absolute inset-0 text-8xl blur-sm opacity-50 animate-pulse">🔐</div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            Crack The Code
          </h1>

          {/* Tagline */}
          <p className="text-xl text-emerald-200 mb-12 font-light ">
            Test your logic. Break the sequence. Claim victory.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/create-join')}
            className="group relative w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl font-semibold py-5 px-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              Start Game
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Feature hints */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="text-white/80">
              <div className="text-3xl mb-2">🧩</div>
              <div className="text-sm">Strategic</div>
            </div>
            <div className="text-white/80">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm">Fast-Paced</div>
            </div>
            <div className="text-white/80">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm">Competitive</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
