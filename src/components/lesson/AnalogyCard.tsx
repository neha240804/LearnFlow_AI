interface Props {
  analogy: string;
}

export default function AnalogyCard({
  analogy,
}: Props) {
  return (
    <div className="bg-yellow-50 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">
        Real Life Analogy
      </h2>

      <p className="leading-8 text-gray-700">
        {analogy}
      </p>
    </div>
  );
}