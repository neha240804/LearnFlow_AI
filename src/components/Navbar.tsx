import { GraduationCap, Sparkles, User as UserIcon, Home as HomeIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return;
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error("Navbar loadUser error:", err);
      }
    }
    loadUser();
  }, []);

  const isHome = location.pathname === "/" || location.pathname === "/home";
  const isProfile = location.pathname === "/profile";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/home")}
        >
          <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <GraduationCap size={22} className="relative z-10" />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-amber-300 animate-pulse" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
              LearnFlow <span className="text-indigo-600 font-black">AI</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 tracking-wide">
              Personalized AI Learning
            </p>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Welcome, <strong className="text-indigo-600">{user.name}</strong></span>
            </div>
          )}

          <button
            onClick={() => navigate("/home")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              isHome
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <HomeIcon size={15} />
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              isProfile
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
            }`}
          >
            <UserIcon size={15} />
            <span>My Profile</span>
          </button>
        </div>

      </div>
    </header>
  );
}