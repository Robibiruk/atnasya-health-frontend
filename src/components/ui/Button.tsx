// Button — variants: primary / ghost / danger. Zero hardcoded colors.
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-card hover:bg-primary-light",
  ghost:
    "bg-transparent text-primary border border-border hover:bg-card-hover",
  danger:
    "bg-danger text-white hover:opacity-90",
};

export function Button({
  variant = "primary",
  children,
  fullWidth,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }}
      className={`
        rounded-btn px-5 py-3 font-semibold text-base
        transition-colors duration-200 tap
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
