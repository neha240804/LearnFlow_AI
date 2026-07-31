import { BookOpen, Sparkles } from "lucide-react";

interface TopicInputProps {
  topic: string;
  setTopic: (value: string) => void;
}

const SUGGESTIONS = [
  "Linear Algebra",
  "Newton's Laws of Motion",
  "Operating Systems",
  "Organic Chemistry",
];

export default function TopicInput({
  topic,
  setTopic,
}: TopicInputProps) {
  return (
    <div className="glass-card rounded-2xl shadow-lg p-6 h-full flex flex-col justify-between border border-slate-200/80 hover:shadow-xl transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <BookOpen size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Enter Topic</h2>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
            Interactive Search
          </span>
        </div>

        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Type any concept or subject you are studying to build a custom roadmap & practice lessons.
        </p>

        <div className="relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Linear Algebra, Quantum Mechanics, Machine Learning..."
            className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-xs"
          />
          {topic && (
            <button
              onClick={() => setTopic("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            Popular Topics
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTopic(s)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all duration-200 ${
                  topic === s
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50/80 text-slate-600 border-slate-200/80 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}