import { AVAILABLE_KEYS, NOTE_OFFSETS, SCALE_INTERVALS, ALLOWED_CHORDS } from '../constants/musicTheory';
import { MAJOR_MODULATIONS, MINOR_MODULATIONS } from '../constants/musicTheory';
import type { ScaleKey, KeyType, ModulationDestination } from '../constants/musicTheory';

export interface ModulationQuestion {
  startKey: ScaleKey;
  targetModulation: ModulationDestination;
  targetKeyName: string;
  keyChordMidi: number[];
  passageMidi: number[][]; // 4-chord progression establishing modulation
}

/**
 * Gets absolute MIDI values for a scale based on a starting tonic root note and key type
 */
function getMidiNotesForScale(keyName: string, keyType: KeyType, octave: number = 4): number[] {
  const rootOffset = NOTE_OFFSETS[keyName];
  const startMidi = 12 * (octave + 1) + rootOffset;
  const intervals = SCALE_INTERVALS[keyType];
  return intervals.map((interval: number) => startMidi + interval);
}

/**
 * Dynamically builds a single chord based on its symbol and the active key's tonality (Major or Minor)
 */
function buildSingleChord(symbol: string, scaleNotes: number[], keyType: KeyType): number[] {
  const formula = ALLOWED_CHORDS[symbol] || ALLOWED_CHORDS['I'];
  let bassMidi = scaleNotes[formula.bass] - 12; // Shift down 1 octave for clear piano bassline

  // Dynamically select the correct interval layout array based on the target key's type
  const structure = keyType === 'major' ? formula.structureMajor : formula.structureMinor;

  return [bassMidi, ...structure.map((interval: number) => bassMidi + interval)];
}

/**
 * Calculates the alphabetical letter name of a key given a starting key and semitone offset
 */
function calculateTargetKeyName(startKeyName: string, semitoneOffset: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Standardise accidental mappings for straightforward index lookups
  const aliasMap: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
  const lookupName = aliasMap[startKeyName] || startKeyName;
  
  const startIdx = notes.indexOf(lookupName);
  if (startIdx === -1) return startKeyName; // Safe fallback
  
  const targetIdx = (startIdx + semitoneOffset) % 12;
  return notes[targetIdx];
}

/**
 * Primary Modulation Engine Function
 */
export function generateModulationQuestion(phase: 'majorStart' | 'minorStart'): ModulationQuestion {
  // 1. Filter and select a starting key matching the current test phase
  const targetType: KeyType = phase === 'majorStart' ? 'major' : 'minor';
  const potentialKeys = AVAILABLE_KEYS.filter((k: ScaleKey) => k.type === targetType);
  const startKey = potentialKeys[Math.floor(Math.random() * potentialKeys.length)];
  const startScaleNotes = getMidiNotesForScale(startKey.name, startKey.type);

  // 2. Select a valid ABRSM syllabus target destination rule
  const rulesList = startKey.type === 'major' ? MAJOR_MODULATIONS : MINOR_MODULATIONS;
  const targetModulation = rulesList[Math.floor(Math.random() * rulesList.length)];
  
  // 3. Compute the destination scale configuration
  const targetKeyName = calculateTargetKeyName(startKey.name, targetModulation.semitoneOffset);
  const targetScaleNotes = getMidiNotesForScale(targetKeyName, targetModulation.type);

  // 4. Generate the baseline introductory reference Key-Chord (Always home tonic)
  const keyChordMidi = buildSingleChord('I', startScaleNotes, startKey.type);

  // 5. Construct a clear harmonic passage tracking the change in key matrix:
  // Chord 1: Tonic of starting key (Establishes original tonality context)
  // Chord 2: Pivot chord (Subdominant built inside the original key)
  // Chord 3: Dominant 7th (V7) built inside the NEW key (Introduces accidental pull)
  // Chord 4: Tonic (I) resolving securely into the NEW key center
  const c1 = buildSingleChord('I', startScaleNotes, startKey.type);
  const c2 = buildSingleChord('IV', startScaleNotes, startKey.type); 
  const c3 = buildSingleChord('V7', targetScaleNotes, targetModulation.type);
  const c4 = buildSingleChord('I', targetScaleNotes, targetModulation.type);

  return {
    startKey,
    targetModulation,
    targetKeyName,
    keyChordMidi,
    passageMidi: [c1, c2, c3, c4]
  };
}
