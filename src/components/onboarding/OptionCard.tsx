// OptionCard — reusable tappable card for onboarding steps.
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface OptionCardProps {
  icon: ReactNode;
  label: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({
  icon,
  label,
  subtitle,
  selected,
  onClick,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`
        flex w-full items-center gap-4 rounded-card border-2 px-5 py-4 text-left cursor-pointer
        transition-all duration-200 min-h-[80px]
        ${
          selected
            ? "border-primary bg-primary/10 shadow-card"
            : "border-border bg-card hover:bg-card-hover"
        }
      `}
    >
      <div
        className={`
          flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[24px]
          ${selected ? "bg-primary/20" : "bg-card-hover"}
        `}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[15px] font-semibold ${
            selected ? "text-primary" : "text-text"
          }`}
        >
          {label}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
        )}
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
