import { AVAILABLE_KEYS, NOTE_OFFSETS, SCALE_INTERVALS, ALLOWED_CHORDS } from '../constants/musicTheory';
import { MAJOR_MODULATIONS, MINOR_MODULATIONS } from '../constants/musicTheory';
import type { ScaleKey, KeyType, ModulationDestination } from '../constants/musicTheory';

export interface ScheduledNote {
  note: string;     
  time: string;     
  duration: string; 
}

export interface AdvancedModulationQuestion {
  startKey: ScaleKey;
  targetModulation: ModulationDestination;
  targetKeyName: string;
  keyChordMidi: number[]; 
  passageNotes: ScheduledNote[]; 
}

function midiToNoteName(midiNumber: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${notes[midiNumber % 12]}${octave}`;
}

function getMidiNotesForScale(keyName: string, keyType: KeyType, octave: number = 4): number[] {
  const rootOffset = NOTE_OFFSETS[keyName];
  const startMidi = 12 * (octave + 1) + rootOffset;
  const intervals = SCALE_INTERVALS[keyType];
  return intervals.map((interval: number) => startMidi + interval);
}

function calculateTargetKeyName(startKeyName: string, semitoneOffset: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const aliasMap: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
  const lookupName = aliasMap[startKeyName] || startKeyName;
  const startIdx = notes.indexOf(lookupName);
  if (startIdx === -1) return startKeyName;
  return notes[(startIdx + semitoneOffset) % 12];
}

/**
 * Restricts note ranges on construction (isBass determines the target octave register)
 */
function restrictNoteToRange(noteMidi: number, isBass: boolean): number {
  let processed = noteMidi;
  if (isBass) {
    while (processed > 59) processed -= 12;
    while (processed < 48) processed += 12; // Octave 3 (C3 to B3)
  } else {
    while (processed > 83) processed -= 12;
    while (processed < 60) processed += 12; // Octaves 4-5 (C4 to B5)
  }
  return processed;
}

export function generateAdvancedModulation(phase: 'majorStart' | 'minorStart'): AdvancedModulationQuestion {
  const targetType: KeyType = phase === 'majorStart' ? 'major' : 'minor';
  const potentialKeys = AVAILABLE_KEYS.filter((k: ScaleKey) => k.type === targetType);
  const startKey = potentialKeys[Math.floor(Math.random() * potentialKeys.length)];
  
  const startScale = getMidiNotesForScale(startKey.name, startKey.type);
  const rulesList = startKey.type === 'major' ? MAJOR_MODULATIONS : MINOR_MODULATIONS;
  const targetModulation = rulesList[Math.floor(Math.random() * rulesList.length)];
  
  const targetKeyName = calculateTargetKeyName(startKey.name, targetModulation.semitoneOffset);
  const targetScale = getMidiNotesForScale(targetKeyName, targetModulation.type);

  // SAFE EXTRACTION: Use Array.of and distinct local variables to stop the index stripper
  const scaleNotesArray = Array.from(startScale);
  const targetNotesArray = Array.from(targetScale);

  const tonicBase = scaleNotesArray.at(0) || 60;
  const thirdBase = scaleNotesArray.at(2) || 64;
  const fifthBase = scaleNotesArray.at(4) || 67;

  // Extract Home chord configurations safely
  const fI = ALLOWED_CHORDS['I'];
  const bI = restrictNoteToRange((scaleNotesArray.at(fI.bass) || 60) - 12, true);
  const structI = startKey.type === 'major' ? fI.structureMajor : fI.structureMinor;
  const keyChordMidi = [bI, ...structI.map(i => restrictNoteToRange(bI + i, false))];

  const passageNotes: ScheduledNote[] = [];

  const addVoices = (bass: number, upperVoices: number[], timeStr: string, dur: string) => {
    const clampedBass = restrictNoteToRange(bass, true);
    passageNotes.push({ note: midiToNoteName(clampedBass), time: timeStr, duration: dur });
    
    upperVoices.forEach(m => {
      const clampedVoice = restrictNoteToRange(m, false);
      passageNotes.push({ note: midiToNoteName(clampedVoice), time: timeStr, duration: dur });
    });
  };

  // Extract core target chord values
  const fPivot = ALLOWED_CHORDS['IV'];
  const bPivot = (scaleNotesArray.at(fPivot.bass) || 65) - 12;
  const sPivot = startKey.type === 'major' ? fPivot.structureMajor : fPivot.structureMinor;

  const fDom = ALLOWED_CHORDS['V7'];
  const bDom = (targetNotesArray.at(fDom.bass) || 67) - 12;
  const sDom = targetModulation.type === 'major' ? fDom.structureMajor : fDom.structureMinor;

  const fNew = ALLOWED_CHORDS['I'];
  const bNew = (targetNotesArray.at(fNew.bass) || 60) - 12;
  const sNew = targetModulation.type === 'major' ? fNew.structureMajor : fNew.structureMinor;

  const styleStyles = ['walking', 'suspension', 'classical'];
  const chosenStyle = styleStyles[Math.floor(Math.random() * styleStyles.length)];

  if (chosenStyle === 'walking') {
    // 🏃‍♂️ STYLE 1: WALKING BASS LINE
    addVoices(tonicBase - 12, Array.of(tonicBase, thirdBase, fifthBase), "0:0:0", "2n");
    addVoices(tonicBase - 14, Array.of(tonicBase, thirdBase + 12, fifthBase + 12), "0:2:0", "2n");
    
    addVoices(bPivot, sPivot.map(i => bPivot + i), "1:0:0", "2n");
    addVoices(bPivot + 2, Array.of(tonicBase, thirdBase, fifthBase), "1:2:0", "2n");
    
    const targetBassNode = targetNotesArray.at(fDom.bass) || 67;
    const sDom0 = sDom.at(0) || 0;
    const sDom1 = sDom.at(1) || 4;
    //const sDom2 = sDom.at(2) || 7;
    
    addVoices(bDom, Array.of(targetBassNode, bDom + sDom0, bDom + sDom1), "2:0:0", "4n");
    addVoices(bDom + 2, Array.of(targetBassNode, bDom + sDom0, bDom + sDom1), "2:1:0", "4n");
    addVoices(bDom, sDom.map(i => bDom + i), "2:2:0", "2n");
  } 
  else if (chosenStyle === 'suspension') {
    // ⏳ STYLE 2: THE SYNCOPATED SUSPENSION
    addVoices(tonicBase - 12, Array.of(tonicBase, thirdBase, fifthBase), "0:0:0", "2n");
    addVoices(tonicBase - 12, Array.of(tonicBase, thirdBase + 12, fifthBase + 12), "0:2:0", "2n");
    
    addVoices(bPivot, Array.of(tonicBase, thirdBase, tonicBase + 12), "1:0:0", "4n");
    addVoices(bPivot, sPivot.map(i => bPivot + i), "1:1:0", "2n");
    addVoices(tonicBase - 12, Array.of(tonicBase, thirdBase, fifthBase), "1:2:0", "4n");
    
    addVoices(bDom, sDom.map(i => bDom + i), "2:0:0", "2n");
    addVoices(bDom, sDom.map(i => bDom + i), "2:2:0", "2n");
  }
  else {
    // 🎹 STYLE 3: ELEGANT CLASSICAL PULSE
    addVoices(tonicBase - 12, Array.of(tonicBase, thirdBase, fifthBase), "0:0:0", "2n");
    addVoices(tonicBase - 12, Array.of(tonicBase, thirdBase + 12, fifthBase + 12), "0:2:0", "2n");
    
    addVoices(bPivot, sPivot.map(i => bPivot + i), "1:0:0", "4n");
    addVoices(bPivot, sPivot.map(i => bPivot + i), "1:1:0", "4n");
    addVoices(tonicBase - 12, Array.of(tonicBase, thirdBase, fifthBase), "1:2:0", "2n");
    
    addVoices(bDom, sDom.map(i => bDom + i), "2:0:0", "2n");
    const invBassNode = targetNotesArray.at(fDom.bass) || 67;
    addVoices(invBassNode - 12, sDom.map(i => bDom + i), "2:2:0", "2n");
  }

  // --- BAR 4: Resolution ---
  addVoices(bNew, sNew.map(i => bNew + i), "3:0:0", "1m");

  return {
    startKey,
    targetModulation,
    targetKeyName,
    keyChordMidi,
    passageNotes
  };
}
