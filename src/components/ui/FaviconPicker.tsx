// FaviconPicker — choose app icon from public/favicon/*.png
import { useAuthStore } from "../../store/authStore";

const FAVICONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => ({
  value: String(n),
  src: `/favicon/${n}.png`,
  label: n === 1 ? "Default" : `Icon ${n}`,
  folder: n === 9 || n === 10,
  fallbackSrc:
    n === 9 ? "/favicon/9.png" : n === 10 ? "/favicon/10.png" : "",
}));

export function FaviconPicker() {
  const favicon = useAuthStore((s) => s.favicon as string | undefined);
  const setFavicon = useAuthStore((s) => s.setFavicon as (v: string) => void);

  const selectedValue = favicon ?? FAVICONS[0].value;

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold text-text">App icon</p>
      <div className="grid grid-cols-5 gap-2">
        {FAVICONS.map((f) => {
          const active = selectedValue === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFavicon(f.value)}
              className={`rounded-btn p-2 text-center cursor-pointer border-2 transition-all ${
                active ? "border-primary bg-primary/10" : "border-border hover:bg-card-hover"
              }`}
              title={f.folder ? f.label : f.label}
            >
              <img
                src={f.folder ? f.fallbackSrc : f.src}
                alt={f.label}
                className="mx-auto h-8 w-8 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {active && <p className="text-[10px] font-semibold text-primary mt-1">{f.label}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
