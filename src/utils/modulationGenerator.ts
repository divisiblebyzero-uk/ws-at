import { AVAILABLE_KEYS, NOTE_OFFSETS, SCALE_INTERVALS, ALLOWED_CHORDS } from '../constants/musicTheory';
import { MAJOR_MODULATIONS, MINOR_MODULATIONS, type ModulationDestination } from '../constants/musicTheory';
import type { ScaleKey } from '../constants/musicTheory';

export interface ModulationQuestion {
  startKey: ScaleKey;
  targetModulation: ModulationDestination;
  targetKeyName: string;
  keyChordMidi: number[];
  passageMidi: number[][]; // 4-chord progression establishing modulation
}

function getMidiNotesForScale(keyName: string, keyType: 'major' | 'minor', octave: number = 4): number[] {
  const rootOffset = NOTE_OFFSETS[keyName];
  const startMidi = 12 * (octave + 1) + rootOffset;
  const intervals = SCALE_INTERVALS[keyType];
  return intervals.map(interval => startMidi + interval);
}

function buildSingleChord(symbol: string, scaleNotes: number[]): number[] {
  const formula = ALLOWED_CHORDS[symbol] || ALLOWED_CHORDS['I'];
  let bassMidi = scaleNotes[formula.bass] - 12; // Shift down for clear bassline
  return [bassMidi, ...formula.structure.map(interval => bassMidi + interval)];
}

/**
 * Calculates the alphabetical letter name of a key given a starting key and semitone offset
 */
function calculateTargetKeyName(startKeyName: string, semitoneOffset: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const startIdx = notes.indexOf(startKeyName.replace('Db', 'C#').replace('Eb', 'D#').replace('Bb', 'A#').replace('Ab', 'G#'));
  if (startIdx === -1) return startKeyName; // Fallback
  const targetIdx = (startIdx + semitoneOffset) % 12;
  return notes[targetIdx];
}

export function generateModulationQuestion(phase: 'majorStart' | 'minorStart'): ModulationQuestion {
  // 1. Pick a starting key matching the current exam phase requirement
  const potentialKeys = AVAILABLE_KEYS.filter(k => k.type === (phase === 'majorStart' ? 'major' : 'minor'));
  const startKey = potentialKeys[Math.floor(Math.random() * potentialKeys.length)];
  const startScaleNotes = getMidiNotesForScale(startKey.name, startKey.type);

  // 2. Select a target modulation destination dictated by ABRSM limits
  const rulesList = startKey.type === 'major' ? MAJOR_MODULATIONS : MINOR_MODULATIONS;
  const targetModulation = rulesList[Math.floor(Math.random() * rulesList.length)];
  
  const targetKeyName = calculateTargetKeyName(startKey.name, targetModulation.semitoneOffset);
  const targetScaleNotes = getMidiNotesForScale(targetKeyName, targetModulation.type);

  // 3. Generate baseline introductory Key-Chord
  const keyChordMidi = buildSingleChord('I', startScaleNotes);

  // 4. Construct a clear harmonic passage: 
  // Chord 1: Tonic of starting key (Establishes home)
  // Chord 2: Pivot chord (Subdominant or Tonic of old key)
  // Chord 3: Dominant 7th ($V^7$) of the NEW key (Forces modulation listener pull)
  // Chord 4: Tonic ($I$) of the NEW key (Resolves securely in destination)
  const c1 = buildSingleChord('I', startScaleNotes);
  const c2 = buildSingleChord('IV', startScaleNotes); 
  const c3 = buildSingleChord('V7', targetScaleNotes);
  const c4 = buildSingleChord('I', targetScaleNotes);

  return {
    startKey,
    targetModulation,
    targetKeyName,
    keyChordMidi,
    passageMidi: [c1, c2, c3, c4]
  };
}
