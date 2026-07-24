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
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <h2 className="text-2xl font-semibold">
            No Diagnostic Quiz Available
          </h2>
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

    await fetch("http://localhost:5000/api/progress",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({

            subject:data.subject,

            topic:data.topic,

            confidence:mastery,

            mastery,

            weakConcepts:weak,

            strongConcepts:strong,

            attempts:1,

            completed:false,

            timeSpent:0

        })
    });

    navigate("/learning-profile",{
        state:{
            topic:data.topic
        }
    });

  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <div className="max-w-5xl mx-auto py-8 px-6">

        <h1 className="text-3xl font-bold">
          Diagnostic Assessment
        </h1>

        <p className="text-gray-500 mt-2">
          Answer honestly so LearnFlow AI can personalize your learning.
        </p>

        <div className="space-y-6 mt-8">

          {questions.map((question: any, qIndex: number) => (

            <div
              key={qIndex}
              className="bg-white rounded-xl shadow p-6"
            >

              <div className="mb-2">

                <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">

                  {question.concept}

                </span>

              </div>

              <h2 className="font-semibold text-lg">

                {qIndex + 1}. {question.questionText}

              </h2>

              <div className="mt-5 space-y-3">

                {question.options.map(
                  (option: string, optionIndex: number) => (

                    <label
                      key={optionIndex}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-indigo-50 transition

                      ${
                        answers[qIndex] === optionIndex
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200"
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
                      />

                      <span>{option}</span>

                    </label>
                  )
                )}

              </div>

            </div>

          ))}

        </div>

        <div className="mt-10 max-w-sm">

          <PrimaryButton
            text="Submit Assessment"
            onClick={submitQuiz}
          />

        </div>

      </div>

    </div>
  );
}