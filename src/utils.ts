/**
 * Safe haptic vibration utility for a tactile kiosk user experience.
 * Fallbacks elegantly if navigator.vibrate is not available or blocked in current frame.
 */
export function triggerVibration(pattern: number | number[] = 15): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Handle security sandbox exceptions in restricted iframe views gracefully
    }
  }
}

// Shared AudioContext to prevent browser limit blocks
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  
  // Resume context if browser suspended it due to lack of user gesture
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a high-end, extremely subtle and swift digital button 'click' sound.
 * Synthetic pitch drop with custom gain shaping to avoid clipping.
 */
export function playClickSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    // Quick premium high-to-mid frequency pop-click
    osc.type = "sine";
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (error) {
    // Fail silently in sandboxed iframes or audio-disabled environments
  }
}

/**
 * Play an organic, premium liquid droplet 'ripple' sound.
 * Harmonics and overlapping sine/triangle components for a warm tactile chime.
 */
export function playRippleSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    // Soft watery resonant chime
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(280, now);
    osc1.frequency.exponentialRampToValueAtTime(380, now + 0.3);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(560, now);
    osc2.frequency.exponentialRampToValueAtTime(760, now + 0.25);
    
    // Soft volume curve to sound warm and polished
    gainNode.gain.setValueAtTime(0.03, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  } catch (error) {
    // Fail silently in sandboxed iframes
  }
}

