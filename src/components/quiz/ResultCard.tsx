import { Zap, RotateCcw, ArrowRight, Trophy, TrendingUp } from "lucide-react";

interface Props {
  score: number;
  total: number;
  onNext: () => void;
  onRetry: () => void;
  earnedXP?: number | null;
  conceptName?: string;
}

export default function ResultCard({
  score,
  total,
  onNext,
  onRetry,
  earnedXP,
  conceptName,
}: Props) {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 75;
  const mastered = percentage >= 90;

  const feedbackConfig = mastered
    ? {
        emoji: "🏆",
        title: "Outstanding!",
        subtitle: "You've mastered this concept.",
        color: "from-emerald-500 to-teal-600",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
        barColor: "from-emerald-500 to-teal-500",
      }
    : passed
    ? {
        emoji: "✅",
        title: "Great Job!",
        subtitle: "You understand this concept well.",
        color: "from-indigo-500 to-purple-600",
        badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
        barColor: "from-indigo-500 to-purple-500",
      }
    : {
        emoji: "📚",
        title: "Keep Practicing",
        subtitle: "A quick review will help you level up.",
        color: "from-amber-500 to-orange-600",
        badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
        barColor: "from-amber-400 to-orange-500",
      };

  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${feedbackConfig.color} p-7 text-center text-white`}>
        <div className="text-5xl mb-2">{feedbackConfig.emoji}</div>
        <h2 className="text-2xl font-extrabold tracking-tight">{feedbackConfig.title}</h2>
        <p className="text-white/80 text-sm mt-1">{feedbackConfig.subtitle}</p>
        {conceptName && (
          <span className="mt-3 inline-block text-xs font-bold bg-white/20 rounded-full px-3 py-1">
            {conceptName}
          </span>
        )}
      </div>

      {/* Score Block */}
      <div className="p-6 space-y-5">
        {/* Score fraction + bar */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-slate-600">Your Score</span>
            <span className="text-2xl font-black text-slate-900">
              {score} <span className="text-slate-400 font-normal text-base">/ {total}</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${feedbackConfig.barColor} transition-all duration-700`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-500 mt-1">
            <span>Confidence</span>
            <span className="font-extrabold text-slate-900">{percentage}%</span>
          </div>
        </div>

        {/* XP Earned */}
        {earnedXP != null && earnedXP > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Zap size={18} className="fill-amber-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">XP Earned</p>
              <p className="text-base font-black text-amber-900">+{earnedXP} XP</p>
            </div>
          </div>
        )}

        {/* Mastery status badge */}
        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${feedbackConfig.badgeColor}`}>
          <TrendingUp size={13} />
          {mastered ? "Concept Mastered ✓" : passed ? "Proficient" : "Needs Review"}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          {!passed && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold text-sm transition duration-200"
            >
              <RotateCcw size={16} />
              Revisit Lesson & Retry
            </button>
          )}
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xs hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            {passed ? (
              <>
                <Trophy size={16} />
                Continue to Next Concept
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                Continue Anyway
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}