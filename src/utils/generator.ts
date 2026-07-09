import { 
  AVAILABLE_KEYS, 
  SCALE_INTERVALS, 
  NOTE_OFFSETS, 
  ALLOWED_CHORDS, 
  CADENCE_TYPES
} from '../constants/musicTheory';

import type { 
  ScaleKey, 
  CadenceName
} from '../constants/musicTheory';

export interface GeneratedQuestion {
  key: ScaleKey;
  cadenceType: string;
  chordSymbols: string[]; // e.g. ['Ic', 'V', 'I']
  simplifiedSymbols: string[]; // e.g. ['I', 'V', 'I'] for 2025-2026 syllabus
  keyChordMidi: number[]; 
  progressionMidi: number[][]; 
}

/**
 * Gets absolute MIDI values for a scale based on a starting tonic root note
 */
function getScaleMidiNotes(keyName: string, keyType: 'major' | 'minor', baseOctave: number = 4): number[] {
  const rootOffset = NOTE_OFFSETS[keyName];
  const startMidi = 12 * (baseOctave + 1) + rootOffset; 
  const intervals = SCALE_INTERVALS[keyType];
  
  const scaleNotes: number[] = [];
  for (let octave = 0; octave < 2; octave++) {
    for (let i = 0; i < intervals.length; i++) {
      scaleNotes.push(startMidi + intervals[i] + (octave * 12));
    }
  }
  return scaleNotes;
}

/**
 * Strips out inversion markers to support the legacy 2025-2026 ABRSM format
 */
export function getSimplifiedChordSymbol(symbol: string): string {
  if (symbol.startsWith('V7')) return 'V7';
  if (symbol.startsWith('I')) return 'I';
  if (symbol.startsWith('II')) return 'II';
  if (symbol.startsWith('IV')) return 'IV';
  if (symbol.startsWith('V')) return 'V';
  if (symbol.startsWith('VI')) return 'VI';
  return symbol;
}

/**
 * Converts an abstract symbol into real MIDI notes based on active scale arrays
 */
function buildChordMidi(
  chordSymbol: string, 
  scaleMidiNotes: number[], 
  keyType: 'major' | 'minor',
  forceRootPosition: boolean = false
): number[] {
  // If Easy Mode is active, force the system to find the standard root-position variant
  let targetSymbol = chordSymbol;
  if (forceRootPosition) {
    targetSymbol = getSimplifiedChordSymbol(chordSymbol);
  }

  const formula = ALLOWED_CHORDS[targetSymbol];
  if (!formula) throw new Error(`Chord symbol ${targetSymbol} not found in rules matrix.`);

  let bassMidi = scaleMidiNotes[formula.bass];
  bassMidi -= 12; // Drop bass voice down an octave for clean piano texture

  const finalChordNotes: number[] = [bassMidi];
  for (let i = 0; i < formula.structure.length; i++) {
    const interval = formula.structure[i];
    finalChordNotes.push(bassMidi + interval);
  }

  return finalChordNotes;
}

/**
 * Primary Engine Function: Constructs a complete valid question sequence
 */
export function generateQuestion(forceRootPosition: boolean = false): GeneratedQuestion {
  // 1. Pick a random key
  const randomKey = AVAILABLE_KEYS[Math.floor(Math.random() * AVAILABLE_KEYS.length)];
  const scaleNotes = getScaleMidiNotes(randomKey.name, randomKey.type);

  // 2. Select a random target cadence type
  const cadenceKeys = Object.keys(CADENCE_TYPES) as CadenceName[];
  const randomCadenceKey = cadenceKeys[Math.floor(Math.random() * cadenceKeys.length)];
  const cadenceFormula = CADENCE_TYPES[randomCadenceKey];

  // 3. Choose the final resolution chord
  const finalChord = cadenceFormula.finalChords[Math.floor(Math.random() * cadenceFormula.finalChords.length)];

  // 4. Select a valid preceding chord
  const precedingChord = cadenceFormula.allowedPreceding[Math.floor(Math.random() * cadenceFormula.allowedPreceding.length)];

  // 5. Select an introductory chord to build a full 3-chord phrase
  const openingChords = ['I', 'Ib', 'IV'];
  const validOpeners = openingChords.filter((c: string) => c !== precedingChord);
  const openingChord = validOpeners[Math.floor(Math.random() * validOpeners.length)];

  const selectedProgression = [openingChord, precedingChord, finalChord];
  
  // 6. Map the legacy 2025-2026 Roman numeral array variant
  const simplifiedProgression = selectedProgression.map((sym: string) => getSimplifiedChordSymbol(sym));

  // 7. Generate the introductory key-chord (Always root position I)
  const keyChordMidi = buildChordMidi('I', scaleNotes, randomKey.type, false);

  // 8. Translate chosen symbols into absolute sound values
  const progressionMidi = selectedProgression.map((symbol: string) => 
    buildChordMidi(symbol, scaleNotes, randomKey.type, forceRootPosition)
  );

  return {
    key: randomKey,
    cadenceType: cadenceFormula.name,
    chordSymbols: selectedProgression,
    simplifiedSymbols: simplifiedProgression,
    keyChordMidi,
    progressionMidi
  };
}
