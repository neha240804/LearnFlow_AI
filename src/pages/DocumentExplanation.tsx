import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  BookOpen, CheckCircle2, AlertTriangle, TrendingUp,
  FileText, ArrowRight, Star, Zap,
} from "lucide-react";

interface StudyNoteQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface NoteState {
  type: "notes";
  noteId?: string;
  fileName: string;
  extractionMethod?: "pdf-text" | "gemini" | "tesseract" | "filename" | "raw-text";
  confidence?: "high" | "low";
  subject: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  explanation: string;
  keyPoints: string[];
  commonMistakes: string[];
  questions: StudyNoteQuestion[];
  nextTopics: string[];
}

const DIFFICULTY_STYLES = {
  Beginner:     { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "🟢 Beginner" },
  Intermediate: { bg: "bg-amber-100 text-amber-700 border-amber-200",     label: "🟡 Intermediate" },
  Advanced:     { bg: "bg-red-100 text-red-700 border-red-200",            label: "🔴 Advanced" },
};

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function DocumentExplanation() {
  const { state } = useLocation() as { state: NoteState | null };
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  async function handleSubmitQuiz(questions: StudyNoteQuestion[]) {
    const score = questions.filter((q, i) => selected[i] === q.correctAnswer).length;
    setSubmitted(true);

    const noteId = state?.noteId;
    const token = localStorage.getItem("token");
    if (noteId && token) {
      try {
        const answers = questions.map((q, i) => ({
          questionIndex: i,
          chosen: selected[i] ?? -1,
          correct: q.correctAnswer,
        }));
        const res = await fetch(`/api/upload-notes/${noteId}/quiz-result`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ score, total: questions.length, answers }),
        });
        if (res.ok) {
          const data = await res.json();
          setXpEarned(data.xpEarned ?? 0);
        }
      } catch (err) { console.error("Failed to save quiz result:", err); }
    }
  }

  if (!state || state.type !== "notes") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow border border-slate-200 p-10 text-center max-w-sm">
          <p className="text-slate-500 mb-6 font-medium text-sm">No note analysis found.</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const { fileName, extractionMethod, confidence, subject, topic, difficulty,
          summary, explanation, keyPoints, commonMistakes, questions, nextTopics } = state;

  const isHighConfidence = confidence === "high" || !confidence;
  const METHOD_LABELS: Record<string, string> = {
    "pdf-text": "Native PDF text", "raw-text": "PDF embedded text",
    "gemini": "Gemini Vision OCR", "tesseract": "Tesseract OCR",
    "filename": "Filename context (no text read)",
  };
  const methodLabel = extractionMethod ? (METHOD_LABELS[extractionMethod] ?? extractionMethod) : "AI Analysis";
  const diffStyle = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.Intermediate;
  const score = submitted ? questions.filter((q, i) => selected[i] === q.correctAnswer).length : 0;
  const allAnswered = Object.keys(selected).length === questions.length;

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-7 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-indigo-200 bg-white/10 border border-white/10 rounded-full px-3 py-1 font-semibold">
                <FileText size={12} />
                {fileName}
              </span>
              <span className="text-xs font-bold text-white bg-white/10 border border-white/10 rounded-full px-3 py-1">{subject}</span>
              <span className={`text-xs font-bold rounded-full px-3 py-1 border ${diffStyle.bg}`}>{diffStyle.label}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-4">{topic}</h1>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-xs bg-white text-indigo-700 px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen size={13} /> 📖 Explanation
              </button>
              <button
                onClick={() => document.getElementById("quiz-section")?.scrollIntoView({ behavior: "smooth" })}
                className="text-xs bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/20 transition flex items-center gap-1.5"
              >
                📝 Take Quiz ({questions.length} Qs)
              </button>
            </div>
          </div>
        </div>

        {/* ── Extraction Confidence Banner ────────────────────────────── */}
        {isHighConfidence ? (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
            <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-xs font-bold text-emerald-800">Document read accurately</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Processed via <span className="font-semibold">{methodLabel}</span>. Explanation and quiz are based directly on your uploaded content.
              </p>
            </div>
          </div>
        ) : extractionMethod === "tesseract" ? (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-xs font-bold text-amber-800">⚠️ Partial read — OCR was used</p>
              <p className="text-xs text-amber-700 mt-0.5">Local OCR can miss text in low-quality scans. For best results, upload a digital PDF or clear photo.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <AlertTriangle className="text-red-600 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-xs font-bold text-red-800">⚠️ Document could not be fully read</p>
              <p className="text-xs text-red-700 mt-0.5">AI generated a topic-based explanation using the filename. Upload a digital PDF or clear PNG/JPG for full text extraction.</p>
            </div>
          </div>
        )}

        {/* ── Summary ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600"><BookOpen size={18} /></div>
            <h2 className="font-bold text-slate-800 text-base">📌 Summary</h2>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{summary}</p>
        </div>

        {/* ── Simple Explanation ──────────────────────────────────────── */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600"><Star size={18} /></div>
            <h2 className="font-bold text-slate-800 text-base">💡 Explained in Simple Language</h2>
          </div>
          <p className="text-slate-700 text-sm leading-loose whitespace-pre-line font-medium">{explanation}</p>
        </div>

        {/* ── Key Points ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 text-base mb-4">🔑 Key Concepts & Takeaways</h2>
          <div className="grid gap-2.5">
            {keyPoints.map((pt, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="shrink-0 w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">{i + 1}</span>
                <span className="text-slate-700 text-xs leading-relaxed mt-0.5">{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Common Mistakes ─────────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600"><AlertTriangle size={18} /></div>
            <h2 className="font-bold text-slate-800 text-base">⚠️ Common Pitfalls & Mistakes</h2>
          </div>
          <div className="space-y-2">
            {commonMistakes.map((m, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-amber-900 bg-white border border-amber-200 rounded-xl p-3">
                <span className="shrink-0 text-amber-500">⚠️</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Interactive MCQ Quiz ─────────────────────────────────────── */}
        <div id="quiz-section" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600"><CheckCircle2 size={18} /></div>
              <h2 className="font-bold text-slate-800 text-base">📝 Practice Quiz ({questions.length} Questions)</h2>
            </div>
            {submitted && (
              <span className="text-xs font-bold text-slate-700">
                Score: <span className={score / questions.length >= 0.7 ? "text-emerald-600" : "text-amber-600"}>
                  {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                </span>
              </span>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((q, qi) => {
              const chosen = selected[qi];
              return (
                <div key={qi} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <p className="font-bold text-sm text-slate-800 flex items-start gap-2">
                    <span className="text-indigo-600 font-mono shrink-0">Q{qi + 1}.</span>
                    <span>{q.question}</span>
                  </p>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      let cls = "w-full text-left text-xs px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 font-medium";
                      if (!submitted) {
                        cls += chosen === oi
                          ? " border-indigo-500 bg-indigo-50 text-indigo-800"
                          : " border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 cursor-pointer";
                      } else {
                        if (oi === q.correctAnswer) cls += " border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                        else if (oi === chosen) cls += " border-red-400 bg-red-50 text-red-700 font-bold";
                        else cls += " border-slate-100 bg-white text-slate-400";
                      }
                      return (
                        <button
                          key={oi}
                          disabled={submitted}
                          onClick={() => setSelected((prev) => ({ ...prev, [qi]: oi }))}
                          className={cls}
                        >
                          <span className="shrink-0 w-6 h-6 rounded-lg border border-slate-300 text-[11px] font-black flex items-center justify-center bg-white">
                            {OPTION_LABELS[oi]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-800 leading-relaxed">
                      <span className="font-bold text-indigo-600">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submitted && (
            <button
              id="submit-quiz-btn"
              disabled={!allAnswered}
              onClick={() => handleSubmitQuiz(questions)}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                allAnswered
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 cursor-pointer"
                  : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Submit Answers ({Object.keys(selected).length}/{questions.length} answered)
            </button>
          )}

          {submitted && xpEarned !== null && xpEarned > 0 && (
            <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl px-4 py-3 shadow-md shadow-indigo-500/20">
              <Zap size={16} className="text-amber-300" />
              <span>🎉 +{xpEarned} XP Earned & Saved to Your Profile!</span>
            </div>
          )}
          {submitted && xpEarned !== null && xpEarned === 0 && (
            <div className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl px-4 py-3">
              <span>📊 Quiz saved to your profile. Keep practising to earn XP!</span>
            </div>
          )}
        </div>

        {/* ── Next Topics ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600"><TrendingUp size={18} /></div>
            <h2 className="font-bold text-slate-800 text-base">🚀 Recommended Next Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {nextTopics.map((t, i) => (
              <span key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-4 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <ArrowRight size={12} />
                {t}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
