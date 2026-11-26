/**
 * Plays an elegant, subtle two-tone notification chime using the Web Audio API.
 * Synthesizes sound directly in the browser with zero external file dependencies.
 */
export function playNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // First tone: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);

    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Second tone: 880 Hz (A5) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);

    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch (err) {
    // AudioContext might be blocked until user gesture, safely ignore
    console.debug("Audio chime skipped:", err);
  }
}
