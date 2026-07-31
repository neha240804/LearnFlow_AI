import React from "react";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function PrimaryButton({
  text,
  onClick,
  loading = false,
  disabled = false,
  icon,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative w-full overflow-hidden rounded-xl
        bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600
        px-6 py-3.5 text-white font-bold text-sm tracking-wide
        shadow-lg shadow-indigo-500/25 border border-indigo-400/30
        transition-all duration-300 transform
        hover:shadow-indigo-500/40 hover:-translate-y-0.5 hover:scale-[1.01]
        active:translate-y-0 active:scale-[0.99]
        disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        flex items-center justify-center gap-2 cursor-pointer
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2.5">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
          <span>Processing AI Request...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {icon}
          <span>{text}</span>
        </div>
      )}
    </button>
  );
}