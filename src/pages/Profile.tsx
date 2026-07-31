import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { RotateCcw, Upload, BookOpen, Award, Flame, Zap, CheckCircle2, TrendingUp } from "lucide-react";

type Progress = {
  id: string; subject: string; topic: string;
  confidence: number; mastery: number; completed: boolean;
  weakConcepts: string[]; strongConcepts: string[];
};

type UploadedNote = {
  id: string; fileName: string; fileType: string; fileSize: number;
  identifiedTopic: string | null; subject: string; difficulty: string;
  summary: string; keyConcepts: string[];
  quizScore: number; quizTotal: number; createdAt: string;
};

type UserProfile = {
  id: string; name: string; email: string; xp: number; streak: number;
  completedTopics: number; averageConfidence: number;
  totalNotesUploaded: number; averageNoteQuizScore: number;
  progress: Progress[]; uploadedNotes: UploadedNote[];
};

function diffBadge(d: string) {
  if (d === "Beginner") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (d === "Advanced") return "bg-red-100 text-red-700 border-red-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [revisiting, setRevisiting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed");
        setProfile(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleRevisit(topicName: string) {
    setRevisiting(topicName);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicName }),
      });
      const data = await res.json();
      navigate(res.ok ? "/analysis" : "/learning-profile", { state: res.ok ? data : { topic: topicName } });
    } catch { navigate("/learning-profile", { state: { topic: topicName } }); }
    finally { setRevisiting(null); }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-red-500 font-semibold text-sm">
        Unable to load profile. Please log in again.
      </div>
    </div>
  );

  const STATS = [
    { label: "XP Points", value: profile.xp, icon: Zap, color: "amber" },
    { label: "Daily Streak", value: `🔥 ${profile.streak}`, icon: Flame, color: "orange" },
    { label: "Completed", value: profile.completedTopics, icon: CheckCircle2, color: "emerald" },
    { label: "Confidence", value: `${profile.averageConfidence}%`, icon: TrendingUp, color: "sky" },
    { label: "Notes Uploaded", value: profile.totalNotesUploaded ?? 0, icon: Upload, color: "purple" },
    { label: "Note Quiz Avg", value: `${profile.averageNoteQuizScore ?? 0}%`, icon: Award, color: "rose" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />
      <main className="max-w-6xl mx-auto py-10 px-6 sm:px-8 space-y-10">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{profile.name}</h1>
                <p className="text-slate-500 text-xs mt-0.5">{profile.email}</p>
              </div>
            </div>
            <button onClick={() => navigate("/home")} className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition">
              Back to Home
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {STATS.map(({ label, value, color }) => (
              <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4`}>
                <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
                <p className="text-xl font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Uploaded Notes */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600"><Upload size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900">Uploaded Study Notes</h2>
            <span className="text-xs font-medium text-slate-400 ml-auto">{profile.uploadedNotes?.length ?? 0} document(s)</span>
          </div>

          {!profile.uploadedNotes || profile.uploadedNotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              No notes uploaded yet. Upload study notes from the home page to get AI explanations and quizzes here.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {profile.uploadedNotes.map((note) => {
                const pct = note.quizTotal > 0 ? Math.round((note.quizScore / note.quizTotal) * 100) : null;
                const quizDone = note.quizTotal > 0 && note.quizScore > 0;
                return (
                  <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate">{note.fileName}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(note.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${diffBadge(note.difficulty)}`}>{note.difficulty}</span>
                    </div>

                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      <span className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md px-2 py-0.5 font-semibold">{note.subject}</span>
                      {note.identifiedTopic && <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 rounded-md px-2 py-0.5">{note.identifiedTopic}</span>}
                    </div>

                    {note.summary && <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2">{note.summary}</p>}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={15} className={quizDone ? "text-emerald-600" : "text-slate-400"} />
                        {pct !== null && quizDone ? (
                          <span className="text-xs font-semibold text-slate-700">
                            Quiz: <span className={pct >= 70 ? "text-emerald-600" : "text-amber-600"}>{note.quizScore}/{note.quizTotal} ({pct}%)</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Quiz pending</span>
                        )}
                      </div>
                      {pct !== null && quizDone && (
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Learning Progress */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600"><BookOpen size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900">Topic Mastery & Progress</h2>
          </div>

          {profile.progress.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              No topic progress tracked yet. Enter a STEM topic on the home page to generate a learning path.
            </div>
          ) : (
            <div className="space-y-4">
              {profile.progress.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.topic}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.subject}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs border ${item.completed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {item.completed ? "✓ Mastered" : "In Progress"}
                      </span>
                      <button
                        onClick={() => handleRevisit(item.topic)}
                        disabled={revisiting === item.topic}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-60"
                      >
                        <RotateCcw size={13} className={revisiting === item.topic ? "animate-spin" : ""} />
                        {revisiting === item.topic ? "Loading..." : "Revisit"}
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4 text-xs text-slate-600">
                    <div className="space-y-1">
                      <p><strong className="text-slate-700">Confidence:</strong> {item.confidence}%</p>
                      <p><strong className="text-slate-700">Mastery Level:</strong> {item.mastery}%</p>
                    </div>
                    <div className="space-y-1">
                      <p><strong className="text-emerald-600">Strong Concepts:</strong> {item.strongConcepts.join(", ") || "None recorded"}</p>
                      <p><strong className="text-red-500">Weak Concepts:</strong> {item.weakConcepts.join(", ") || "None recorded"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}