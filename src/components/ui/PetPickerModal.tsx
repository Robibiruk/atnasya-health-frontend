// PetPickerModal — popup showing all available pet icons as PNGs from /pets/.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import type { PetIcon } from "../../types";

const PET_GROUPS: { group: string; prefix: string; ids: { value: PetIcon; label: string }[] }[] = [
  {
    group: "Cats",
    prefix: "cat",
    ids: [
      { value: "cat1", label: "Cat 1" },
      { value: "cat2", label: "Cat 2" },
      { value: "cat3", label: "Cat 3" },
      { value: "cat4", label: "Cat 4" },
      { value: "cat5", label: "Cat 5" },
      { value: "cat6", label: "Cat 6" },
      { value: "cat7", label: "Cat 7" },
      { value: "cat8", label: "Cat 8" },
    ],
  },
  {
    group: "Puppies",
    prefix: "puppy",
    ids: [
      { value: "puppy1", label: "Puppy 1" },
      { value: "puppy2", label: "Puppy 2" },
      { value: "puppy3", label: "Puppy 3" },
      { value: "puppy4", label: "Puppy 4" },
      { value: "puppy5", label: "Puppy 5" },
      { value: "puppy6", label: "Puppy 6" },
      { value: "puppy7", label: "Puppy 7" },
      { value: "puppy8", label: "Puppy 8" },
      { value: "puppy9", label: "Puppy 9" },
    ],
  },
  {
    group: "Animals",
    prefix: "animal",
    ids: [
      { value: "animal1", label: "Animal 1" },
      { value: "animal2", label: "Animal 2" },
      { value: "animal3", label: "Animal 3" },
      { value: "animal4", label: "Animal 4" },
      { value: "animal5", label: "Animal 5" },
      { value: "animal6", label: "Animal 6" },
      { value: "animal7", label: "Animal 7" },
      { value: "animal8", label: "Animal 8" },
      { value: "animal9", label: "Animal 9" },
    ],
  },
];

function srcFor(id: string) {
  const match = id.match(/(\D+)(\d+)/);
  if (!match) return "";
  const [, prefix, num] = match;
  const folder = prefix === "cat" ? "cat" : prefix === "puppy" ? "puppy" : "animals";
  return `/pets/${folder}/${num}.png`;
}

export function PetPickerModal({
  open,
  onClose,
  current,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  current?: PetIcon;
  onChange?: (pet: PetIcon) => void;
}) {
  const internalPet = useAuthStore((s) => s.pet);
  const internalSetPet = useAuthStore((s) => s.setPet);
  const pet = current ?? internalPet;
  const pick = (value: PetIcon) => {
    if (onChange) onChange(value);
    else internalSetPet(value);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-sm rounded-t-2xl bg-card p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.35)] border-t border-accent/20 pb-40"
            style={{ maxHeight: "min(85vh, calc(100dvh - 64px))", overflowY: "auto" }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-text">Choose your pet</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-[12px] text-primary cursor-pointer font-semibold"
              >
                Close
              </button>
            </div>

            {/* Current preview */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="h-16 w-16 overflow-hidden rounded-full">
                {pet !== "none" ? (
                  <img
                    src={srcFor(pet)}
                    alt={pet}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">+</div>
                )}
              </div>
              <p className="text-[12px] text-muted">
                {pet === "none" ? "No pet selected" : `Selected: ${pet}`}
              </p>
            </div>

            {/* None option */}
            <button
              type="button"
              onClick={() => pick("none")}
              className={`mb-3 w-full rounded-btn p-3 text-center border-2 cursor-pointer transition-all ${
                pet === "none" ? "border-primary bg-primary/10" : "border-border hover:bg-card-hover"
              }`}
            >
              <span className="text-[13px] font-medium text-text">No pet</span>
            </button>

            {PET_GROUPS.map((group) => (
              <div key={group.group} className="mb-4">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
                  {group.group}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {group.ids.map(({ value }) => {
                    const active = pet === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => pick(value)}
                        className={`rounded-btn border-2 p-2 text-center cursor-pointer transition-all ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-card-hover hover:scale-105"
                        }`}
                      >
                        <img
                          src={srcFor(value)}
                          alt={value}
                          className="mx-auto h-10 w-10 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
