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
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh] text-xl font-medium text-gray-600">
          Loading Learning Dashboard...
        </div>
      </div>
    );
  }

  const progressList = data?.progress || [];
  const completedCount = data?.completedTopics || progressList.filter((p) => p.completed).length;
  const inProgressList = progressList.filter((p) => !p.completed);

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl shadow p-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Learning Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-semibold text-indigo-600">{data?.name || "Student"}</span>! Track your STEM mastery and overall progress.
            </p>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-5 py-3 rounded-xl font-semibold transition self-start md:self-auto"
          >
            <UserIcon size={18} />
            My Profile
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 border-indigo-500">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total XP</p>
              <h3 className="text-2xl font-bold text-gray-900">{data?.xp ?? 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 border-orange-500">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <Flame size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Day Streak</p>
              <h3 className="text-2xl font-bold text-gray-900">{data?.streak ?? 1} 🔥</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 border-green-500">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Topics</p>
              <h3 className="text-2xl font-bold text-gray-900">{completedCount}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 border-blue-500">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Sparkles size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Confidence</p>
              <h3 className="text-2xl font-bold text-gray-900">{data?.averageConfidence ?? 0}%</h3>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Topics List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen size={24} className="text-indigo-600" />
                Active Topics & Progress
              </h2>
              <button
                onClick={() => navigate("/home")}
                className="text-indigo-600 font-semibold hover:underline text-sm"
              >
                + Analyze New Topic
              </button>
            </div>

            {progressList.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center border">
                <p className="text-gray-500 font-medium">No active topics found yet.</p>
                <p className="text-sm text-gray-400 mt-1">Start by analyzing a topic from the home page.</p>
                <button
                  onClick={() => navigate("/home")}
                  className="mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Start Learning
                </button>
              </div>
            ) : (
              progressList.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow p-6 border hover:border-indigo-200 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {item.subject || "STEM"}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">{item.topic}</h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.completed ? "Mastered ✅" : "In Progress ⌛"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-gray-500">Mastery Level</span>
                      <span className="text-gray-900 font-semibold">{item.mastery}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${item.mastery}%` }}
                      />
                    </div>
                  </div>

                  {/* Weak / Strong Badges */}
                  <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                    {item.weakConcepts.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <span className="text-red-700 font-semibold text-xs uppercase flex items-center gap-1">
                          <AlertTriangle size={14} /> Focus Concepts
                        </span>
                        <p className="text-xs text-red-600 mt-1 line-clamp-1">
                          {item.weakConcepts.join(", ")}
                        </p>
                      </div>
                    )}

                    {item.strongConcepts.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <span className="text-green-700 font-semibold text-xs uppercase flex items-center gap-1">
                          <CheckCircle size={14} /> Strong Concepts
                        </span>
                        <p className="text-xs text-green-600 mt-1 line-clamp-1">
                          {item.strongConcepts.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions / Recommendations Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6 border">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-500" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/home")}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Analyze New Topic</p>
                    <p className="text-xs text-gray-500">Build a new AI learning path</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-800">View Full Profile</p>
                    <p className="text-xs text-gray-500">Inspect achievements & history</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}