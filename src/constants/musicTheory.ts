// Define custom types for strict compiler checks
export type KeyType = 'major' | 'minor';

export interface ScaleKey {
  name: string;
  type: KeyType;
}

export interface ChordFormula {
  label: string;
  degree: number;
  bass: number;
  structure: number[];
}

export type CadenceName = 'PERFECT' | 'IMPERFECT' | 'PLAGAL' | 'INTERRUPTED';

export interface CadenceFormula {
  name: string;
  finalChords: string[];
  allowedPreceding: string[];
}

// MIDI Note number offsets relative to C (C = 0)
export const NOTE_OFFSETS: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 
  'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 
  'A#': 10, 'Bb': 10, 'B': 11
};

// Scale interval steps (semitones from the tonic root)
export const SCALE_INTERVALS: Record<KeyType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],                 // Natural Major
  minor: [0, 2, 3, 5, 7, 8, 11]                 // Harmonic Minor (raised 7th for functional chord logic)
};

// Available keys for the test generation
export const AVAILABLE_KEYS: ScaleKey[] = [
  { name: 'C', type: 'major' },
  { name: 'G', type: 'major' },
  { name: 'D', type: 'major' },
  { name: 'A', type: 'major' },
  { name: 'F', type: 'major' },
  { name: 'Bb', type: 'major' },
  { name: 'Eb', type: 'major' },
  { name: 'A', type: 'minor' },
  { name: 'E', type: 'minor' },
  { name: 'D', type: 'minor' },
  { name: 'G', type: 'minor' }
];

// Grade 8 Allowed Chords Matrix
export const ALLOWED_CHORDS: Record<string, ChordFormula> = {
  // --- TONIC ---
  // Root position: C4 (bass), then +4 semitones (E4), +7 semitones (G4)
  'I':   { label: 'Tonic (Root)',         degree: 0, bass: 0, structure: [4, 7] },
  // 1st Inversion: E4 (bass), then +3 semitones (G4), +8 semitones (C5)
  'Ib':  { label: 'Tonic (1st Inv)',      degree: 0, bass: 2, structure: [3, 8] }, 
  // 2nd Inversion: G4 (bass), then +5 semitones (C5), +9 semitones (E5)
  'Ic':  { label: 'Tonic (2nd Inv)',      degree: 0, bass: 4, structure: [5, 9] }, 

  // --- SUPERTONIC ---
  'II':  { label: 'Supertonic (Root)',    degree: 1, bass: 1, structure: [3, 7] }, 
  'IIb': { label: 'Supertonic (1st Inv)', degree: 1, bass: 3, structure: [4, 9] },

  // --- SUBDOMINANT ---
  'IV':  { label: 'Subdominant (Root)',   degree: 3, bass: 3, structure: [4, 7] },

  // --- DOMINANT ---
  'V':   { label: 'Dominant (Root)',      degree: 4, bass: 4, structure: [4, 7] }, 
  'Vb':  { label: 'Dominant (1st Inv)',   degree: 4, bass: 6, structure: [3, 8] },
  'Vc':  { label: 'Dominant (2nd Inv)',   degree: 4, bass: 1, structure: [5, 9] }, 
  // Dominant 7th adds a minor 7th (+10 semitones) above the root note
  'V7':  { label: 'Dominant 7th (Root)',  degree: 4, bass: 4, structure: [4, 7, 10] }, 

  // --- SUBMEDIANT ---
  'VI':  { label: 'Submediant (Root)',    degree: 5, bass: 5, structure: [4, 7] }
};
// Cadence formulas permitted by the syllabus
export const CADENCE_TYPES: Record<CadenceName, CadenceFormula> = {
  PERFECT: {
    name: 'Perfect',
    finalChords: ['V', 'V7'],
    allowedPreceding: ['I', 'Ib', 'II', 'IIb', 'IV', 'VI', 'Ic']
  },
  IMPERFECT: {
    name: 'Imperfect',
    finalChords: ['V'],
    allowedPreceding: ['I', 'Ib', 'II', 'IIb', 'IV', 'VI']
  },
  PLAGAL: {
    name: 'Plagal',
    finalChords: ['I'],
    allowedPreceding: ['IV']
  },
  INTERRUPTED: {
    name: 'Interrupted',
    finalChords: ['VI'],
    allowedPreceding: ['V', 'V7']
  }
};

// 2025/2026 simplified Roman numerals list (removes specific inversion characters)
export const SYLLABUS_2025_CHORDS = ['I', 'II', 'IV', 'V', 'V7', 'VI'];

// 2027/2028 complete Roman numerals list (with specific inversion layout suffixes)
export const SYLLABUS_2027_CHORDS = ['I', 'Ib', 'Ic', 'II', 'IIb', 'IV', 'V', 'Vb', 'Vc', 'V7', 'VI'];
