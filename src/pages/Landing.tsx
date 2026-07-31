import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { Target, BookOpen, Bot, CheckCircle, Sparkles, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 w-full">

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center py-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wide">
            <Sparkles size={13} className="text-amber-400" />
            <span>Next-Generation Adaptive STEM AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight tracking-tight">
            Learn STEM Smarter,<br />
            <span className="gradient-text-indigo">Not Harder.</span>
          </h1>

          <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed">
            LearnFlow AI generates custom roadmaps, analyzes uploaded study notes, and creates adaptive quizzes perfectly tailored to your pace.
          </p>

          <div className="pt-4 w-full max-w-xs">
            <PrimaryButton text="Get Started Free" onClick={() => navigate("/login")} icon={<ArrowRight size={17} />} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 pt-3 text-xs font-semibold text-slate-500">
            {["Instant AI Note Analysis", "Adaptive Diagnostic Tests", "Personalized Progress Tracking"].map((f) => (
              <div key={f} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid sm:grid-cols-3 gap-6 pb-20">
          {[
            { icon: Target, color: "indigo", emoji: "🎯", title: "Diagnostic Assessment", desc: "AI evaluates your current STEM knowledge before tailoring a unique learning path." },
            { icon: BookOpen, color: "purple", emoji: "📚", title: "Micro Lessons & Quizzes", desc: "Break down complex formulas into digestible micro-modules with instant practice quizzes." },
            { icon: Bot, color: "pink", emoji: "🤖", title: "Document Tutor", desc: "Upload any PDF or photo notes for immediate AI-simplified explanations and tests." },
          ].map(({ icon: Icon, color, emoji, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-200 p-8 hover:-translate-y-1 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
            >
              <div className={`w-13 h-13 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-5 text-2xl`}>
                {emoji}
              </div>
              <h2 className="font-bold text-lg text-slate-900 mb-2">{title}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
};

export default Landing;