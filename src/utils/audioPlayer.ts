import * as Tone from 'tone';

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
  // baseUrl: "https://tonejs.github.io/audio/salamander/",
  
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
 * Rule: Play key-chord, pause, then play the 3-chord sequence seamlessly
 */
export function playCadenceProgression(keyChordMidi: number[], progressionMidi: number[][]): void {
  if (Tone.getContext().state !== 'running') {
    Tone.getContext().resume();
  }

  const transport = Tone.getTransport();
  transport.cancel();

  let timeOffset = 0;

  // 1. Play the introductory Key-Chord (Holds for 1.8 seconds for a nice decay)
  transport.schedule((time) => {
    const notes = keyChordMidi.map(midiToNoteName);
    piano.triggerAttackRelease(notes, '2n', time);
  }, timeOffset);

  // 2. Add an explicit silence gap after the key chord (2.8 seconds total from start)
  timeOffset += 2.8;

  // 3. Play the 3 cadential chords sequentially with rhythmic gaps
  progressionMidi.forEach((chordMidi) => {
    transport.schedule((time) => {
      const notes = chordMidi.map(midiToNoteName);
      // Give each progression chord a clear, distinct 1.4-second acoustic space
      piano.triggerAttackRelease(notes, '2n', time);
    }, timeOffset);
    
    // Step forward 1.6 seconds per chord to mimic natural exam pacing
    timeOffset += 1.6;
  });

  transport.start();
}

/**
 * Force stops any scheduled audio sequences instantly
 */
export function stopAllAudio(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  piano.releaseAll();
}
