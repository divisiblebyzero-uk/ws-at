import React, { useState, useEffect } from 'react';
import { generateQuestion, type GeneratedQuestion } from '../utils/generator';
import { playCadenceProgression, playChord, stopAllAudio } from '../utils/audioPlayer';
import * as Tone from 'tone';

interface CadenceQuizProps {
  grade: number;
  onBackToMenu: () => void;
}

export const CadenceQuiz: React.FC<CadenceQuizProps> = ({ grade, onBackToMenu }) => {
  const [easyMode, setEasyMode] = useState<boolean>(false);
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [selectedCadence, setSelectedCadence] = useState<string>('');

  // Safe initial state setup that instantly respects the selected grade level
  const [selectedChords, setSelectedChords] = useState<string[]>(() =>
    grade === 6 || grade === 7 ? Array.of('', '') : Array.of('', '', '')
  );

  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // Triggered cleanly only when structural dependencies change, preventing infinite loops
  useEffect(() => {
    handleNextQuestion(easyMode);
    return () => stopAllAudio();
  }, [easyMode, grade]);

  const handleNextQuestion = (currentEasyModeSetting: boolean = easyMode) => {
    stopAllAudio();
    const newQuestion = generateQuestion(currentEasyModeSetting, grade);
    setQuestion(newQuestion);
    setSelectedCadence('');

    // Reset chord fields safely inside an isolated event hook
    setSelectedChords(grade === 6 || grade === 7 ? Array.of('', '') : Array.of('', '', ''));
    setHasChecked(false);
    setFeedback(null);
  };

  const handlePlayFullProgression = async () => {
    if (!question) return;
    await Tone.getContext().resume();
    playCadenceProgression(question.keyChordMidi, question.progressionMidi);
  };

  const handlePlayKeyChordOnly = async () => {
    if (!question) return;
    await Tone.getContext().resume();
    playChord(question.keyChordMidi, '1n');
  };

  const handlePlayIndividualChord = async (index: number) => {
    if (!question) return;
    await Tone.getContext().resume();
    playChord(question.progressionMidi[index], '1n');
  };

  const handleChordSelection = (chordIndex: number, val: string) => {
    const updated = [...selectedChords];
    updated[chordIndex] = val;
    setSelectedChords(updated);
  };

  const handleCheckAnswer = () => {
    if (!question) return;

    const cadenceIsCorrect = selectedCadence.toLowerCase() === question.cadenceType.toLowerCase();
    const chordsAreCorrect = selectedChords.every((chord, idx) => chord === question.chordSymbols[idx]);
    const isFullyCorrect = cadenceIsCorrect && chordsAreCorrect;

    if (isFullyCorrect) {
      setScore(prev => prev + 1);
      setFeedback({ isCorrect: true, message: 'Excellent! Perfect tracking of both the cadence and positions.' });
    } else {
      let msg = `Incorrect. The correct cadence was ${question.cadenceType}. `;
      msg += `The progression was: ${question.chordSymbols.join(' — ')}.`;
      setFeedback({ isCorrect: false, message: msg });
    }

    setTotalQuestions(prev => prev + 1);
    setHasChecked(true);
  };

  if (!question) return <div style={styles.container}>Loading Test Engine...</div>;

  // Options configuration sets mapped safely as simple local template variables
  const chordIndexes: number[] = grade === 6 || grade === 7 ? Array.of(0, 1) : Array.of(0, 1, 2);

  const cadenceOptions = grade === 6
    ? Array.of('Perfect', 'Imperfect')
    : grade === 7
      ? Array.of('Perfect', 'Imperfect', 'Interrupted')
      : Array.of('Perfect', 'Imperfect', 'Plagal', 'Interrupted');

  const grade6And7ChordsList = Array.of('I', 'IV', 'V', 'V7', 'VI');
  const grade8ChordsList = easyMode
    ? Array.of('I', 'II', 'IV', 'V', 'VI')
    : Array.of('I', 'Ib', 'Ic', 'II', 'IIb', 'IV', 'V', 'Vb', 'Vc', 'V7', 'VI');

  const activeChordsList = grade === 6 || grade === 7 ? grade6And7ChordsList : grade8ChordsList;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          type="button" // Fixes mobile click tracking bubbles
          onClick={(e) => {
            e.preventDefault(); // Blocks event bubbling to Android OS
            stopAllAudio();
            onBackToMenu();
          }}
          style={styles.backBtn}
        >
          ← Menu
        </button>
        <h2 style={styles.title}>Cadence Quiz (Grade {grade})</h2>
        <div style={styles.score}>Score: {score}/{totalQuestions}</div>
      </div>

      {grade === 8 && (
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>🎹 Easy Mode (Root Chords Only)</span>
          <input
            type="checkbox"
            checked={easyMode}
            onChange={(e) => setEasyMode(e.target.checked)}
            style={styles.checkboxInput}
          />
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Current Key: {question.key.name} {question.key.type}</h3>

        <div style={styles.buttonGroup}>
          <button onClick={handlePlayKeyChordOnly} style={styles.audioBtn}>🎹 Play Key-Chord</button>
          <button onClick={handlePlayFullProgression} style={styles.primaryAudioBtn}>▶ Play Full Sequence</button>
        </div>

        <div style={styles.individualPlaySection}>
          <p style={styles.sectionLabel}>Play Individual Chords:</p>
          <div style={styles.row}>
            {chordIndexes.map((idx: number) => (
              <button key={idx} onClick={() => handlePlayIndividualChord(idx)} style={styles.smallAudioBtn}>
                Chord {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h4 style={styles.inputTitle}>1. Identify the Cadence Type</h4>
        <div style={styles.grid}>
          {cadenceOptions.map(opt => (
            <button
              key={opt}
              onClick={() => !hasChecked && setSelectedCadence(opt)}
              style={{
                ...styles.selectorBtn,
                backgroundColor: selectedCadence === opt ? '#2563eb' : '#f3f4f6',
                color: selectedCadence === opt ? '#ffffff' : '#1f2937'
              }}
              disabled={hasChecked}
            >
              {opt}
            </button>
          ))}
        </div>

        <h4 style={styles.inputTitle}>2. Identify the Chords</h4>
        <div style={styles.chordSelectorsRow}>
          {chordIndexes.map((chordIdx: number) => (
            <div key={chordIdx} style={styles.chordCol}>
              <label style={styles.chordLabel}>Chord {chordIdx + 1}</label>
              <select
                value={selectedChords[chordIdx] || ''}
                onChange={(e) => handleChordSelection(chordIdx, e.target.value)}
                disabled={hasChecked}
                style={styles.dropdown}
              >
                <option value="">...</option>
                {activeChordsList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {!hasChecked ? (
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedCadence || selectedChords.some(c => c === '')}
            style={styles.actionBtn}
          >
            Submit Answer
          </button>
        ) : (
          <button onClick={() => handleNextQuestion(easyMode)} style={styles.nextBtn}>
            Next Question →
          </button>
        )}
      </div>

      {feedback && (
        <div style={{
          ...styles.feedbackBanner,
          backgroundColor: feedback.isCorrect ? '#def7ec' : '#fde8e8',
          color: feedback.isCorrect ? '#03543f' : '#9b1c1c'
        }}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};
const styles: Record<string, React.CSSProperties> = {
  container: { padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { background: 'none', border: 'none', color: '#2563eb', fontSize: '16px', cursor: 'pointer' },
  title: { fontSize: '18px', margin: 0, fontWeight: 'bold', color: '#111827' },
  score: { fontSize: '14px', background: '#e5e7eb', color: '#1f2937', padding: '4px 8px', borderRadius: '4px' },
  card: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  subtitle: { margin: '0 0 16px 0', fontSize: '16px', textAlign: 'center', color: '#1f2937' },
  toggleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fef3c7',
    border: '1px solid #fde68a',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '14px',
    boxSizing: 'border-box',
    width: '100%'
  },
  toggleLabel: { fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  buttonGroup: { display: 'flex', gap: '12px', marginBottom: '16px' },

  audioBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#ffffff', color: '#1f2937', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  primaryAudioBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#059669', color: '#ffffff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  individualPlaySection: { borderTop: '1px solid #f3f4f6', paddingTop: '12px' }, sectionLabel: { margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280' },
  row: { display: 'flex', gap: '8px' },
  smallAudioBtn: { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', background: '#f9fafb', color: '#374151', fontSize: '12px', cursor: 'pointer' },
  inputTitle: { fontSize: '14px', margin: '0 0 10px 0', color: '#374151', fontWeight: '600' }, grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' },
  selectorBtn: { padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }, chordSelectorsRow: { display: 'flex', gap: '12px', marginBottom: '24px' },
  chordCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }, chordLabel: { fontSize: '12px', color: '#6b7280' },
  dropdown: { padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', background: '#ffffff', color: '#1f2937' },
  actionBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontWeight: '600', fontSize: '15px', cursor: 'pointer' },
  nextBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', background: '#1f2937', color: '#ffffff', fontWeight: '600', fontSize: '15px', cursor: 'pointer' },
  feedbackBanner: { padding: '14px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', lineHeight: '1.4', textAlign: 'center' }
};