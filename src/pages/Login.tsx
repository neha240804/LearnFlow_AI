import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Sparkles, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!password.trim()) { setError("Please enter your password"); return; }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
      <div className="bg-white shadow-xl border border-slate-200 rounded-3xl w-full max-w-md p-10">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 mb-4">
            <GraduationCap size={28} />
            <Sparkles size={13} className="absolute -top-1 -right-1 text-amber-300 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back 👋</h1>
          <p className="text-slate-500 text-xs mt-1.5">Continue your personalized STEM learning journey.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@learnflow.ai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 disabled:opacity-60 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{loading ? "Logging in..." : "Login to Account"}</span>
          {!loading && <ArrowRight size={16} />}
        </button>

        <p className="text-center mt-6 text-slate-500 text-xs">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}