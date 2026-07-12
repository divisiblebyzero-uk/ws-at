import React, { useState, useEffect } from 'react';
import { playChord, playCadenceProgression, stopAllAudio } from '../utils/audioPlayer';
import { ALLOWED_CHORDS, CADENCE_TYPES } from '../constants/musicTheory';
import type { KeyType, CadenceName } from '../constants/musicTheory';

interface AudioSandboxProps {
  onBackToMenu: () => void;
}

export const AudioSandbox: React.FC<AudioSandboxProps> = ({ onBackToMenu }) => {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [selectedType, setSelectedType] = useState<KeyType>('major');
  const [playingChordLabel, setPlayingChordLabel] = useState<string>('Tap a chord or cadence below to analyze...');
  const [activeMidiNotes, setActiveMidiNotes] = useState<number[]>([]);

  const keysList: string[] = ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb'];
  const chordOptions: string[] = ['I', 'Ib', 'Ic', 'II', 'IIb', 'IV', 'V', 'Vb', 'Vc', 'V7', 'VI'];
  const cadenceOptions: { key: CadenceName; name: string }[] = [
    { key: 'PERFECT', name: 'Perfect' },
    { key: 'IMPERFECT', name: 'Imperfect' },
    { key: 'PLAGAL', name: 'Plagal' },
    { key: 'INTERRUPTED', name: 'Interrupted' }
  ];

  // FIX: Expand to a full 3-Octave range (36 keys: C3 to B5, MIDI 48 to 83)
  const pianoKeysMidiRange: number[] = Array.from({ length: 36 }, (_, i) => 48 + i);

  useEffect(() => {
    return () => {
      stopAllAudio();
      clearPianoHighlight();
    };
  }, []);

  const clearPianoHighlight = () => {
    setActiveMidiNotes([]);
  };

  const midiToNoteName = (midiNumber: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNumber / 12) - 1;
    return `${notes[midiNumber % 12]}${octave}`;
  };

  /**
   * CORE FIX: Normalises any upper chord voice to stay strictly within Octaves 3 to 5 (MIDI 48 - 83)
   */
  const restrictToOctaveRange = (notesArray: number[]): number[] => {
    return notesArray.map((note: number, idx: number) => {
      let processed = note;
      if (idx === 0) {
        // Bass note: Keep firmly anchored in Octave 3 (MIDI 48 - 59)
        while (processed > 59) processed -= 12;
        while (processed < 48) processed += 12;
      } else {
        // Upper voices: Keep beautifully balanced in Octaves 4 and 5 (MIDI 60 - 83)
        while (processed > 83) processed -= 12;
        while (processed < 60) processed += 12;
      }
      return processed;
    }).sort((a, b) => a - b); // Re-sort notes from lowest to highest for correct visual layout
  };

  const getFunctionalChordLabel = (symbol: string, keyType: KeyType): { symbolText: string; literalName: string } => {
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
    
    const majorScaleSteps: number[] = Array.of(0, 2, 4, 5, 7, 9, 11);
    const minorScaleSteps: number[] = Array.of(0, 2, 3, 5, 7, 8, 11);
    const targetSteps = keyType === 'major' ? majorScaleSteps : minorScaleSteps;
    
    const rootPitchIndex = (baseScaleOffset + targetSteps[formula.degree]) % 12;
    const rootLetter = noteNames[rootPitchIndex];

    let quality = 'Major';
    if (isMinor) quality = 'minor';
    if (isDiminished) quality = 'diminished';
    if (symbol.startsWith('V7')) quality = 'Dominant 7th';

    let invLabel = '';
    if (symbol.endsWith('b')) invLabel = ' (1st Inv)';
    if (symbol.endsWith('c')) invLabel = ' (2nd Inv)';

    return {
      symbolText: outSymbol,
      literalName: `${rootLetter} ${quality}${invLabel}`
    };
  };

  const handlePlayChordType = (symbol: string) => {
    stopAllAudio();
    clearPianoHighlight();

    const offsets: Record<string, number> = { 'C': 0, 'G': 7, 'D': 2, 'A': 9, 'F': 5, 'Bb': 10, 'Eb': 3 };
    const keyCenterMidi = 60 + (offsets[selectedKey] || 0);

    const formula = ALLOWED_CHORDS[symbol];
    if (!formula) return;

    const offsetsArray = selectedType === 'major' ? formula.structureMajor : formula.structureMinor;

    const rawNotes = offsetsArray.map((offset: number) => keyCenterMidi + offset);
    // Apply our brand new safety range normaliser!
    const notes = restrictToOctaveRange(rawNotes);

    const noteLetters = notes.map(midiToNoteName).join(', ');
    const identities = getFunctionalChordLabel(symbol, selectedType);
    setPlayingChordLabel(`Active: ${identities.literalName} [ ${noteLetters} ]`);
    setActiveMidiNotes(notes);

    playChord(notes, '1.5n');
    setTimeout(() => clearPianoHighlight(), 1200);
  };

  const handlePlayCadenceType = (cadenceKey: CadenceName) => {
    stopAllAudio();
    clearPianoHighlight();

    const offsets: Record<string, number> = { 'C': 0, 'G': 7, 'D': 2, 'A': 9, 'F': 5, 'Bb': 10, 'Eb': 3 };
    const keyCenterMidi = 60 + (offsets[selectedKey] || 0);
    const formula = CADENCE_TYPES[cadenceKey];

    const finalChord = formula.finalChords[Math.floor(Math.random() * formula.finalChords.length)];
    const precedingChord = formula.allowedPreceding[Math.floor(Math.random() * formula.allowedPreceding.length)];
    const openingChord = precedingChord !== 'I' ? 'I' : 'Ib';
    const progression = [openingChord, precedingChord, finalChord];
    
    const labels = progression.map(sym => getFunctionalChordLabel(sym, selectedType).symbolText);
    setPlayingChordLabel(`Playing ${formula.name} Cadence Sequence: ${labels.join(' — ')}`);

    const fI = ALLOWED_CHORDS['I'];
    const structI = selectedType === 'major' ? fI.structureMajor : fI.structureMinor;
    const keyChordMidi = restrictToOctaveRange(structI.map((offset: number) => keyCenterMidi + offset));

    const progressionMidi: number[][] = progression.map((symbol: string) => {
      const f = ALLOWED_CHORDS[symbol];
      const offsetsArr = selectedType === 'major' ? f.structureMajor : f.structureMinor;
      return restrictToOctaveRange(offsetsArr.map((offset: number) => keyCenterMidi + offset));
    });

    setActiveMidiNotes(keyChordMidi);
    const keyNotesText = keyChordMidi.map(midiToNoteName).join(', ');
    setPlayingChordLabel(`Key-Chord Tonic Context: [ ${keyNotesText} ]`);

    setTimeout(() => {
      setActiveMidiNotes(progressionMidi[0]);
      const noteStr = progressionMidi[0].map(midiToNoteName).join(', ');
      setPlayingChordLabel(`Cadence Chord 1: ${labels[0]} [ ${noteStr} ]`);
    }, 2800);

    setTimeout(() => {
      setActiveMidiNotes(progressionMidi[1]);
      const noteStr = progressionMidi[1].map(midiToNoteName).join(', ');
      setPlayingChordLabel(`Cadence Chord 2: ${labels[1]} [ ${noteStr} ]`);
    }, 4400);

    setTimeout(() => {
      setActiveMidiNotes(progressionMidi[2]);
      const noteStr = progressionMidi[2].map(midiToNoteName).join(', ');
      setPlayingChordLabel(`Cadence Chord 3: ${labels[2]} [ ${noteStr} ]`);
    }, 6000);

    setTimeout(() => {
      clearPianoHighlight();
      setPlayingChordLabel(`Finished playing ${formula.name} cadence. Ready for next selection.`);
    }, 7600);

    playCadenceProgression(keyChordMidi, progressionMidi);
  };

  const isBlackKey = (midiNumber: number): boolean => {
    const noteIndex = midiNumber % 12;
    return [1, 3, 6, 8, 10].includes(noteIndex);
  };

return (
    <div style={styles.container}>
      {/* Navigation Top Bar */}
      <div style={styles.header}>
        <button onClick={onBackToMenu} style={styles.backBtn}>← Menu</button>
        <h2 style={styles.title}>Aural Audio Sandbox</h2>
      </div>

      {/* Global Key Selection Dropdowns */}
      <div style={styles.card}>
        <h4 style={styles.sectionTitle}>1. Set Global Key Context</h4>
        <div style={styles.selectorRow}>
          <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} style={styles.dropdown}>
            {keysList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as KeyType)} style={styles.dropdown}>
            <option value="major">Major</option>
            <option value="minor">Harmonic Minor</option>
          </select>
        </div>
      </div>

      {/* Dynamic Music Information Readout Banner */}
      <div style={styles.analysisDisplayBox}>
        <div style={styles.analysisIcon}>💡</div>
        <div style={styles.analysisText}>{playingChordLabel}</div>
      </div>

      {/* Dynamic Piano Keyboard Display */}
      <div style={styles.pianoContainer}>
        <div style={styles.pianoKeyboard}>
          {pianoKeysMidiRange.map((midi: number) => {
            const black = isBlackKey(midi);
            const active = activeMidiNotes.includes(midi);
            
            let keyStyle = { ...styles.whiteKey };
            if (black) keyStyle = { ...styles.blackKey };
            if (active) {
              keyStyle.backgroundColor = black ? '#f59e0b' : '#3b82f6';
              keyStyle.borderColor = black ? '#d97706' : '#1d4ed8';
            }

            return (
              <div 
                key={midi} 
                style={keyStyle} 
                title={midiToNoteName(midi)}
              />
            );
          })}
        </div>
      </div>

      {/* Two Column Layout Grid Splitting Chords and Cadences */}
      <div style={styles.splitGrid}>
        {/* Left Side Column: Chord Selection Directory */}
        <div style={styles.card}>
          <h4 style={styles.sectionTitle}>🎹 Chord Directory</h4>
          <p style={styles.desc}>Tap to play chords mapped to active scale degrees:</p>
          <div style={styles.verticalButtonGroup}>
            {chordOptions.map(c => {
                const info = getFunctionalChordLabel(c, selectedType);
                return (
                    <button key={c} onClick={() => handlePlayChordType(c)} style={styles.chordBtn}>
                        <span style={styles.chordSym}>{info.symbolText}</span>
                        {/* FIX: Remove the manual string split and just render the clean literal name */}
                        <span style={styles.chordSubText}>{info.literalName}</span>
                    </button>
                );
                })}
          </div>
        </div>

        {/* Right Side Column: Cadence Execution Library */}
        <div style={styles.card}>
          <h4 style={styles.sectionTitle}>🎼 Cadence Library</h4>
          <p style={styles.desc}>Listen to algorithmic examples resolving to centers:</p>
          <div style={styles.verticalButtonGroup}>
            {cadenceOptions.map(cad => (
              <button key={cad.key} onClick={() => handlePlayCadenceType(cad.key)} style={styles.cadenceBtn}>
                Play {cad.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS Configuration Objects optimized to defy mobile skin color inversions
const styles: Record<string, React.CSSProperties> = {
  container: { padding: '12px', maxWidth: '750px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  backBtn: { background: 'none', border: 'none', color: '#2563eb', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  title: { fontSize: '18px', margin: 0, fontWeight: 'bold', color: '#1f2937' },
  card: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', marginBottom: '14px' },
  analysisDisplayBox: { display: 'flex', alignItems: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '14px' },
  analysisIcon: { fontSize: '20px', marginRight: '10px' },
  analysisText: { fontSize: '13px', color: '#1e40af', fontWeight: '700', lineHeight: '1.4' },
    pianoContainer: { 
    background: '#111827', 
    padding: '16px 8px 6px 8px', 
    borderRadius: '10px', 
    marginBottom: '16px', 
    boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.4)', 
    position: 'relative',
    overflowX: 'auto' // Adds a smooth horizontal swipe on small mobile screens if space is tight
  },
  pianoKeyboard: { 
    display: 'flex', 
    width: '100%', 
    height: '110px', 
    position: 'relative', 
    background: '#111827' 
  },
  whiteKey: { 
    flex: 1, 
    height: '100%', 
    backgroundColor: '#ffffff', 
    border: '1px solid #d1d5db', 
    borderRadius: '0 0 4px 4px', 
    zIndex: 1, 
    transition: 'background-color 0.05s ease' 
  },
  blackKey: { 
    width: '3.2%', // FIX: Reduced from 4.5% to fit the narrower 3-octave grid spacing perfectly
    height: '62%', 
    backgroundColor: '#1f2937', 
    border: '1px solid #000', 
    borderRadius: '0 0 3px 3px', 
    marginLeft: '-1.6%', // FIX: Adjusted alignment margin to center over white key dividers
    marginRight: '-1.6%', 
    zIndex: 2, 
    transition: 'background-color 0.05s ease' 
  },
  sectionTitle: { margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' },
  desc: { fontSize: '12px', color: '#6b7280', margin: '0 0 10px 0' },
  selectorRow: { display: 'flex', gap: '12px' },
  dropdown: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', color: '#1f2937', fontSize: '14px', fontWeight: '600' },
  splitGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  verticalButtonGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  chordBtn: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px', background: '#f9fafb', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' },
  chordSym: { fontWeight: 'bold', fontSize: '15px', color: '#2563eb', minWidth: '35px' },
  chordSubText: { fontSize: '11px', color: '#6b7280', fontWeight: '500' },
  cadenceBtn: { padding: '14px 10px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }
};