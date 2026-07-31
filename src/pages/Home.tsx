import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import TopicInput from "../components/TopicInput";
import UploadBox from "../components/UploadBox";
import PrimaryButton from "../components/PrimaryButton";
import { Brain, Target, BookOpen, Flame, AlertCircle, Zap, Award } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Student");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState("Beginner");
  const [topic, setTopic] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user") || localStorage.getItem("learnflow-user");
    const token = localStorage.getItem("token");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.name) setUserName(user.name);
      } catch (e) {}
    }
    if (token) {
      fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          if (d.name) setUserName(d.name);
          if (d.xp !== undefined) setXp(d.xp);
          if (d.level) setLevel(d.level);
        })
        .catch(console.error);
    }
  }, []);

  async function handleAnalyze() {
    setError("");
    if (!topic.trim() && !selectedFile) {
      setError("Please enter a topic or upload your notes to get started.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch("/api/upload-notes", { method: "POST", headers, body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Failed to analyze document.");
        navigate("/explanation", { state: data });
      } else {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch("/api/analyze", { method: "POST", headers, body: JSON.stringify({ topic: topic.trim() }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Failed to analyze topic.");
        navigate("/analysis", { state: data });
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to analyze topic.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">

        {/* Hero Greeting Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              👋 Welcome back, <span className="text-indigo-600">{userName}</span>!
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Learn smarter, not harder.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-500 border border-amber-100">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">XP Points</p>
                <p className="text-xl font-black text-slate-900">{xp}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Level</p>
                <p className="text-xl font-extrabold text-indigo-600">{level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <TopicInput topic={topic} setTopic={setTopic} />
          <UploadBox selectedFile={selectedFile} setSelectedFile={setSelectedFile} onAnalyze={handleAnalyze} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 flex items-center gap-3 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Main CTA */}
        <div className="max-w-md">
          <PrimaryButton
            text={loading ? "Analyzing..." : selectedFile ? "✨ Analyze Uploaded Note" : "✨ Analyze & Build Learning Path"}
            onClick={handleAnalyze}
            loading={loading}
          />
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          {[
            { icon: Brain, color: "indigo", title: "AI Note Parsing", desc: "Extracts and simplifies content from PDFs and images for instant explanations." },
            { icon: Target, color: "emerald", title: "Gap Detection", desc: "Pinpoints weak concepts through adaptive diagnostic assessments." },
            { icon: BookOpen, color: "amber", title: "Smart Roadmaps", desc: "Sequences foundational concepts step-by-step for optimal understanding." },
            { icon: Flame, color: "rose", title: "Adaptive Practice", desc: "Provides instant XP rewards, streaks, and targeted concept quizzes." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className={`bg-white rounded-2xl border border-slate-200 p-5 hover:border-${color}-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
            >
              <div className={`w-11 h-11 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-4`}>
                <Icon size={22} />
              </div>
              <h3 className="font-bold text-sm text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}