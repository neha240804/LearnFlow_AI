import React, { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getLesson } from "../services/lessonApi";
import Navbar from "../components/Navbar";
import {
  BookOpen,
  Star,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Brain,
  Sparkles,
  Zap,
  Target,
  FlaskConical,
  HelpCircle,
  Play,
  ChevronDown,
  Layers,
  Eye,
  Trophy,
  Video,
  ExternalLink
} from "lucide-react";

interface LessonResponse {
  simpleExplanation: string;
  detailedExplanation: string;
  analogy: string;
  example: string;
  formulas: string[];
  commonMistakes: string[];
  summary: string;
}

// ── Callout Box Component ────────────────────────────────────────────────
interface CalloutProps {
  type: "did-you-know" | "think-about" | "fun-fact" | "challenge";
  children: ReactNode;
}

function Callout({ type, children }: CalloutProps) {
  const configs = {
    "did-you-know": {
      icon: "🧠",
      label: "Did You Know?",
      wrapClass: "bg-indigo-50/70 border border-indigo-100 text-indigo-900",
      labelClass: "text-indigo-700",
    },
    "think-about": {
      icon: "🤔",
      label: "Think About It",
      wrapClass: "bg-amber-50/70 border border-amber-100 text-amber-900",
      labelClass: "text-amber-700",
    },
    "fun-fact": {
      icon: "🌟",
      label: "Fun Fact",
      wrapClass: "bg-emerald-50/70 border border-emerald-100 text-emerald-900",
      labelClass: "text-emerald-700",
    },
    "challenge": {
      icon: "⚡",
      label: "Quick Challenge",
      wrapClass: "bg-rose-50/70 border border-rose-100 text-rose-900",
      labelClass: "text-rose-700",
    },
  };
  const c = configs[type];
  return (
    <div className={`${c.wrapClass} rounded-xl px-4 py-3.5 flex items-start gap-3 mt-3`}>
      <span className="text-lg shrink-0 mt-0.5">{c.icon}</span>
      <div>
        <p className={`text-[11px] font-extrabold uppercase tracking-wider mb-0.5 ${c.labelClass}`}>
          {c.label}
        </p>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-700">{children}</p>
      </div>
    </div>
  );
}

// ── Section Card Component ───────────────────────────────────────────────
interface SectionCardProps {
  icon: ReactNode;
  iconBg?: string;
  stepNumber?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function SectionCard({ icon, iconBg = "bg-indigo-50 text-indigo-600", stepNumber, title, subtitle, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 border border-slate-100`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {stepNumber && (
                <span className="text-[10px] font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase">
                  Step {stepNumber}
                </span>
              )}
              <h2 className="font-bold text-lg text-slate-900">{title}</h2>
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="text-slate-700 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// ── Accordion Item for Advanced Content ──────────────────────────────────
function AccordionItem({
  icon,
  iconBg = "bg-slate-100 text-slate-600",
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 border border-slate-100`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-indigo-600 hidden sm:inline">
            {isOpen ? "Collapse" : "Expand"}
          </span>
          <div
            className={`p-1.5 rounded-lg bg-slate-100 text-slate-500 transition-transform duration-200 ${
              isOpen ? "rotate-180 bg-indigo-50 text-indigo-600" : ""
            }`}
          >
            <ChevronDown size={18} />
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-slate-700 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────
function LessonSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-pulse border border-indigo-100">
            <Brain size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Generating Your Personalized Lesson...</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Our AI engine is crafting a clear, step-by-step explanation tailored to your topic ✨
          </p>
          <div className="flex justify-center flex-wrap gap-2 pt-2">
            {["Analyzing concept", "Building examples", "Creating key insights"].map((step, i) => (
              <span
                key={i}
                className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-semibold animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Lesson Page Component ───────────────────────────────────────────
export default function Lesson() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const topic = state.topic || "STEM";

  const initialCurrent = state.current !== undefined ? state.current : 0;
  const initialWeak = state.weak && state.weak.length > 0 ? state.weak : (state.concept ? [state.concept] : []);

  const [weak, setWeak] = useState<string[]>(initialWeak);
  const [current, setCurrent] = useState<number>(initialCurrent);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Accordion state for advanced content
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    deepDive: false,
    commonMistakes: false,
    analogy: false,
    funFacts: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (weak.length === 0) loadProgress();
  }, []);

  async function loadProgress() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/progress", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const progress = Array.isArray(data) ? data.find((p: any) => p.topic === topic) : null;
        if (progress?.weakConcepts?.length > 0) setWeak(progress.weakConcepts);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (weak.length > 0 && current < weak.length) {
      loadLesson();
    } else if (weak.length === 0) {
      loadLessonForConcept(state.concept || topic);
    }
  }, [weak, current]);

  async function loadLessonForConcept(conceptTitle: string) {
    setLoading(true);
    try {
      setLesson(await getLesson(topic, conceptTitle, current));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function loadLesson() {
    setLoading(true);
    try {
      const conceptTitle = weak[current] || state.concept || topic;
      setLesson(await getLesson(topic, conceptTitle, current));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function previousConcept() {
    if (current > 0) setCurrent(current - 1);
  }

  function goToQuiz() {
    navigate("/quiz", { state: { topic, weak, current } });
  }

  if (loading) return <LessonSkeleton />;

  if (!lesson)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-red-200 rounded-2xl p-6 text-center text-red-600 font-semibold text-sm max-w-sm shadow-xs">
            Failed to load lesson. Please check your connection and try again.
          </div>
        </div>
      </div>
    );

  const conceptTitle = weak[current] || state.concept || topic;
  const progress = weak.length > 0 ? Math.round(((current + 1) / weak.length) * 100) : 100;

  // Snippets for Did You Know & Reflection
  const detailedSentences = lesson.detailedExplanation
    .split(/[.!?]\s+/)
    .filter(Boolean);
  const didYouKnowSnippet = detailedSentences[Math.floor(detailedSentences.length / 2)] || detailedSentences[0];
  const thinkAboutSnippet = detailedSentences[detailedSentences.length - 1] || lesson.summary;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-8 space-y-6">

        {/* ── Header Card (Uniform Home Page Design) ────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 inline-flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  {topic}
                </span>
                <span className="text-xs font-semibold text-slate-400">• Step-by-Step Lesson</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {conceptTitle}
              </h1>
            </div>

            {weak.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 shrink-0 self-start sm:self-auto">
                <Target size={16} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">
                  Concept {current + 1} of {weak.length}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar & Breadcrumbs */}
          {weak.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Learning Progress</span>
                <span className="text-indigo-600">{progress}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Breadcrumb chips */}
              <div className="flex gap-1.5 pt-1 flex-wrap">
                {weak.map((c, i) => (
                  <span
                    key={i}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border transition ${
                      i === current
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : i < current
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {i < current ? "✓ " : ""}{c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══ STEP-BY-STEP CORE LESSON SECTIONS (DEFAULT VISIBLE) ════════════ */}
        <div className="space-y-5">

          {/* 1. Easy Explanation */}
          <SectionCard
            icon={<Lightbulb size={20} />}
            iconBg="bg-amber-50 text-amber-600"
            stepNumber={1}
            title="Easy Explanation"
            subtitle="The simple, intuitive core breakdown"
          >
            <p className="text-slate-700 text-sm leading-relaxed font-normal">
              {lesson.simpleExplanation}
            </p>
          </SectionCard>

          {/* 2. Key Concepts & Summary */}
          <SectionCard
            icon={<Star size={20} />}
            iconBg="bg-indigo-50 text-indigo-600"
            stepNumber={2}
            title="Key Takeaways & Summary"
            subtitle="Essential takeaways you need to know"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-700 text-sm leading-relaxed">{lesson.summary}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[lesson.summary, ...(lesson.formulas.length > 0 ? [`Formula: ${lesson.formulas[0]}`] : [])].map(
                  (t: string, i: number) => {
                    const txt: string = t.length > 65 ? t.slice(0, 62) + "..." : t;
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full"
                      >
                        <Star size={11} className="text-amber-500" />
                        {txt}
                      </span>
                    );
                  }
                )}
              </div>
            </div>
          </SectionCard>

          {/* 3. Real-World Example */}
          <SectionCard
            icon={<FlaskConical size={20} />}
            iconBg="bg-emerald-50 text-emerald-600"
            stepNumber={3}
            title="Real-World Example"
            subtitle="How this concept works in practice"
          >
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {lesson.example}
            </div>
          </SectionCard>

          {/* 4. Formulas (If present) */}
          {lesson.formulas && lesson.formulas.length > 0 && (
            <SectionCard
              icon={<Zap size={20} />}
              iconBg="bg-rose-50 text-rose-600"
              stepNumber={4}
              title="Key Formulas"
              subtitle="Math and logical representations"
            >
              <div className="space-y-2.5">
                {lesson.formulas.map((formula, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center shrink-0 border border-indigo-100">
                      {i + 1}
                    </span>
                    <code className="text-xs sm:text-sm font-bold text-slate-900 font-mono">{formula}</code>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* 5. Recommended YouTube Video Lessons */}
          <SectionCard
            icon={<Video size={20} />}
            iconBg="bg-rose-50 text-rose-600"
            stepNumber={lesson.formulas && lesson.formulas.length > 0 ? 5 : 4}
            title="Related YouTube Video Lessons"
            subtitle={`Top-rated video tutorials and visual explanations for ${conceptTitle}`}
          >
            <div className="grid gap-3 sm:grid-cols-3 pt-1">
              {[
                {
                  title: `${conceptTitle} — Comprehensive Explanation`,
                  channel: "Khan Academy & STEM",
                  query: `${conceptTitle} ${topic} Khan Academy explanation`,
                },
                {
                  title: `Visualizing ${conceptTitle} Intuitive Guide`,
                  channel: "3Blue1Brown & Visuals",
                  query: `${conceptTitle} ${topic} visual explanation`,
                },
                {
                  title: `${conceptTitle} — 10 Minute Summary`,
                  channel: "CrashCourse & Rapid Prep",
                  query: `${conceptTitle} summary tutorial`,
                },
              ].map((video, idx) => {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.query)}`;
                return (
                  <a
                    key={idx}
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-200 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded-md border border-rose-200/60 inline-flex items-center gap-1">
                          <Play size={10} className="fill-rose-600" /> YouTube
                        </span>
                        <ExternalLink size={14} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-700 line-clamp-2 transition-colors">
                        {video.title}
                      </h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate font-medium">{video.channel}</span>
                      <span className="font-bold text-rose-600 group-hover:underline shrink-0">Watch ↗</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </SectionCard>

          {/* 6. Prominent Quiz CTA (Uniform Home Page Button Style) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                  Checkpoint
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <HelpCircle size={18} className="text-indigo-600" />
                Ready to test your understanding?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Take a quick practice quiz on <strong>{conceptTitle}</strong> to earn XP and solidify your learning!
              </p>
            </div>
            <button
              onClick={goToQuiz}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              <Play size={16} />
              <span>Take Quiz Now</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* ══ ADVANCED & COLLAPSIBLE SECTIONS ("SHOW MORE" ACCORDIONS) ══════ */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                Advanced Content & Extra Insights
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Expand to explore in-depth details, common pitfalls, and analogies.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Accordion: Deep Dive */}
            <AccordionItem
              icon={<Brain size={20} />}
              iconBg="bg-purple-50 text-purple-600"
              title="In-Depth Deep Dive"
              subtitle="Full comprehensive explanation and theoretical background"
              isOpen={openAccordions.deepDive}
              onToggle={() => toggleAccordion("deepDive")}
            >
              <div className="space-y-3">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
                  {lesson.detailedExplanation}
                </p>
              </div>
            </AccordionItem>

            {/* Accordion: Common Mistakes */}
            {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
              <AccordionItem
                icon={<AlertTriangle size={20} />}
                iconBg="bg-amber-50 text-amber-600"
                title="Common Mistakes to Avoid"
                subtitle="Frequent misconceptions and how to avoid them"
                isOpen={openAccordions.commonMistakes}
                onToggle={() => toggleAccordion("commonMistakes")}
              >
                <div className="space-y-2 pt-1">
                  {lesson.commonMistakes.map((mistake, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-amber-50/60 border border-amber-100 rounded-xl px-4 py-3"
                    >
                      <span className="text-amber-600 shrink-0 mt-0.5 text-sm">⚠️</span>
                      <span className="text-xs sm:text-sm text-slate-800 leading-relaxed">{mistake}</span>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            )}

            {/* Accordion: Visual Analogy */}
            {lesson.analogy && (
              <AccordionItem
                icon={<Eye size={20} />}
                iconBg="bg-purple-50 text-purple-600"
                title="Visual Analogy & Reflection"
                subtitle="Intuitive mental model for everyday understanding"
                isOpen={openAccordions.analogy}
                onToggle={() => toggleAccordion("analogy")}
              >
                <div className="space-y-3 pt-1">
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-slate-700 text-sm italic leading-relaxed">
                    "{lesson.analogy}"
                  </div>
                  <Callout type="think-about">
                    {thinkAboutSnippet}. How does this connect to what you already know?
                  </Callout>
                </div>
              </AccordionItem>
            )}

            {/* Accordion: Fun Facts */}
            <AccordionItem
              icon={<Sparkles size={20} />}
              iconBg="bg-emerald-50 text-emerald-600"
              title="Fun Facts & Extra Trivia"
              subtitle="Fascinating context and real-world applications"
              isOpen={openAccordions.funFacts}
              onToggle={() => toggleAccordion("funFacts")}
            >
              <div className="space-y-3 pt-1">
                <Callout type="did-you-know">
                  {didYouKnowSnippet}.
                </Callout>
                <Callout type="fun-fact">
                  The principles behind {conceptTitle} are widely used across modern technology, research, and engineering!
                </Callout>
              </div>
            </AccordionItem>

          </div>
        </div>

        {/* ── Bottom Navigation Bar ───────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 pb-8 border-t border-slate-200/80">
          <button
            onClick={previousConcept}
            disabled={current === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
          >
            <ChevronLeft size={16} />
            <span>Previous Concept</span>
          </button>

          <button
            onClick={goToQuiz}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-500/15 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Take Quiz</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </main>
    </div>
  );
}