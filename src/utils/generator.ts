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
 * Gets absolute MIDI base offsets relative to a central octave point
 */
function getKeyCenterMidi(keyName: string): number {
  return 60 + NOTE_OFFSETS[keyName];
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
  const keyCenterMidi = getKeyCenterMidi(randomKey.name);

  let cadenceKeys = Object.keys(CADENCE_TYPES) as CadenceName[];
  
  // Grade 6 Rule: Strip out PLAGAL and INTERRUPTED cadences completely
  if (grade === 6) {
    cadenceKeys = cadenceKeys.filter(k => k !== 'PLAGAL' && k !== 'INTERRUPTED');
  } else if (grade === 7) {
    cadenceKeys = cadenceKeys.filter(k => k !== 'PLAGAL');
  }

  const randomCadenceKey = cadenceKeys[Math.floor(Math.random() * cadenceKeys.length)];
  const cadenceFormula = CADENCE_TYPES[randomCadenceKey];

  let finalChordsList = cadenceFormula.finalChords;
  let precedingChordsList = cadenceFormula.allowedPreceding;
  
  // Grade 6 & 7 Rule: Enforce only root position resolutions (no b or c suffixes)
  if (grade === 6 || grade === 7) {
    finalChordsList = finalChordsList.filter(c => !c.endsWith('b') && !c.endsWith('c'));
    precedingChordsList = precedingChordsList.filter(c => !c.endsWith('b') && !c.endsWith('c') && c !== 'II');
  }

  const finalChord = finalChordsList[Math.floor(Math.random() * finalChordsList.length)];
  const precedingChord = precedingChordsList[Math.floor(Math.random() * precedingChordsList.length)];
  
  // Grade 6 & 7 Rule: Generate exactly a 2-chord sequence instead of 3
  let selectedProgression = (grade === 6 || grade === 7)
    ? Array.of(precedingChord, finalChord)
    : Array.of('I', precedingChord, finalChord);

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
    cadenceType: cadenceFormula.name,
    chordSymbols: selectedProgression,
    keyChordMidi,
    progressionMidi
  };
}
