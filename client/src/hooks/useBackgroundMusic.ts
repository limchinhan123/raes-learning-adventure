import { useCallback, useRef, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";

/**
 * Generates gentle ambient background music using Web Audio API.
 * Auto-starts on first user interaction and adapts tempo/volume to the current screen.
 */
export function useBackgroundMusic() {
  const { soundEnabled, screen, musicStarted, setMusicStarted } = useGame();
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenRef = useRef(screen);

  // Keep screen ref updated
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  const getOrCreateContext = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainRef.current = ctxRef.current.createGain();
        gainRef.current.gain.setValueAtTime(0.06, ctxRef.current.currentTime);
        gainRef.current.connect(ctxRef.current.destination);
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  }, []);

  const playNote = useCallback((freq: number, startTime: number, duration: number, type: OscillatorType = "sine") => {
    const ctx = ctxRef.current;
    const masterGain = gainRef.current;
    if (!ctx || !masterGain) return;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.8, startTime + 0.1);
    noteGain.gain.setValueAtTime(0.8, startTime + duration * 0.6);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }, []);

  const playPad = useCallback((freq: number, startTime: number, duration: number) => {
    const ctx = ctxRef.current;
    const masterGain = gainRef.current;
    if (!ctx || !masterGain) return;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.5);
    noteGain.gain.setValueAtTime(0.3, startTime + duration * 0.7);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }, []);

  const playMelodyLoop = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !isPlayingRef.current) return;

    const now = ctx.currentTime;
    const currentScreen = screenRef.current;
    const isGameScreen = currentScreen === "game";
    const isReward = currentScreen === "reward";

    const calmNotes = [262, 294, 330, 392, 440, 523, 587, 659];
    const upbeatNotes = [330, 392, 440, 523, 587, 659, 784, 880];

    const notes = isGameScreen || isReward ? upbeatNotes : calmNotes;
    const tempo = isGameScreen ? 0.4 : isReward ? 0.35 : 0.5;
    const noteCount = 8;

    // Background pad chord
    playPad(notes[0] / 2, now, noteCount * tempo + 1);
    playPad(notes[2] / 2, now + 0.1, noteCount * tempo + 0.9);

    // Melody
    for (let i = 0; i < noteCount; i++) {
      const noteIdx = Math.floor(Math.random() * notes.length);
      const duration = tempo * (0.6 + Math.random() * 0.3);
      playNote(notes[noteIdx], now + i * tempo, duration, "sine");
    }

    const loopDuration = noteCount * tempo + 1.5;
    loopTimeoutRef.current = setTimeout(() => {
      if (isPlayingRef.current) {
        playMelodyLoop();
      }
    }, loopDuration * 1000);
  }, [playNote, playPad]);

  const startMusic = useCallback(() => {
    const ctx = getOrCreateContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      setMusicStarted();
      playMelodyLoop();
    }
  }, [getOrCreateContext, playMelodyLoop, setMusicStarted]);

  const stopMusic = useCallback(() => {
    isPlayingRef.current = false;
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  }, []);

  // Adjust volume based on screen
  useEffect(() => {
    if (!gainRef.current || !ctxRef.current) return;
    const now = ctxRef.current.currentTime;

    let volume = 0.06;
    if (screen === "game") volume = 0.04;
    else if (screen === "reward") volume = 0.07;
    else if (screen === "screenTimeReminder") volume = 0.03;

    gainRef.current.gain.linearRampToValueAtTime(volume, now + 0.5);
  }, [screen]);

  // Auto-start music on first user interaction
  useEffect(() => {
    if (!soundEnabled) {
      stopMusic();
      return;
    }

    const handleInteraction = () => {
      if (!isPlayingRef.current && soundEnabled) {
        startMusic();
      }
    };

    if (!musicStarted) {
      window.addEventListener("click", handleInteraction, { once: true });
      window.addEventListener("keydown", handleInteraction, { once: true });
      window.addEventListener("touchstart", handleInteraction, { once: true });
    } else if (soundEnabled && !isPlayingRef.current) {
      startMusic();
    }

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [soundEnabled, musicStarted, startMusic, stopMusic]);

  // Restart melody loop when screen changes
  useEffect(() => {
    if (isPlayingRef.current) {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
      loopTimeoutRef.current = setTimeout(playMelodyLoop, 500);
    }
  }, [screen, playMelodyLoop]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopMusic();
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, []);

  return { startMusic, stopMusic, isPlaying: isPlayingRef.current };
}
