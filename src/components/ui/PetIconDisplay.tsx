import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { PetPickerModal } from "./PetPickerModal";

const PET_FOLDER: Record<string, string> = {
  none: "",
  cat: "cat",
  puppy: "puppy",
  animal: "animals",
};

function petNumber(pet: string): string {
  if (!pet || pet === "none") return "";
  const match = pet.match(/(\d+)$/);
  return match ? match[1] : "";
}

function petPrefix(pet: string): string {
  if (!pet || pet === "none") return "";
  return pet.replace(/\d/g, "");
}

function petSrc(pet: string): string {
  if (!pet || pet === "none") return "";
  const prefix = petPrefix(pet);
  const num = petNumber(pet);
  const folder = PET_FOLDER[prefix] ?? "animals";
  return `/pets/${folder}/${num}.png`;
}

function petEmoji(pet: string): string {
  if (!pet || pet === "none") return "";
  const p = pet.toLowerCase();
  if (p.startsWith("cat")) return "🐱";
  if (p.startsWith("puppy")) return "🐶";
  if (p.startsWith("animal")) return "🐾";
  return "";
}

interface PetIconDisplayProps {
  size?: number;
  onClick?: () => void;
}

export function PetIconDisplay({ size = 28, onClick }: PetIconDisplayProps) {
  const pet = useAuthStore((s) => s.pet);
  const src = petSrc(pet);
  const emoji = petEmoji(pet);

  return (
    <span
      className={`inline-flex items-center justify-center ${onClick ? "cursor-pointer" : ""}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {pet === "none" ? (
        <span style={{ fontSize: size }}>+</span>
      ) : (
        <img
          src={src}
          alt="pet"
          className="object-contain"
          style={{ width: size, height: size }}
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            if (!emoji) return;
            const span = document.createElement("span");
            span.style.fontSize = `${size}px`;
            span.textContent = emoji;
            el.parentNode?.appendChild(span);
          }}
        />
      )}
    </span>
  );
}

export function PetSelector() {
  const [open, setOpen] = useState(false);
  const pet = useAuthStore((s) => s.pet);
  const petLabel = pet === "none" ? "None" : pet;

  return (
    <>
      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-text">Pet avatar</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 rounded-btn border border-border px-4 py-3 cursor-pointer hover:bg-card-hover transition-colors"
        >
          {pet === "none" ? (
            <span className="text-[20px] text-muted">+</span>
          ) : (
            <img
              src={petSrc(pet)}
              alt="pet"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                const emoji = petEmoji(pet);
                if (!emoji) return;
                const span = document.createElement("span");
                span.style.fontSize = "24px";
                span.textContent = emoji;
                el.parentNode?.appendChild(span);
              }}
            />
          )}
          <span className="text-[14px] text-text flex-1 text-left">{petLabel}</span>
          <span className="text-[12px] text-muted">Change</span>
        </button>
      </div>
      <PetPickerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
