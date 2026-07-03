// InviteCodeDisplay — OTP-style 6-box code display (read-only).
interface InviteCodeDisplayProps {
  code: string;
}

export function InviteCodeDisplay({ code }: InviteCodeDisplayProps) {
  const chars = code.toUpperCase().padEnd(6, " ").split("");

  return (
    <div className="flex gap-2 justify-center">
      {chars.map((char, i) => (
        <div
          key={i}
          className="flex h-[56px] w-[48px] items-center justify-center rounded-[12px] border"
          style={{
            backgroundColor: "var(--color-card-hover)",
            borderColor: "var(--color-primary)",
          }}
        >
          <span
            className="text-[28px] font-bold"
            style={{ color: "var(--color-primary)", fontFamily: "monospace" }}
          >
            {char}
          </span>
        </div>
      ))}
    </div>
  );
}
