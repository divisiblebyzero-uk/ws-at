import { 
  AVAILABLE_KEYS, 
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
  chordSymbols: string[]; 
  keyChordMidi: number[]; 
  progressionMidi: number[][]; 
}

/**
 * Restricts any chord voice to stay strictly within Octaves 3 to 5 (MIDI 48 - 83)
 */
function restrictToOctaveRange(notesArray: number[]): number[] {
  return notesArray.map((note: number, idx: number) => {
    let processed = note;
    if (idx === 0) {
      // Left-Hand Bass Note: Keep anchored in Octave 3 (MIDI 48 - 59)
      while (processed > 59) processed -= 12;
      while (processed < 48) processed += 12;
    } else {
      // Right-Hand Upper Voices: Keep balanced in Octaves 4 and 5 (MIDI 60 - 83)
      while (processed > 83) processed -= 12;
      while (processed < 60) processed += 12;
    }
    return processed;
  }).sort((a, b) => a - b);
}

/**
 * Dynamically builds a single chord from semitone offsets and clamps it inside the target range
 */
function buildChordMidi(chordSymbol: string, keyCenterMidi: number, keyType: 'major' | 'minor', forceRootPosition: boolean): number[] {
  let targetSymbol = chordSymbol;
  
  // If forced to root position, strip inversion suffixes
  if (forceRootPosition) {
    if (targetSymbol.startsWith('V7')) targetSymbol = 'V7';
    else if (targetSymbol.startsWith('I')) targetSymbol = 'I';
    else if (targetSymbol.startsWith('II')) targetSymbol = 'II';
    else if (targetSymbol.startsWith('IV')) targetSymbol = 'IV';
    else if (targetSymbol.startsWith('V')) targetSymbol = 'V';
    else if (targetSymbol.startsWith('VI')) targetSymbol = 'VI';
  }

  const formula = ALLOWED_CHORDS[targetSymbol];
  if (!formula) throw new Error(`Chord symbol ${targetSymbol} not found.`);

  const offsetsArray = keyType === 'major' ? formula.structureMajor : formula.structureMinor;
  const rawNotes = offsetsArray.map((offset: number) => keyCenterMidi + offset);
  
  return restrictToOctaveRange(rawNotes);
}

/**
 * Generates an analytical question, adjusting chords based on grade limits and easy mode settings
 */
export function generateQuestion(forceRootPosition: boolean = false, grade: number = 8): GeneratedQuestion {
  const randomKey = AVAILABLE_KEYS[Math.floor(Math.random() * AVAILABLE_KEYS.length)];
  const keyCenterMidi = 60 + NOTE_OFFSETS[randomKey.name];

  let selectedCadenceType = '';
  let selectedProgression: string[] = [];

  // --- FIX: Explicit isolation paths for Grade 6 to completely prevent randomizer loop hijacking ---
  if (grade === 6) {
    // Grade 6: 50% chance for Perfect (V -> I) or Imperfect (I -> V or IV -> V)
    const isPerfect = Math.random() > 0.5;
    
    if (isPerfect) {
      selectedCadenceType = 'Perfect';
      selectedProgression = Array.of('V', 'I');
    } else {
      selectedCadenceType = 'Imperfect';
      // Alternate between the two most common root forms of imperfect cadences
      selectedProgression = Math.random() > 0.5 ? Array.of('I', 'V') : Array.of('IV', 'V');
    }
  } 
  else if (grade === 7) {
    // Grade 7: Perfect (V->I), Imperfect (I/IV->V), or Interrupted (V->VI)
    const rand = Math.random();
    if (rand < 0.34) {
      selectedCadenceType = 'Perfect';
      selectedProgression = Array.of('V', 'I');
    } else if (rand < 0.67) {
      selectedCadenceType = 'Imperfect';
      selectedProgression = Math.random() > 0.5 ? Array.of('I', 'V') : Array.of('IV', 'V');
    } else {
      selectedCadenceType = 'Interrupted';
      selectedProgression = Array.of('V', 'VI');
    }
  } 
  else {
    // Grade 8: Advanced open fallback framework tracking all inversions
    let cadenceKeys = Object.keys(CADENCE_TYPES) as CadenceName[];
    const randomCadenceKey = cadenceKeys[Math.floor(Math.random() * cadenceKeys.length)];
    const cadenceFormula = CADENCE_TYPES[randomCadenceKey];
    
    selectedCadenceType = cadenceFormula.name;
    const finalChord = cadenceFormula.finalChords[Math.floor(Math.random() * cadenceFormula.finalChords.length)];
    const precedingChord = cadenceFormula.allowedPreceding[Math.floor(Math.random() * cadenceFormula.allowedPreceding.length)];
    
    const openingChords = ['I', 'Ib', 'IV'];
    const validOpeners = openingChords.filter((c: string) => c !== precedingChord); 
    const openingChord = validOpeners[Math.floor(Math.random() * validOpeners.length)];
    
    selectedProgression = Array.of(openingChord, precedingChord, finalChord);
  }

  // Enforce root positioning clean-ups 
  const effectiveRootPositionFlag = forceRootPosition || grade === 6 || grade === 7;

  if (effectiveRootPositionFlag) {
    selectedProgression = selectedProgression.map(sym => {
      if (sym.startsWith('V7')) return 'V7';
      if (sym.startsWith('VI')) return 'VI'; 
      if (sym.startsWith('V')) return 'V';
      if (sym.startsWith('I')) return 'I';
      if (sym.startsWith('II')) return 'II';
      if (sym.startsWith('IV')) return 'IV';
      return 'I';
    });
  }

  const keyChordMidi = buildChordMidi('I', keyCenterMidi, randomKey.type, false);
  const progressionMidi = selectedProgression.map((symbol: string) => 
    buildChordMidi(symbol, keyCenterMidi, randomKey.type, effectiveRootPositionFlag)
  );

  return {
    key: randomKey,
    cadenceType: selectedCadenceType,
    chordSymbols: selectedProgression,
    keyChordMidi,
    progressionMidi
  };
}
