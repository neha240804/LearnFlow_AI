import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getLesson } from "../services/lessonApi";

interface LessonResponse {
  simpleExplanation: string;
  detailedExplanation: string;
  analogy: string;
  example: string;
  formulas: string[];
  commonMistakes: string[];
  summary: string;
}

export default function Lesson() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};
  const topic = state.topic || "Physics";

  const initialCurrent = state.current !== undefined ? state.current : 0;
  const initialWeak = state.weak && state.weak.length > 0 ? state.weak : (state.concept ? [state.concept] : []);

  const [weak, setWeak] = useState<string[]>(initialWeak);
  const [current, setCurrent] = useState<number>(initialCurrent);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (weak.length === 0) {
      loadProgress();
    }
  }, []);

  async function loadProgress() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const progress = Array.isArray(data) ? data.find((p: any) => p.topic === topic) : null;
        if (progress?.weakConcepts && progress.weakConcepts.length > 0) {
          setWeak(progress.weakConcepts);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (weak.length > 0 && current < weak.length) {
      loadLesson();
    } else if (weak.length === 0) {
      // Fallback topic concept
      loadLessonForConcept(state.concept || topic);
    }
  }, [weak, current]);

  async function loadLessonForConcept(conceptTitle: string) {
    setLoading(true);
    try {
      const data = await getLesson(topic, conceptTitle, current);
      setLesson(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function loadLesson() {
    setLoading(true);

    try {
      const conceptTitle = weak[current] || state.concept || topic;
      const data = await getLesson(
        topic,
        conceptTitle,
        current
      );

      setLesson(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  function previousConcept() {
    if (current > 0) {
      setCurrent(current - 1);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-semibold">
        Generating Personalized Lesson...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Failed to load lesson.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10">

        {/* Progress */}

        <div className="mb-8">

          <div className="flex justify-between mb-2">

            <span className="font-semibold text-lg">
              Concept {current + 1} of {weak.length}
            </span>

            <span className="font-semibold">
              {Math.round(((current + 1) / weak.length) * 100)}%
            </span>

          </div>

          <div className="w-full bg-gray-300 rounded-full h-3">

            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${((current + 1) / weak.length) * 100}%`,
              }}
            />

          </div>

        </div>

        {/* Title */}

        <h1 className="text-4xl font-bold mb-8">
          {weak[current]}
        </h1>

        {/* Simple Explanation */}

        <div className="bg-blue-50 rounded-xl p-6 mb-6">

          <h2 className="text-2xl font-bold mb-4">
            📘 Simple Explanation
          </h2>

          <p className="text-lg leading-8">
            {lesson.simpleExplanation}
          </p>

        </div>

        {/* Detailed Explanation */}

        <div className="bg-white border rounded-xl p-6 mb-6">

          <h2 className="text-2xl font-bold mb-4">
            📖 Detailed Explanation
          </h2>

          <p className="text-lg leading-8">
            {lesson.detailedExplanation}
          </p>

        </div>

        {/* Analogy */}

        <div className="bg-yellow-50 rounded-xl p-6 mb-6">

          <h2 className="text-2xl font-bold mb-4">
            💡 Real-Life Analogy
          </h2>

          <p className="text-lg leading-8">
            {lesson.analogy}
          </p>

        </div>

        {/* Example */}

        <div className="bg-green-50 rounded-xl p-6 mb-6">

          <h2 className="text-2xl font-bold mb-4">
            ✅ Example
          </h2>

          <p className="text-lg leading-8">
            {lesson.example}
          </p>

        </div>

        {/* Formula */}

        {lesson.formulas.length > 0 && (

          <div className="bg-indigo-50 rounded-xl p-6 mb-6">

            <h2 className="text-2xl font-bold mb-4">
              📐 Important Formula(s)
            </h2>

            <ul className="list-disc pl-6 space-y-2">

              {lesson.formulas.map((formula, index) => (

                <li key={index}>
                  {formula}
                </li>

              ))}

            </ul>

          </div>

        )}

        {/* Common Mistakes */}

        {lesson.commonMistakes.length > 0 && (

          <div className="bg-red-50 rounded-xl p-6 mb-6">

            <h2 className="text-2xl font-bold mb-4">
              ❌ Common Mistakes
            </h2>

            <ul className="list-disc pl-6 space-y-2">

              {lesson.commonMistakes.map((mistake, index) => (

                <li key={index}>
                  {mistake}
                </li>

              ))}

            </ul>

          </div>

        )}

        {/* Summary */}

        <div className="bg-purple-50 rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-4">
            📝 Summary
          </h2>

          <p className="text-lg leading-8">
            {lesson.summary}
          </p>

        </div>

       {/* Navigation */}

      <div className="flex justify-between mt-10">

        <button
          onClick={previousConcept}
          disabled={current === 0}
          className="px-6 py-3 bg-gray-400 text-white rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={() =>
            navigate("/quiz", {
              state: {
                topic,
                weak,
                current,
              },
            })
          }
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Take Quiz
        </button>

      </div>
    </div>

  </div>
);
}