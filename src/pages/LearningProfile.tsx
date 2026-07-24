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
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="max-w-4xl mx-auto p-8 text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-700">No Learning Profile Found</h2>
          <p className="text-gray-500 mt-2">Please start from the home page or complete a diagnostic assessment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex items-center gap-3">
            <Brain className="text-indigo-600" size={34} />
            <h1 className="text-3xl font-bold">
              Your Learning Profile
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-indigo-50 rounded-xl p-6">
              <p className="text-gray-500">Mastery</p>
              <h2 className="text-4xl font-bold mt-2">
                {mastery}%
              </h2>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <p className="text-gray-500">Strong Concepts</p>
              <div className="mt-3 space-y-2">
                {strong.length === 0 ? (
                  <p className="text-sm text-gray-400">None identified yet</p>
                ) : (
                  strong.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle size={18} className="text-green-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-6">
              <p className="text-gray-500">Weak Concepts</p>
              <div className="mt-3 space-y-2">
                {weak.length === 0 ? (
                  <p className="text-sm text-gray-400">None identified yet</p>
                ) : (
                  weak.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-red-800">
                      <AlertTriangle size={18} className="text-red-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="mt-8 bg-indigo-50 rounded-xl p-6">
            <h2 className="font-bold text-2xl text-indigo-900">
              AI Recommendation
            </h2>
            <p className="mt-4 text-gray-700">
              Based on your diagnostic assessment, your primary target concept is{" "}
              <strong className="text-indigo-600">{startConcept}</strong>.
            </p>
            <p className="mt-2 text-gray-600 text-sm">
              Estimated learning time: <strong>{estimatedTime}</strong>
            </p>
          </div>

          {average.length > 0 && (
            <div className="mt-6 bg-yellow-50 rounded-xl p-6">
              <p className="text-gray-500 font-semibold mb-2">Average Concepts</p>
              <div className="space-y-2">
                {average.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-yellow-800">
                    <Brain size={18} className="text-yellow-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 max-w-sm">
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
      </div>
    </div>
  );
}