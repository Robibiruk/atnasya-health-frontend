// BottomSheet — reusable Framer Motion drawer that slides up from the bottom.
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  height?: string; // tailwind height class, e.g. "h-[80vh]"
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  height = "h-[80vh]",
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[480px] md:max-w-[640px] ${height} overflow-hidden rounded-t-card bg-card shadow-card`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-lg font-bold text-text">
                {title ?? "Log today"}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="tap rounded-full p-1 text-muted hover:bg-card-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-full overflow-y-auto p-4 pb-24">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
