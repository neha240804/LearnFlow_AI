import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import { CheckCircle, AlertTriangle, Brain } from "lucide-react";

export default function LearningProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};

  const [dbProgress, setDbProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.topic) {
      loadProgress();
    }
  }, [state.topic]);

  async function loadProgress() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch("/api/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const current = Array.isArray(data)
          ? data.find((p: any) => p.topic === state.topic)
          : null;
        if (current) {
          setDbProgress(current);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const topic = state.topic || dbProgress?.topic || "STEM Topic";
  const mastery = state.mastery !== undefined ? state.mastery : (dbProgress?.mastery || 0);
  const strong: string[] = state.strong || dbProgress?.strongConcepts || [];
  const average: string[] = state.average || [];
  const weak: string[] = state.weak || dbProgress?.weakConcepts || [];
  const roadmap = state.roadmap || [];
  const startConcept = state.startConcept || weak[0] || "Foundational Concept";
  const estimatedTime = state.estimatedTime || "15 mins";

  if (!state.topic && !dbProgress && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">No Learning Profile Found</h2>
          <p className="text-slate-500 text-sm mt-1 mb-4">Please start from the home page or complete a diagnostic assessment.</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs hover:bg-indigo-700 transition"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-6 sm:px-8 py-8 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Brain size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Your Learning Profile
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Diagnostic summary & adaptive study path for <span className="font-semibold text-indigo-600">{topic}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Overall Mastery</p>
              <h2 className="text-4xl font-black text-slate-900 mt-2">
                {mastery}%
              </h2>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Strong Concepts</p>
              <div className="mt-3 space-y-2">
                {strong.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium">None identified yet</p>
                ) : (
                  strong.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Focus Concepts</p>
              <div className="mt-3 space-y-2">
                {weak.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium">None identified yet</p>
                ) : (
                  weak.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-rose-800">
                      <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-2">
            <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              ✨ AI Recommendation
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              Based on your diagnostic assessment, your primary focus target is{" "}
              <strong className="text-indigo-600 font-bold">{startConcept}</strong>.
            </p>
            <p className="text-slate-500 text-xs font-medium">
              Estimated study time: <strong className="text-slate-800">{estimatedTime}</strong>
            </p>
          </div>

          {average.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">Developing Concepts</p>
              <div className="space-y-2">
                {average.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                    <Brain size={16} className="text-amber-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-md mx-auto pt-2">
            <PrimaryButton
              text="Start Personalized Learning"
              onClick={() =>
                navigate("/lesson", {
                  state: {
                    topic,
                    roadmap,
                    concept: startConcept,
                    mastery,
                    strong,
                    average,
                    weak: weak.length > 0 ? weak : [startConcept],
                    current: 0,
                  },
                })
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}