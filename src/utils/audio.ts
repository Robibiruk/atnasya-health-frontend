// In-memory alarm sounds using Web Audio API.
// No external assets required.

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAlarm(sound: "chime" | "beep" | "soft" | "none" = "none"): void {
  if (!sound || sound === "none") return;
  const ctx = getContext();
  const now = ctx.currentTime;

  if (sound === "chime") {
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.35, now + i * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 1);
    });
    return;
  }

  if (sound === "beep") {
    [0, 0.18, 0.36].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });
    return;
  }

  if (sound === "soft") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 392;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);
    return;
  }
}

type SoundKind = "chime" | "beep" | "soft" | "none";

let alarmTimer: ReturnType<typeof setInterval> | null = null;
let activeAlarmSound: SoundKind = "none";

function tickAlarm(sound: SoundKind) {
  playAlarm(sound);
}

export function startAlarm(sound: "chime" | "beep" | "soft" | "none" = "chime"): void {
  if (sound === "none") return;
  stopAlarm();
  activeAlarmSound = sound as SoundKind;
  tickAlarm(sound as SoundKind);
  alarmTimer = setInterval(() => tickAlarm(sound as SoundKind), 1800);
}

export function stopAlarm(): void {
  if (alarmTimer !== null) {
    clearInterval(alarmTimer);
    alarmTimer = null;
  }
  activeAlarmSound = "none";
}

export function isAlarmActive(): boolean {
  return alarmTimer !== null && activeAlarmSound !== "none";
}
