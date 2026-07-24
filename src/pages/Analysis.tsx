import { useLocation, useNavigate } from "react-router-dom";

export default function Analysis() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <h2>No analysis data found.</h2>;
  }

  return (
    <div className="min-h-screen p-8 bg-slate-100">

      <h1 className="text-3xl font-bold mb-6">
        Learning Roadmap
      </h1>

      <p>
        <strong>Topic:</strong> {state.topic}
      </p>

      <p>
        <strong>Difficulty:</strong> {state.difficulty}
      </p>

      <p>
        <strong>Estimated Time:</strong> {state.estimatedTime}
      </p>

      <div className="mt-8">
        {state.roadmap.map((item: any, index: number) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-4 mb-4"
          >
            <h2 className="font-bold">
              {index + 1}. {item.title}
            </h2>

            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          navigate("/diagnostic", {
            state,
          })
        }
        className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-lg"
      >
        Continue to Diagnostic Quiz
      </button>

    </div>
  );
}