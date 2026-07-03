// InsightCarousel — horizontally swipeable 3-card carousel with Framer Motion drag.
import { useState } from "react";
import { motion } from "framer-motion";
import type { InsightCard as InsightCardType } from "../../types";
import { InsightCard } from "./InsightCard";

interface InsightCarouselProps {
  cards: InsightCardType[];
}

export function InsightCarousel({ cards }: InsightCarouselProps) {
  const [index, setIndex] = useState(0);

  if (!cards.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card bg-card-hover text-muted">
        Your insights will appear here ✨
      </div>
    );
  }

  const handleDragEnd = (_e: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60 && index < cards.length - 1) setIndex(index + 1);
    else if (info.offset.x > 60 && index > 0) setIndex(index - 1);
  };

  return (
    <div className="space-y-3">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="drag-container overflow-hidden rounded-card"
      >
        <motion.div
          animate={{ x: `-${index * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex"
        >
          {cards.map((c, i) => (
            <div key={i} className="w-full flex-shrink-0 px-1">
              <div className="h-64">
                <InsightCard card={c} />
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="flex justify-center gap-1.5">
        {cards.map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Card ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
