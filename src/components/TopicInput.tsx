import { FiBookOpen } from "react-icons/fi";

interface TopicInputProps {
  topic: string;
  setTopic: (value: string) => void;
}

export default function TopicInput({
  topic,
  setTopic,
}: TopicInputProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8">

      <div className="flex items-center gap-3">

        <FiBookOpen
          size={30}
          className="text-indigo-600"
        />

        <h2 className="text-2xl font-bold">
          Enter a Topic
        </h2>

      </div>

      <p className="mt-2 text-gray-500">
        Type the STEM topic you're having difficulty understanding.
      </p>

      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Example: Linear Algebra, Newton's Laws, Operating System..."
        className="mt-6 w-full rounded-xl border border-gray-300 px-5 py-4 text-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
      />

    </div>
  );
}