import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import PrimaryButton from "../components/PrimaryButton";

export default function Diagnostic() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  if (!data || !data.questions) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-600 text-sm font-semibold mb-4">No Diagnostic Quiz Available</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs hover:bg-indigo-700 transition"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  const questions = data.questions;

  const [answers, setAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );

  async function submitQuiz() {
    let score = 0;

    const conceptScores: Record<
      string,
      {
        correct: number;
        total: number;
      }
    > = {};

    questions.forEach((q: any, index: number) => {
      if (!conceptScores[q.concept]) {
        conceptScores[q.concept] = {
          correct: 0,
          total: 0,
        };
      }
      conceptScores[q.concept].total++;

      if (answers[index] === q.correctAnswer) {
        score++;
        conceptScores[q.concept].correct++;
      }
    });

    const mastery = Math.round(
      (score / questions.length) * 100
    );

    const strong: string[] = [];
    const average: string[] = [];
    const weak: string[] = [];

    Object.entries(conceptScores).forEach(([concept, value]) => {
      const percent = value.correct / value.total;
      if (percent >= 0.8) {
        strong.push(concept);
      } else if (percent >= 0.5) {
        average.push(concept);
      } else {
        weak.push(concept);
      }
    });
    const token = localStorage.getItem("token");

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: data.subject || "General STEM",
          topic: data.topic,
          confidence: mastery,
          mastery,
          weakConcepts: weak,
          strongConcepts: strong,
          attempts: 1,
          completed: false,
          timeSpent: 0,
        }),
      });
    } catch (err) {
      console.error("Failed to save diagnostic progress:", err);
    }

    const startConcept = weak.length > 0 ? weak[0] : (data.roadmap?.[0]?.title || "Core Concepts");

    navigate("/learning-profile", {
      state: {
        topic: data.topic,
        mastery,
        strong,
        average,
        weak,
        roadmap: data.roadmap || [],
        startConcept,
        estimatedTime: data.estimatedTime || "15 mins",
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-6 sm:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            🎯 Diagnostic Assessment
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            Answer honestly so LearnFlow AI can personalize your roadmap and adapt lesson content to your needs.
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((question: any, qIndex: number) => (
            <div
              key={qIndex}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6"
            >
              <div className="mb-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {question.concept}
                </span>
              </div>

              <h2 className="font-bold text-base text-slate-900">
                {qIndex + 1}. {question.questionText}
              </h2>

              <div className="mt-5 space-y-3">
                {question.options.map(
                  (option: string, optionIndex: number) => (
                    <label
                      key={optionIndex}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer text-sm font-semibold transition ${
                        answers[qIndex] === optionIndex
                          ? "border-indigo-500 bg-indigo-50/80 text-indigo-900 shadow-2xs"
                          : "border-slate-200/80 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={answers[qIndex] === optionIndex}
                        onChange={() => {
                          const updated = [...answers];
                          updated[qIndex] = optionIndex;
                          setAnswers(updated);
                        }}
                        className="accent-indigo-600 w-4 h-4"
                      />
                      <span>{option}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto pt-4">
          <PrimaryButton
            text="Submit Assessment"
            onClick={submitQuiz}
          />
        </div>
      </main>
    </div>
  );
}