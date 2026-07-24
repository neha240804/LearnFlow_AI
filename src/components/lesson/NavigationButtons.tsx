interface Props {
  previous: () => void;
  next: () => void;
  current: number;
  total: number;
}

export default function NavigationButtons({
  previous,
  next,
  current,
  total,
}: Props) {
  return (
    <div className="flex justify-between mt-8">
      <button
        disabled={current === 0}
        onClick={previous}
        className="px-6 py-3 rounded-lg bg-gray-300 disabled:opacity-50"
      >
        Previous
      </button>

      <button
        onClick={next}
        className="px-6 py-3 rounded-lg bg-blue-600 text-white"
      >
        {current === total - 1 ? "Finish" : "Next"}
      </button>
    </div>
  );
}