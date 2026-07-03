// PregnancyWidget — current week, baby size, next milestone, kick counter shortcut.
import { useState } from "react";
import { motion } from "framer-motion";

const BABY_SIZES: Record<number, { fruit: string; emoji: string; milestone: string }> = {
  4:  { fruit: "Poppy seed", emoji: "🌱", milestone: "Implantation complete" },
  8:  { fruit: "Raspberry", emoji: "🍇", milestone: "Heartbeat starts" },
  12: { fruit: "Plum", emoji: "🍑", milestone: "Tiny fingers forming" },
  16: { fruit: "Avocado", emoji: "🥑", milestone: "Can feel movement" },
  20: { fruit: "Banana", emoji: "🍌", milestone: "Halfway there!" },
  24: { fruit: "Ear of corn", emoji: "🌽", milestone: "Responds to sound" },
  28: { fruit: "Eggplant", emoji: "🍆", milestone: "Eyelids open" },
  32: { fruit: "Squash", emoji: "🎃", milestone: "Practicing breathing" },
  36: { fruit: "Honeydew", emoji: "🍈", milestone: "Readying for birth" },
  40: { fruit: "Watermelon", emoji: "🍉", milestone: "Full term!" },
};

function getBabySize(week: number): { fruit: string; emoji: string; milestone: string } {
  const keys = Object.keys(BABY_SIZES).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (week >= k) closest = k;
  }
  return BABY_SIZES[closest] ?? { fruit: "Tiny miracle", emoji: "✨", milestone: "Growing strong" };
}

export function PregnancyWidget({ week, dueDate, onLogKick }: { week: number; dueDate: string; onLogKick: () => void }) {
  const [showKickCounter, setShowKickCounter] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const size = getBabySize(week);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-card bg-card shadow-card p-5 space-y-4 border border-primary/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">🤰</span>
          <span className="text-[13px] font-semibold text-text">Pregnancy mode</span>
        </div>
        <span className="rounded-full bg-primary/15 px-3 py-0.5 text-[11px] font-semibold text-primary">Week {week}</span>
      </div>

      {/* Baby size comparison */}
      <div className="flex items-center gap-4">
        <motion.div
          key={week}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light/20 text-[32px]"
        >
          {size.emoji}
        </motion.div>
        <div>
          <p className="text-[16px] font-bold text-text">Baby is the size of a</p>
          <p className="text-[20px] font-bold text-primary">{size.fruit}</p>
          {size.milestone && <p className="text-[12px] text-muted mt-0.5">{size.milestone}</p>}
        </div>
      </div>

      {/* Next milestone */}
      <div className="rounded-btn bg-card-hover p-3">
        <p className="text-[11px] font-semibold text-muted uppercase">Next milestone</p>
        <p className="text-[13px] font-semibold text-text mt-0.5">{size.milestone}</p>
      </div>

      {/* Due date */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted">Due date</span>
        <span className="text-[13px] font-semibold text-text">{dueDate}</span>
      </div>

      {/* Kick counter shortcut */}
      {!showKickCounter ? (
        <button
          type="button"
          onClick={() => setShowKickCounter(true)}
          className="w-full rounded-btn border-2 border-dashed border-accent/40 px-4 py-3 text-[13px] font-semibold text-accent cursor-pointer hover:bg-accent/5 transition-colors"
        >
          👶 Log kick count
        </button>
      ) : (
        <div className="rounded-btn bg-accent/10 p-4 space-y-3 border border-accent/20">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text">Kick counter</p>
            <button type="button" onClick={() => { setShowKickCounter(false); setKickCount(0); }} className="text-[11px] text-muted cursor-pointer">Close</button>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setKickCount((c) => c + 1)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white text-[24px] cursor-pointer active:scale-95 transition-transform"
            >
              +
            </button>
            <div className="text-center">
              <p className="text-[32px] font-bold text-text">{kickCount}</p>
              <p className="text-[11px] text-muted">kicks this session</p>
            </div>
            <button
              type="button"
              onClick={() => { onLogKick(); setKickCount(0); }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card-hover text-muted cursor-pointer hover:bg-primary/20 transition-colors"
            >
              ✓
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
