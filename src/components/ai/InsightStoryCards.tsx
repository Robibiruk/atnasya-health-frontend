// InsightStoryCards — horizontal scroll, insight preview cards with staggered fadeUp.
import { useEffect, useState } from "react";
import { useInsights } from "../../hooks/useInsights";

interface StoryCard {
  title: string;
  subtitle: string;
  bgClass: string;
  stripeColor: string;
}

export function InsightStoryCards() {
  const { insight } = useInsights();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Map backend insight cards to story cards, or show defaults if none yet
  const CARDS: StoryCard[] = insight?.cards && insight.cards.length > 0
    ? insight.cards.map((card) => {
        const bgMap: Record<string, { bg: string; stripe: string }> = {
          cycle: { bg: "bg-ovulation-tint", stripe: "var(--color-ovulation)" },
          vitals: { bg: "bg-period-tint", stripe: "var(--color-period)" },
          wellness: { bg: "bg-fertile-tint", stripe: "var(--color-fertile)" },
        };
        const style = bgMap[card.cardType] ?? { bg: "bg-follicular-tint", stripe: "var(--color-follicular)" };
        return {
          title: card.title,
          subtitle: card.body.slice(0, 40) + (card.body.length > 40 ? "…" : ""),
          bgClass: style.bg,
          stripeColor: style.stripe,
        };
      })
    : [
        { title: "Your mood today", subtitle: "Track how you feel", bgClass: "bg-period-tint", stripeColor: "var(--color-period)" },
        { title: "Hydration tip", subtitle: "Stay energised", bgClass: "bg-fertile-tint", stripeColor: "var(--color-fertile)" },
        { title: "Cycle insight", subtitle: "What's happening", bgClass: "bg-ovulation-tint", stripeColor: "var(--color-ovulation)" },
        { title: "Sleep pattern", subtitle: "Rest & recovery", bgClass: "bg-pms-tint", stripeColor: "var(--color-pms)" },
        { title: "Energy levels", subtitle: "Peak & low times", bgClass: "bg-follicular-tint", stripeColor: "var(--color-follicular)" },
      ];

  return (
    <div className="flex gap-3 overflow-x-auto px-1 no-scrollbar py-1">
      {CARDS.map((card, i) => (
        <div
          key={card.title}
          className={`flex-shrink-0 w-[110px] h-[150px] rounded-[18px] ${card.bgClass} cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-card overflow-hidden ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: visible ? `${i * 80}ms` : "0ms",
            transitionDuration: "300ms",
          }}
        >
          {/* Top accent stripe */}
          <div className="h-1 w-full" style={{ backgroundColor: card.stripeColor }} />
          <div className="p-3 pt-4">
            {/* Small icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={card.stripeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="mt-2 text-[13px] font-semibold text-text leading-tight">
              {card.title}
            </p>
            <p className="mt-1 text-[11px] text-muted leading-snug">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
