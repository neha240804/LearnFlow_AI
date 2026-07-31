import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import { getConceptQuiz } from "../services/quizApi";
import type { ConceptQuiz as ConceptQuizType } from "../types/quiz";

import QuizProgress from "../components/quiz/QuizProgress";
import QuizCard from "../components/quiz/QuizCard";
import ResultCard from "../components/quiz/ResultCard";

export default function ConceptQuiz() {

    const navigate = useNavigate();
    const { state } = useLocation();
    const { topic, weak, current } = state || {};

    const [quiz, setQuiz] = useState<ConceptQuizType | null>(null);
    const [loading, setLoading] = useState(true);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    // Track per-answer history to determine which concepts need more work
    const [answerHistory, setAnswerHistory] = useState<{ correct: boolean }[]>([]);
    const [earnedXP, setEarnedXP] = useState<number | null>(null);

    useEffect(() => {
        loadQuiz();
    }, []);

    async function loadQuiz() {
        setLoading(true);
        try {
            const data = await getConceptQuiz(
                topic,
                weak?.[current],
                current
            );
            setQuiz(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-600">Generating Concept Quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <p className="text-slate-600 font-semibold mb-4 text-sm">Failed to load quiz for this concept.</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs hover:bg-indigo-700 transition"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (questionIndex >= quiz.questions.length) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center p-6">
                    <ResultCard
                        score={score}
                        total={quiz.questions.length}
                        earnedXP={earnedXP}
                        conceptName={weak?.[current] || topic}
                        onRetry={() =>
                            navigate("/lesson", {
                                state: {
                                    topic,
                                    weak,
                                    current,
                                },
                            })
                        }
                        onNext={handleNext}
                    />
                </div>
            </div>
        );
    }

    const question = quiz.questions[questionIndex];

    function submitAnswer() {

        if (selected === null) return;

        const isCorrect = selected === question.correctAnswer;
        if (isCorrect) {
            setScore(score + 1);
        }
        setAnswerHistory([...answerHistory, { correct: isCorrect }]);
        setShowAnswer(true);

    }

    function nextQuestion() {

        setSelected(null);

        setShowAnswer(false);

        setQuestionIndex(questionIndex + 1);

    }
    async function handleNext() {
        const token = localStorage.getItem("token");
        const totalQuestions = quiz?.questions.length || 1;
        const masteryScore = Math.round((score / totalQuestions) * 100);

        // Classify the current concept as weak or strong based on this quiz run
        const conceptName = weak?.[current] || topic;
        const isConceptStrong = masteryScore >= 70;
        const updatedWeakConcepts = isConceptStrong
            ? (weak || []).filter((c: string) => c !== conceptName)
            : [conceptName];
        const updatedStrongConcepts = isConceptStrong ? [conceptName] : [];

        try {
            await fetch("/api/quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    topic,
                    score,
                    confidence: masteryScore,
                    answers: [],
                }),
            });

            // Update progress with latest quiz score and updated weak/strong concepts
            const progressRes = await fetch("/api/progress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    topic,
                    confidence: masteryScore,
                    mastery: masteryScore,
                    weakConcepts: updatedWeakConcepts,
                    strongConcepts: updatedStrongConcepts,
                    completed: masteryScore >= 80,
                    attempts: 1,
                    timeSpent: 5,
                }),
            });

            if (progressRes.ok) {
                const progressData = await progressRes.json();
                if (progressData.earnedXP > 0) {
                    setEarnedXP(progressData.earnedXP);
                }
            }

        } catch (err) {
            console.error(err);
        }

        if (current + 1 < weak.length) {
            navigate("/lesson", {
                state: {
                    topic,
                    weak,
                    current: current + 1,
                },
            });
        } else {
            navigate("/dashboard");
        }
    }
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
            <Navbar />
            <main className="max-w-4xl mx-auto w-full px-6 py-8">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
                    <QuizProgress
                        current={questionIndex}
                        total={quiz.questions.length}
                    />

                    <div className="mt-6">
                        <QuizCard
                            question={question}
                            selected={selected}
                            setSelected={setSelected}
                        />
                    </div>

                    {showAnswer && (
                        <div className="mt-6">
                            <div
                                className={`p-5 rounded-2xl border ${
                                    selected === question.correctAnswer
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                        : "bg-rose-50 border-rose-200 text-rose-900"
                                }`}
                            >
                                <h3 className="font-extrabold text-base mb-1 flex items-center gap-2">
                                    {selected === question.correctAnswer
                                        ? "✅ Correct!"
                                        : "❌ Incorrect"}
                                </h3>
                                <p className="text-sm leading-relaxed mt-1 font-medium">
                                    {question.explanation}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        {!showAnswer ? (
                            <button
                                disabled={selected === null}
                                onClick={submitAnswer}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-xs transition"
                            >
                                Submit Answer
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-xs transition"
                            >
                                {questionIndex === quiz.questions.length - 1
                                    ? "Finish Concept Quiz"
                                    : "Next Question →"}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}