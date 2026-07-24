interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({
  text,
  onClick,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        w-full
        rounded-xl
        bg-indigo-600
        px-6
        py-3
        text-white
        font-semibold
        shadow-md
        transition-all
        duration-200
        hover:bg-indigo-700
        hover:shadow-lg
        active:scale-[0.98]
        disabled:bg-gray-400
        disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">

          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              className="opacity-100"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4A10 10 0 002 12h2z"
            />
          </svg>

          Processing...
        </div>
      ) : (
        text
      )}
    </button>
  );
}