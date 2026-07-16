import React, { useState, useEffect } from 'react';
import { playChord, stopAllAudio } from '../utils/audioPlayer';
import { ALLOWED_CHORDS, type CadenceName, type KeyType } from '../constants/musicTheory';
import { clampSandboxNotes, midiToNoteName, getFunctionalChordLabel, buildCadenceProgressionData } from '../utils/sandboxEngine';

interface AudioSandboxProps {
  onBackToMenu: () => void;
}

export const AudioSandbox: React.FC<AudioSandboxProps> = ({ onBackToMenu }) => {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [selectedType, setSelectedType] = useState<KeyType>('major');
  const [showSelectorPanel, setShowSelectorPanel] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [activeTimeoutIds, setActiveTimeoutIds] = useState<number[]>([]);
  const [playingChordLabel, setPlayingChordLabel] = useState<string>('Select a card to play individual structures.');

  useEffect(() => {
    return () => {
      stopAllAudio();
      activeTimeoutIds.forEach(id => window.clearTimeout(id));
    };
  }, [activeTimeoutIds]);

  const handlePlayChordType = (symbol: string) => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    stopAllAudio();

    const offsets: Record<string, number> = { 'C': 0, 'G': 7, 'D': 2, 'A': 9, 'F': 5, 'Bb': 10, 'Eb': 3 };
    const keyCenterMidi = 60 + (offsets[selectedKey] || 0);
    const formula = ALLOWED_CHORDS[symbol];
    if (!formula) {
      setIsAudioPlaying(false);
      return;
    }

    const offsetsArray = selectedType === 'major' ? formula.structureMajor : formula.structureMinor;
    const notes = clampSandboxNotes(offsetsArray.map((offset: number) => keyCenterMidi + offset));
    const identities = getFunctionalChordLabel(symbol, selectedType, selectedKey);

    setPlayingChordLabel(`Active: ${identities.literalName} [ ${notes.map(midiToNoteName).join(', ')} ]`);
    playChord(notes, '1.5n');

    const tId = window.setTimeout(() => setIsAudioPlaying(false), 1500);
    setActiveTimeoutIds(prev => [...prev, tId]);
  };

  const handlePlayCadenceType = (cadenceKey: CadenceName) => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    stopAllAudio();

    const offsets: Record<string, number> = { 'C': 0, 'G': 7, 'D': 2, 'A': 9, 'F': 5, 'Bb': 10, 'Eb': 3 };
    const keyCenterMidi = 60 + (offsets[selectedKey] || 0);

    const data = buildCadenceProgressionData(cadenceKey, keyCenterMidi, selectedType);

    const sym1 = data.progression.at(0) || 'I';
    const sym2 = data.progression.at(1) || 'V';
    const sym3 = data.progression.at(2) || 'I';

    const name1 = getFunctionalChordLabel(sym1, selectedType, selectedKey).literalName;
    const name2 = getFunctionalChordLabel(sym2, selectedType, selectedKey).literalName;
    const name3 = getFunctionalChordLabel(sym3, selectedType, selectedKey).literalName;
    const chainLabel = `${name1} — ${name2} — ${name3}`;

    activeTimeoutIds.forEach(id => window.clearTimeout(id));
    const newTimeouts: number[] = [];

    setPlayingChordLabel(`Key-Chord Context Reference Tonic playing...`);
    playChord(data.keyChordMidi, '1n');

    const t1 = window.setTimeout(() => {
      setPlayingChordLabel(`Chord 1: ${name1} in [ ${chainLabel} ]`);
      playChord(data.chord1Midi, '1n');
    }, 2400);
    newTimeouts.push(t1);

    const t2 = window.setTimeout(() => {
      setPlayingChordLabel(`Chord 2: ${name2} in [ ${chainLabel} ]`);
      playChord(data.chord2Midi, '1n');
    }, 4200);
    newTimeouts.push(t2);

    const t3 = window.setTimeout(() => {
      setPlayingChordLabel(`Chord 3: ${name3} in [ ${chainLabel} ]`);
      playChord(data.chord3Midi, '1n');
    }, 6000);
    newTimeouts.push(t3);

    const tEnd = window.setTimeout(() => {
      setPlayingChordLabel(`Finished playing ${data.formula.name} cadence layout loop.`);
      setIsAudioPlaying(false);
    }, 7800);
    newTimeouts.push(tEnd);

    setActiveTimeoutIds(newTimeouts);
  };

  const keysList = ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb'];
  const chordOptions = ['I', 'Ib', 'Ic', 'II', 'IIb', 'IV', 'V', 'Vb', 'Vc', 'V7', 'VI'];
  const cadenceOptions: { key: CadenceName; name: string }[] = [
    { key: 'PERFECT', name: 'Perfect' }, { key: 'IMPERFECT', name: 'Imperfect' },
    { key: 'PLAGAL', name: 'Plagal' }, { key: 'INTERRUPTED', name: 'Interrupted' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.compactHeaderRow}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            stopAllAudio();
            onBackToMenu();
          }}
          style={styles.backBtn}
        >
          ← Menu
        </button>
        <button onClick={() => setShowSelectorPanel(!showSelectorPanel)} style={styles.keyContextPill}>
          🔑 Key: <span style={styles.pillHighlightText}>{selectedKey} {selectedType === 'major' ? 'Maj' : 'Min'}</span> ▾
        </button>
        <h2 style={styles.sandboxTitleText}>Sandbox</h2>
      </div>

      {showSelectorPanel && (
        <div style={styles.dropdownSelectorDeck}>
          <div style={styles.deckLabelRow}>
            <span style={styles.deckTitleHint}>Set Global Key Context:</span>
            <button onClick={() => setShowSelectorPanel(false)} style={styles.closeDeckBtn}>✕ Close</button>
          </div>
          <div style={styles.deckControlRow}>
            <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} style={styles.deckDropdownSelect}>
              {keysList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as any)} style={styles.deckDropdownSelect}>
              <option value="major">Major Scale</option>
              <option value="minor">Harmonic Minor</option>
            </select>
          </div>
        </div>
      )}

      <div style={styles.statusDisplayBarLabel}>{playingChordLabel}</div>

      <div style={styles.columnsWrapper}>
        <div style={styles.columnDeck}>
          <h4 style={styles.columnTitleHeader}>🎹 Chords</h4>
          <div style={styles.buttonStack}>
            {chordOptions.map(symbol => {
              const identities = getFunctionalChordLabel(symbol, selectedType, selectedKey);
              return (
                <button
                  key={symbol}
                  disabled={isAudioPlaying}
                  onClick={() => handlePlayChordType(symbol)}
                  style={{ 
                    ...styles.chordBtn, 
                    opacity: isAudioPlaying ? 0.4 : 1, 
                    cursor: isAudioPlaying ? 'not-allowed' : 'pointer' 
                  }}
                >
                  <span style={styles.btnSymbol}>{identities.symbolText}</span>
                  <span style={styles.btnLiteral}>{identities.literalName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.columnDeck}>
          <h4 style={styles.columnTitleHeader}>🎼 Cadences</h4>
          <div style={styles.buttonStack}>
            {cadenceOptions.map(cadence => (
              <button
                key={cadence.key}
                disabled={isAudioPlaying}
                onClick={() => handlePlayCadenceType(cadence.key)}
                style={{ 
                  ...styles.cadenceAudioBtn, 
                  opacity: isAudioPlaying ? 0.4 : 1, 
                  cursor: isAudioPlaying ? 'not-allowed' : 'pointer' 
                }}
              >
                Play {cadence.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


const styles: Record<string, React.CSSProperties> = {
  container: { 
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'var(--bg-main)',
    minHeight: '100vh',
    padding: '12px 14px', 
    maxWidth: '460px', 
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif' 
  },
  compactHeaderRow: { 
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '14px', 
    width: '100%' 
  },
  backBtn: { 
    padding: '6px 12px',
    borderRadius: '16px',
    border: '1px solid #cbd5e1',
    backgroundColor: 'var(--bg-card)',
    color: '#2563eb', 
    fontSize: '13px', 
    fontWeight: '600', 
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  sandboxTitleText: { 
    fontSize: '18px', 
    fontWeight: '800', 
    color: 'var(--text-main)', 
    margin: 0,
    letterSpacing: '-0.025em'
  },
  keyContextPill: { 
    backgroundColor: 'var(--btn-selector)', 
    border: '1px solid #cbd5e1', 
    color: 'var(--text-main)', 
    borderRadius: '9999px', 
    padding: '6px 14px', 
    fontSize: '13px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    display: 'inline-flex', 
    alignItems: 'center' 
  },
  pillHighlightText: { 
    color: '#2563eb', 
    marginLeft: '4px', 
    textTransform: 'capitalize' 
  },
  dropdownSelectorDeck: { 
    backgroundColor: 'var(--bg-card)', 
    border: '1px solid #cbd5e1', 
    borderRadius: '12px', 
    padding: '14px', 
    marginBottom: '12px', 
    boxShadow: 'var(--card-shadow)' 
  },
  deckLabelRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '8px' 
  },
  deckTitleHint: { 
    fontSize: '12px', 
    fontWeight: '700', 
    color: 'var(--text-muted)' 
  },
  closeDeckBtn: { 
    background: 'none', 
    border: 'none', 
    color: 'var(--text-muted)', 
    fontSize: '11px', 
    fontWeight: '600',
    cursor: 'pointer'
  },
  deckControlRow: { 
    display: 'flex', 
    gap: '10px', 
    width: '100%' 
  },
  deckDropdownSelect: { 
    flex: 1, 
    padding: '10px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    background: 'var(--btn-selector)', 
    color: 'var(--text-main)', 
    fontSize: '14px', 
    fontWeight: '600' 
  },
  statusDisplayBarLabel: { 
    backgroundColor: 'var(--btn-selector)', 
    border: '1px solid #cbd5e1', 
    borderRadius: '8px', 
    padding: '10px 12px', 
    fontSize: '13px', 
    color: 'var(--text-main)', 
    textAlign: 'center', 
    marginBottom: '12px', 
    fontWeight: '600',
    lineHeight: '1.4'
  },
  columnsWrapper: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '12px' 
  },
  columnDeck: { 
    display: 'flex', 
    flexDirection: 'column' 
  },
  columnTitleHeader: { 
    fontSize: '13px', 
    margin: '0 0 10px 0', 
    color: 'var(--text-muted)', 
    fontWeight: '700', 
    textAlign: 'center', 
    borderBottom: '1px solid var(--border-element)', 
    paddingBottom: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  },
  buttonStack: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px' 
  },
  chordBtn: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '10px 12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    backgroundColor: 'var(--bg-card)', 
    cursor: 'pointer', 
    textAlign: 'left' as const,
    boxShadow: 'var(--card-shadow)'
  },
  btnSymbol: { 
    fontWeight: '700', 
    color: '#2563eb', 
    fontSize: '14px' 
  },
  btnLiteral: { 
    fontSize: '12px', 
    color: 'var(--text-muted)', // FIX: Changed from dark gray (#6b7280) to dynamic muted text
    fontWeight: '600' 
  },
  cadenceAudioBtn: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: 'none', 
    backgroundColor: '#2563eb', 
    color: '#ffffff', 
    fontSize: '14px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
  }
};
