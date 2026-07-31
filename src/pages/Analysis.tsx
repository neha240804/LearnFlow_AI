import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import { BookOpen, Sparkles, Clock, BarChart3, ArrowRight } from "lucide-react";

export default function Analysis() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-600 font-semibold mb-4 text-sm">No analysis data found.</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs hover:bg-indigo-700 transition"
          >
            Start Learning Topic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 inline-flex items-center gap-1 mb-2">
              <Sparkles size={12} className="text-amber-500" />
              AI Learning Path
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {state.topic}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Personalized concept roadmap generated specifically for your target topic.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BarChart3 size={15} className="text-indigo-600" />
              <span>{state.difficulty || "Intermediate"}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock size={15} className="text-amber-500" />
              <span>{state.estimatedTime || "15 mins"}</span>
            </div>
          </div>
        </div>

        {/* Roadmap Items */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={22} className="text-indigo-600" />
            Foundational Learning Sequence
          </h2>

          <div className="space-y-3">
            {state.roadmap?.map((item: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-indigo-200 transition duration-200 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto pt-4">
          <PrimaryButton
            text="Continue to Diagnostic Quiz"
            icon={<ArrowRight size={16} />}
            onClick={() => navigate("/diagnostic", { state })}
          />
        </div>
      </main>
    </div>
  );
}