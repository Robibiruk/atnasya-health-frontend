// StepPartnerCode — Partner onboarding step 2: enter invite code
import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";

interface StepPartnerCodeProps {
  onBack: () => void;
  onConnected: (ownerFirstName: string) => void;
  onError: (msg: string) => void;
}

export function StepPartnerCode({ onBack, onConnected, onError }: StepPartnerCodeProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-submit when all 6 filled
  const allFilled = code.every((c) => c.length === 1);

  useEffect(() => {
    if (allFilled && !validating && !success) {
      handleSubmit();
    }
  }, [allFilled, validating, success]);

  const handleSubmit = async () => {
    const inviteCode = code.join("").toUpperCase();
    if (inviteCode.length !== 6) return;

    setValidating(true);
    setError(null);

    try {
      const res = await api.post("/partner/accept", { inviteCode });
      if (res.data.success) {
        setSuccess(true);
        const ownerName = (res.data as any).data?.ownerFirstName ?? "your partner";
        setTimeout(() => onConnected(ownerName), 1200);
      } else {
        setError((res.data as any).error ?? "Code not found");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Code not found — check with your partner";
      setError(msg);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setError(null);

    // Auto-advance
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (pasted) {
      const newCode = ["", "", "", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        newCode[i] = pasted[i];
      }
      setCode(newCode);
      setError(null);
      // Focus last filled or next empty
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card cursor-pointer transition-colors duration-150 hover:bg-card-hover"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div>
        <h1
          className="text-[24px] font-bold text-text"
          style={{ fontFamily: "DM Serif Display, serif" }}
        >
          Enter your partner&apos;s code
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Ask your partner to share their 6-character invite code from their Profile
        </p>
      </div>

      {/* OTP-style 6-box input */}
      <div className="flex gap-2.5 justify-center" style={{ animation: error ? "shake 400ms ease-in-out" : undefined }}>
        {code.map((char, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            maxLength={1}
            value={char}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={validating || success}
            className={`
              flex h-[60px] w-[52px] items-center justify-center rounded-[14px] border-[1.5px]
              text-center text-[24px] font-bold uppercase outline-none
              transition-all duration-150
              ${success
                ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                : error
                ? "border-[var(--color-danger)] bg-[var(--color-danger)]/5"
                : char
                ? "border-[var(--color-primary)] bg-card-hover"
                : "border-border bg-card-hover focus:border-[var(--color-primary)]"
              }
            `}
            style={{
              color: success ? "var(--color-success)" : error ? "var(--color-danger)" : "var(--color-primary)",
              boxShadow: char && !error && !success ? "0 0 0 3px rgba(123,79,158,0.15)" : "none",
            }}
          />
        ))}
      </div>

      {/* State indicators */}
      {validating && !success && (
        <div className="flex items-center justify-center gap-2 text-[13px] text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
          Checking code...
        </div>
      )}

      {success && (
        <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Connected!
        </div>
      )}

      {error && !success && (
        <p className="text-center text-[13px] text-danger">{error}</p>
      )}

      {/* Don't have a code link */}
      <details className="rounded-btn border border-border p-3">
        <summary className="text-[13px] font-medium text-primary cursor-pointer">
          Don&apos;t have a code yet?
        </summary>
        <p className="mt-2 text-[12px] text-muted leading-relaxed">
          Ask your partner to open their Profile in Atnasya and tap &quot;Connect your partner&quot; to generate a code.
        </p>
      </details>
    </div>
  );
}
