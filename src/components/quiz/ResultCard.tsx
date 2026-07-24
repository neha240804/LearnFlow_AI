interface Props {
  score: number;
  total: number;
  onNext: () => void;
  onRetry: () => void;
}

export default function ResultCard({
  score,
  total,
  onNext,
  onRetry,
}: Props) {

  const percentage = Math.round((score / total) * 100);

  const passed = percentage >= 75;

  return (
    <div className="text-center">

      <h1 className="text-4xl font-bold mb-6">
        Quiz Complete 🎉
      </h1>

      <div className="text-6xl font-bold text-blue-600">
        {score}/{total}
      </div>

      <p className="text-2xl mt-4">
        Confidence: <strong>{percentage}%</strong>
      </p>

      {passed ? (

        <div className="mt-8">

          <p className="text-green-700 text-xl font-semibold">
            🎉 Excellent! You have understood this concept well.
          </p>

          <button
            onClick={onNext}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
          >
            Continue to Next Lesson
          </button>

        </div>

      ) : (

        <div className="mt-8">

          <p className="text-red-600 text-xl font-semibold">
            📚 Your confidence is below 75%.
          </p>

          <p className="mt-3 text-gray-700 text-lg">
            We recommend revising this lesson once more before moving on.
            Reviewing the lesson will help strengthen your understanding.
          </p>

          <div className="flex justify-center gap-4 mt-8">

            <button
              onClick={onRetry}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg"
            >
              Revise Lesson
            </button>

            <button
              onClick={onNext}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg"
            >
              Continue Anyway
            </button>

          </div>

        </div>

      )}

    </div>
  );
}