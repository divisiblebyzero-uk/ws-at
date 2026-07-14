import { ALLOWED_CHORDS, CADENCE_TYPES, type CadenceName, type KeyType } from '../constants/musicTheory';

/**
 * Ensures chord tones stay strictly within Octaves 3 to 5 (MIDI 48 - 83)
 */
export function clampSandboxNotes(notesArray: number[]): number[] {
  return notesArray.map((note: number, idx: number) => {
    let processed = note;
    if (idx === 0) {
      while (processed > 59) processed -= 12;
      while (processed < 48) processed += 12;
    } else {
      while (processed > 83) processed -= 12;
      while (processed < 60) processed += 12;
    }
    return processed;
  }).sort((a, b) => a - b);
}

/**
 * Converts raw MIDI values into standard text letters
 */
export function midiToNoteName(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  return `${notes[midi % 12]}${octave}`;
}

/**
 * Computes tight lead-sheet annotations (e.g., Cm b, G7)
 */
export function getFunctionalChordLabel(symbol: string, keyType: KeyType, selectedKey: string): { symbolText: string; literalName: string } {
  const formula = ALLOWED_CHORDS[symbol];
  if (!formula) return { symbolText: symbol, literalName: '' };

  let isMinor = false;
  let isDiminished = false;

  if (keyType === 'major') {
    if (symbol.startsWith('II') || symbol.startsWith('VI')) isMinor = true;
  } else {
    if (symbol.startsWith('I') || symbol.startsWith('IV')) isMinor = true;
    if (symbol.startsWith('II')) isDiminished = true;
  }

  let outSymbol = symbol;
  if (isMinor) outSymbol = symbol.toLowerCase();
  if (isDiminished) outSymbol = symbol.toLowerCase() + '°';

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootOffsets: Record<string, number> = { 'C': 0, 'G': 7, 'D': 2, 'A': 9, 'F': 5, 'Bb': 10, 'Eb': 3 };
  const baseScaleOffset = rootOffsets[selectedKey] || 0;
  
  const majorScaleSteps = Array.of(0, 2, 4, 5, 7, 9, 11);
  const minorScaleSteps = Array.of(0, 2, 3, 5, 7, 8, 11);
  const targetSteps = keyType === 'major' ? majorScaleSteps : minorScaleSteps;
  
  const rootPitchIndex = (baseScaleOffset + targetSteps[formula.degree]) % 12;
  const rootLetter = noteNames[rootPitchIndex];

  let qualitySuffix = '';
  if (isMinor) qualitySuffix = 'm';
  if (isDiminished) qualitySuffix = '°';
  if (symbol.startsWith('V7')) qualitySuffix = '7';

  let inversionSuffix = '';
  if (symbol.endsWith('b')) inversionSuffix = ' b';
  if (symbol.endsWith('c')) inversionSuffix = ' c';

  return {
    symbolText: outSymbol,
    literalName: `${rootLetter}${qualitySuffix}${inversionSuffix}`
  };
}

/**
 * Packages full 3-chord cadence progressions with safe index lookups
 */
export function buildCadenceProgressionData(cadenceKey: CadenceName, keyCenterMidi: number, selectedType: KeyType) {
  const formula = CADENCE_TYPES[cadenceKey];
  const finalChord = formula.finalChords[Math.floor(Math.random() * formula.finalChords.length)];
  const precedingChord = formula.allowedPreceding[Math.floor(Math.random() * formula.allowedPreceding.length)];
  const openingChord = precedingChord !== 'I' ? 'I' : 'Ib';
  const progression = [openingChord, precedingChord, finalChord];

  const fI = ALLOWED_CHORDS['I'];
  const structI = selectedType === 'major' ? fI.structureMajor : fI.structureMinor;
  const keyChordMidi = clampSandboxNotes(structI.map((offset: number) => keyCenterMidi + offset));

  const progressionMidi: number[][] = progression.map((symbol: string) => {
    const f = ALLOWED_CHORDS[symbol];
    if (!f) return [];
    const offsetsArr = selectedType === 'major' ? f.structureMajor : f.structureMinor;
    return clampSandboxNotes(offsetsArr.map((offset: number) => keyCenterMidi + offset));
  });

  return {
    formula,
    progression,
    keyChordMidi,
    progressionMidi,
    chord1Midi: progressionMidi.at(0) || [],
    chord2Midi: progressionMidi.at(1) || [],
    chord3Midi: progressionMidi.at(2) || []
  };
}
