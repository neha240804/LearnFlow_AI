interface Props {
  explanation: string;
}

export default function ExplanationCard({
  explanation,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">
        Simple Explanation
      </h2>

      <p className="leading-8 text-gray-700">
        {explanation}
      </p>
    </div>
  );
}