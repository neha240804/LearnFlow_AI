import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Trophy,
  Flame,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  User as UserIcon,
  Sparkles,
  RotateCcw,
  HelpCircle,
} from "lucide-react";

interface ProgressItem {
  id: string;
  subject: string;
  topic: string;
  confidence: number;
  mastery: number;
  completed: boolean;
  weakConcepts: string[];
  strongConcepts: string[];
}

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  completedTopics: number;
  averageConfidence: number;
  progress: ProgressItem[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revisitingTopic, setRevisitingTopic] = useState<string | null>(null);

  async function handleRevisitTopic(topicName: string) {
    setRevisitingTopic(topicName);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ topic: topicName }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/analysis", { state: data });
      } else {
        navigate("/analysis", { state: { topic: topicName } });
      }
    } catch (err) {
      console.error(err);
      navigate("/analysis", { state: { topic: topicName } });
    } finally {
      setRevisitingTopic(null);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          setData(profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh] text-xl font-semibold text-slate-600">
          Loading Learning Dashboard...
        </div>
      </div>
    );
  }

  const progressList = data?.progress || [];
  const completedCount = data?.completedTopics || progressList.filter((p) => p.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              📊 Learning Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Welcome back, <span className="font-semibold text-indigo-600">{data?.name || "Student"}</span>! Track your STEM mastery and overall progress.
            </p>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-5 py-3 rounded-xl text-xs font-bold transition self-start md:self-auto"
          >
            <UserIcon size={16} />
            My Profile
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center gap-4 border-l-4 border-l-indigo-500">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Trophy size={26} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total XP</p>
              <h3 className="text-2xl font-black text-slate-900">{data?.xp ?? 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Flame size={26} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Day Streak</p>
              <h3 className="text-2xl font-black text-slate-900">{data?.streak ?? 1} 🔥</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={26} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed Topics</p>
              <h3 className="text-2xl font-black text-slate-900">{completedCount}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center gap-4 border-l-4 border-l-sky-500">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <Sparkles size={26} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Average Confidence</p>
              <h3 className="text-2xl font-black text-slate-900">{data?.averageConfidence ?? 0}%</h3>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Topics List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={22} className="text-indigo-600" />
                Active Topics & Progress
              </h2>
              <button
                onClick={() => navigate("/home")}
                className="text-indigo-600 font-bold hover:underline text-xs"
              >
                + Analyze New Topic
              </button>
            </div>

            {progressList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-center">
                <p className="text-slate-600 font-semibold text-sm">No active topics found yet.</p>
                <p className="text-xs text-slate-400 mt-1">Start by analyzing a topic from the home page.</p>
                <button
                  onClick={() => navigate("/home")}
                  className="mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Start Learning
                </button>
              </div>
            ) : (
              progressList.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 hover:border-indigo-200 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {item.subject || "STEM"}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{item.topic}</h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.completed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.completed ? "Mastered ✅" : "In Progress ⌛"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-500">Mastery Level</span>
                      <span className="text-slate-900 font-extrabold">{item.mastery}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${item.mastery}%` }}
                      />
                    </div>
                  </div>

                  {/* Revisit Topic Action Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => handleRevisitTopic(item.topic)}
                      disabled={revisitingTopic === item.topic}
                      className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition duration-200 disabled:opacity-60"
                    >
                      <RotateCcw size={14} className={revisitingTopic === item.topic ? "animate-spin" : ""} />
                      <span>{revisitingTopic === item.topic ? "Loading Roadmap..." : "Revisit Roadmap"}</span>
                    </button>

                    <button
                      onClick={() =>
                        navigate("/quiz", {
                          state: {
                            topic: item.topic,
                            weak: item.weakConcepts && item.weakConcepts.length > 0 ? item.weakConcepts : [],
                            current: 0,
                          },
                        })
                      }
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200"
                    >
                      <HelpCircle size={14} className="text-indigo-600" />
                      <span>Practice Quiz</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions / Recommendations Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <h3 className="text-base font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/home")}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 transition flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">Analyze New Topic</p>
                    <p className="text-xs text-slate-400">Build a new AI learning path</p>
                  </div>
                  <ArrowRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 transition flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">View Full Profile</p>
                    <p className="text-xs text-slate-400">Inspect achievements & history</p>
                  </div>
                  <ArrowRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}