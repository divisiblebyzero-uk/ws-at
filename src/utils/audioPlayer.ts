import * as Tone from 'tone';
import { type ScheduledNote } from './modulationGenerator';

// Initialize a premium multi-sampled Grand Piano mapping
// Tone.Sampler stretches these core notes to generate the entire keyboard seamlessly
const piano = new Tone.Sampler({
  urls: {
    C3: "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    A5: "A5.mp3"
  },
  release: 1.2,
  // Pulls directly from the official open-source Salamander Grand Piano asset bank
  baseUrl: "/audio/piano/",
  
  onload: () => {
    console.log("🎹 Grand Piano acoustic samples loaded successfully!");
  }
}).toDestination();

// Soften volume to balance out rich acoustic piano frequencies over headphones/speakers
piano.volume.value = -4;

/**
 * Converts raw MIDI values (like 60) into absolute string values (like "C4")
 */
function midiToNoteName(midiNumber: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = midiNumber % 12;
  return `${notes[noteIndex]}${octave}`;
}

/**
 * Plays a single group of notes simultaneously as an acoustic block chord
 */
export function playChord(midiNotes: number[], duration: string = '1n'): void {
  if (Tone.getContext().state !== 'running') {
    Tone.getContext().resume();
  }
  
  const formattedNotes = midiNotes.map(midiToNoteName);
  piano.triggerAttackRelease(formattedNotes, duration);
}

/**
 * Core Playback System: Schedules the precise timing blocks for the exam phrase
 * Rule: Plays each chord in the progression sequentially using Tone.Sampler piano.
 * Returns a Promise that resolves when the entire sequence finishes playing.
 */
/**
 * Core Playback System: Schedules the precise timing blocks for the exam phrase
 * Rule: Plays a reference key-chord, pauses, then plays the progression sequence seamlessly.
 * Returns a Promise that resolves when everything finishes playing.
 */
export const playCadenceProgression = async (
  progressionMidi: number[][], 
  keyChordMidi: number[] | null = null,
  chordDurationMs = 1200
): Promise<void> => {
  return new Promise((resolve) => {
    if (!progressionMidi || progressionMidi.length === 0) {
      resolve();
      return;
    }

    if (Tone.getContext().state !== 'running') {
      Tone.getContext().resume();
    }

    // Step 1: Definition of the main progression worker loop
    let currentIdx = 0;
    const playNextProgressionChord = () => {
      if (currentIdx >= progressionMidi.length) {
        // Wait for the final chord to decay before releasing UI buttons
        setTimeout(() => resolve(), chordDurationMs);
        return;
      }

      const currentChordNotes = progressionMidi[currentIdx];
      playChord(currentChordNotes, '2n'); // Crisp half-note duration

      currentIdx++;
      setTimeout(playNextProgressionChord, chordDurationMs);
    };

    // Step 2: Play the reference key-chord first if provided
    if (keyChordMidi && keyChordMidi.length > 0) {
      playChord(keyChordMidi, '2n');

      // Pause for one full beats block (chordDurationMs) to establish the key center 
      // before starting the cadence progression
      setTimeout(() => {
        playNextProgressionChord();
      }, chordDurationMs*2);
    } else {
      // Fallback: If no key-chord is supplied, drop straight into the progression
      playNextProgressionChord();
    }
  });
};


/**
 * Force stops any scheduled audio sequences instantly
 */
export function stopAllAudio(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  piano.releaseAll();
}

export const playAdvancedModulationPassage = (passage: ScheduledNote[]) => {
  stopAllAudio();

  // 1. Translate Tone.js musical bars ("0:0:0") into microsecond timeouts
  // 1 beat at 120BPM = 500ms
  const timeMap: Record<string, number> = {
    "0:0:0": 0,
    "0:1:0": 500,
    "0:2:0": 1000,
    "0:3:0": 1500,
    "1:0:0": 2000,
    "1:1:0": 2500,
    "1:2:0": 3000,
    "1:3:0": 3500,
    "2:0:0": 4000,
    "2:1:0": 4500, // Trigger point for the extra walking bass step notes
    "2:2:0": 5000,
    "2:3:0": 5500,
    "3:0:0": 6000
  };

  const activeTimeouts: number[] = [];

  // 2. Loop through every single scheduled voice note independently
  passage.forEach((item) => {
    const delay = timeMap[item.time] ?? 0;
    
    const timeoutId = window.setTimeout(() => {
      // FIX: Bypass playChord block collapsing! 
      // Convert the letter string (e.g. "C4") into a direct raw MIDI integer value
      const rawMidi = Tone.Midi(item.note).toMidi();
      
      // Fire the note completely on its own independent audio voice path channel
      playChord([rawMidi], item.duration);
    }, delay);

    activeTimeouts.push(timeoutId);
  });
};
