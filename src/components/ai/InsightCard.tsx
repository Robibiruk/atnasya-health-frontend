// InsightCard — single story card (emoji + title + body).
import type { InsightCardType } from "../../types";

interface InsightCardProps {
  card: { cardType: InsightCardType; emoji: string; title: string; body: string };
  onLike?: () => void;
  liked?: boolean;
}

const gradientColors: Record<InsightCardType, [string, string]> = {
  cycle: ["var(--color-ovulation)", "var(--color-accent)"],
  vitals: ["var(--color-accent)", "var(--color-accent-light)"],
  wellness: ["var(--color-fertile)", "var(--color-follicular)"],
};

export function InsightCard({ card, onLike, liked }: InsightCardProps) {
  const [from, to] = gradientColors[card.cardType];
  return (
    <div
      className="flex h-full w-full flex-col justify-between rounded-card p-6 text-white"
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div>
        <span className="text-5xl">{card.emoji}</span>
        <h2 className="mt-3 text-xl font-bold">{card.title}</h2>
        <p className="mt-2 text-sm leading-relaxed opacity-90">{card.body}</p>
      </div>
      {onLike && (
        <button
          type="button"
          onClick={onLike}
          className={`tap mt-4 self-start rounded-full px-4 py-1.5 text-xs font-semibold ${
            liked ? "bg-white text-primary" : "bg-white/20 text-white"
          }`}
        >
          {liked ? "♥ Liked" : "♡ Like"}
        </button>
      )}
    </div>
  );
}
