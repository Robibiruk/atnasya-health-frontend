// Card — rounded-2xl shadow card wrapper. Zero hardcoded colors.
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`
        rounded-card bg-card shadow-card p-4
        transition-colors duration-200
        ${hoverable ? "hover:bg-card-hover cursor-pointer" : ""}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}
