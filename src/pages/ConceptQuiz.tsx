import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getConceptQuiz } from "../services/quizApi";
import type { ConceptQuiz as ConceptQuizType } from "../types/quiz";

import QuizProgress from "../components/quiz/QuizProgress";
import QuizCard from "../components/quiz/QuizCard";
import ResultCard from "../components/quiz/ResultCard";

export default function ConceptQuiz() {

    const navigate = useNavigate();

    const { state } = useLocation();

    const {

        topic,

        weak,

        current

    } = state;

    const [quiz, setQuiz] = useState<ConceptQuizType | null>(null);
    const [loading, setLoading] = useState(true);

    const [questionIndex, setQuestionIndex] = useState(0);

    const [selected, setSelected] = useState<number | null>(null);

    const [showAnswer, setShowAnswer] = useState(false);

    const [score, setScore] = useState(0);

    useEffect(() => {

        loadQuiz();

    }, []);

    async function loadQuiz() {

        setLoading(true);

        try {

            const data = await getConceptQuiz(

                topic,

                weak[current],

                current

            );

            setQuiz(data);

        }

        catch (err) {

            console.error(err);

        }

        setLoading(false);

    }

    if (loading) {

        return (

            <div className="min-h-screen flex justify-center items-center text-2xl">

                Generating Quiz...

            </div>

        );

    }

    if (!quiz) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                Failed to load quiz.

            </div>

        );

    }

    if (questionIndex >= quiz.questions.length) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                <ResultCard
                    score={score}
                    total={quiz.questions.length}

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

        );

    }

    const question = quiz.questions[questionIndex];

    function submitAnswer() {

        if (selected === null) return;

        if (selected === question.correctAnswer) {

            setScore(score + 1);

        }

        setShowAnswer(true);

    }

    function nextQuestion() {

        setSelected(null);

        setShowAnswer(false);

        setQuestionIndex(questionIndex + 1);

    }
    async function handleNext() {
        const token = localStorage.getItem("token");
        const masteryScore = Math.round((score / (quiz?.questions.length || 1)) * 100);

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

            // Also update topic progress in PostgreSQL
            await fetch("/api/progress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    topic,
                    confidence: masteryScore,
                    mastery: masteryScore,
                    completed: current + 1 >= weak.length,
                    attempts: 1,
                    timeSpent: 5,
                }),
            }).catch(console.error);

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

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

                <QuizProgress

                    current={questionIndex}

                    total={quiz.questions.length}

                />

                <QuizCard

                    question={question}

                    selected={selected}

                    setSelected={setSelected}

                />

                {

                    showAnswer && (

                        <div className="mt-8">

                            <div

                                className={`

                                p-4

                                rounded-lg

                                ${

                                    selected===question.correctAnswer

                                    ?

                                    "bg-green-100"

                                    :

                                    "bg-red-100"

                                }

                                `}

                            >

                                <h2 className="font-bold text-lg mb-2">

                                    {

                                        selected===question.correctAnswer

                                        ?

                                        "Correct ✅"

                                        :

                                        "Incorrect ❌"

                                    }

                                </h2>

                                <p>

                                    {question.explanation}

                                </p>

                            </div>

                        </div>

                    )

                }

                <div className="mt-10 flex justify-end">

                    {

                        !showAnswer ?

                        (

                            <button

                                disabled={selected===null}

                                onClick={submitAnswer}

                                className="bg-blue-600 text-white px-8 py-3 rounded-lg disabled:opacity-50"

                            >

                                Submit

                            </button>

                        )

                        :

                        (

                            <button

                                onClick={nextQuestion}

                                className="bg-green-600 text-white px-8 py-3 rounded-lg"

                            >

                                {

                                    questionIndex===quiz.questions.length-1

                                    ?

                                    "Finish Quiz"

                                    :

                                    "Next Question"

                                }

                            </button>

                        )

                    }

                </div>

            </div>

        </div>

    );

}