interface Props {
  current: number;
  total: number;
}

export default function ProgressHeader({
  current,
  total,
}: Props) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">
          Concept {current + 1} of {total}
        </span>

        <span>{Math.round(progress)}%</span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}