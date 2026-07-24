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
  const { state } = useLocation();

  const { topic } = state;

  const [weak,setWeak]=useState<string[]>([]);

  const [current,setCurrent]=useState(0);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [current, setCurrent] = useState(initialCurrent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress(){

  const token=localStorage.getItem("token");

  const response=await fetch(
  "http://localhost:5000/api/progress",
  {
  headers:{
  Authorization:`Bearer ${token}`
  }
  });

  const data=await response.json();

  const progress=data.find(
  (p:any)=>p.topic===topic
  );

  setWeak(progress.weakConcepts);

  }

  useEffect(()=>{

  if(weak.length>0){

  loadLesson();

  }

},[weak,current]);

  async function loadLesson() {
    setLoading(true);

    try {
      const data = await getLesson(
        topic,
        weak[current],
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