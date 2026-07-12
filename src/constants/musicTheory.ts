// Define custom types for strict compiler checks
export type KeyType = 'major' | 'minor';

export interface ScaleKey {
  name: string;
  type: KeyType;
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

export interface ChordFormula {
  label: string;
  degree: number;
  bass: number;
  structureMajor: number[]; // Intervals above bass note in Major keys
  structureMinor: number[]; // Intervals above bass note in minor keys
}

export const ALLOWED_CHORDS: Record<string, ChordFormula> = {
  // --- TONIC ---
  'I':   { label: 'Tonic (Root)',         degree: 0, bass: 0, structureMajor: [4, 7],    structureMinor: [3, 7] },    // Maj vs min triad
  'Ib':  { label: 'Tonic (1st Inv)',      degree: 0, bass: 2, structureMajor: [3, 8],    structureMinor: [4, 8] }, 
  'Ic':  { label: 'Tonic (2nd Inv)',      degree: 0, bass: 4, structureMajor: [5, 9],    structureMinor: [5, 9] }, 

  // --- SUPERTONIC ---
  'II':  { label: 'Supertonic (Root)',    degree: 1, bass: 1, structureMajor: [3, 7],    structureMinor: [3, 6] },    // min vs dim triad
  'IIb': { label: 'Supertonic (1st Inv)', degree: 1, bass: 3, structureMajor: [4, 9],    structureMinor: [3, 8] },

  // --- SUBDOMINANT ---
  'IV':  { label: 'Subdominant (Root)',   degree: 3, bass: 3, structureMajor: [4, 7],    structureMinor: [3, 7] },    // Maj vs min triad

  // --- DOMINANT ---
  'V':   { label: 'Dominant (Root)',      degree: 4, bass: 4, structureMajor: [4, 7],    structureMinor: [4, 7] },    // Always Major in harmonic minor
  'Vb':  { label: 'Dominant (1st Inv)',   degree: 4, bass: 6, structureMajor: [3, 8],    structureMinor: [3, 8] },
  'Vc':  { label: 'Dominant (2nd Inv)',   degree: 4, bass: 1, structureMajor: [5, 9],    structureMinor: [5, 9] }, 
  'V7':  { label: 'Dominant 7th (Root)',  degree: 4, bass: 4, structureMajor: [4, 7, 10], structureMinor: [4, 7, 10] }, // Includes minor 7th

  // --- SUBMEDIANT ---
  'VI':  { label: 'Submediant (Root)',    degree: 5, bass: 5, structureMajor: [3, 7],    structureMinor: [4, 7] }     // min vs Maj triad
};


// Cadence formulas permitted by the syllabus
export const CADENCE_TYPES: Record<CadenceName, CadenceFormula> = {
  PERFECT: {
    name: 'Perfect',
    finalChords: ['I', 'Ib', 'Ic'],
    allowedPreceding: ['V', 'Vb', 'Vc']
  },
  IMPERFECT: {
    name: 'Imperfect',
    finalChords: ['V', 'Vb', 'Vc'],
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
    allowedPreceding: ['V']
  }
};

// 2025/2026 simplified Roman numerals list (removes specific inversion characters)
export const SYLLABUS_2025_CHORDS = ['I', 'II', 'IV', 'V', 'VI'];

// 2027/2028 complete Roman numerals list (with specific inversion layout suffixes)
export const SYLLABUS_2027_CHORDS = ['I', 'Ib', 'Ic', 'II', 'IIb', 'IV', 'V', 'Vb', 'Vc', 'VI'];

export interface ModulationDestination {
  name: string;      // e.g., "Dominant", "Relative Minor"
  type: KeyType;     // 'major' or 'minor'
  semitoneOffset: number; // Semitones away from the starting root
}

// Syllabus Rules: Major starting key destinations
export const MAJOR_MODULATIONS: ModulationDestination[] = [
  { name: 'Dominant', type: 'major', semitoneOffset: 7 },     // C Major -> G Major
  { name: 'Subdominant', type: 'major', semitoneOffset: 5 },  // C Major -> F Major
  { name: 'Relative Minor', type: 'minor', semitoneOffset: 9 } // C Major -> A Minor
];

// Syllabus Rules: Minor starting key destinations
export const MINOR_MODULATIONS: ModulationDestination[] = [
  { name: 'Dominant', type: 'minor', semitoneOffset: 7 },     // A Minor -> E Minor
  { name: 'Subdominant', type: 'minor', semitoneOffset: 5 },  // A Minor -> D Minor
  { name: 'Relative Major', type: 'major', semitoneOffset: 3 } // A Minor -> C Major
];
