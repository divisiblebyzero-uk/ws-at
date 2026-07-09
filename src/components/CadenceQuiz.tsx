import React, { useState, useEffect } from 'react';
import { generateQuestion, type GeneratedQuestion } from '../utils/generator';
import { playCadenceProgression, playChord, stopAllAudio } from '../utils/audioPlayer';

interface CadenceQuizProps {
  onBackToMenu: () => void;
}

export const CadenceQuiz: React.FC<CadenceQuizProps> = ({ onBackToMenu }) => {
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [selectedCadence, setSelectedCadence] = useState<string>('');
  const [selectedChords, setSelectedChords] = useState<string[]>(['', '', '']);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  // Syllabus and difficulty toggle switches
  const [isLegacySyllabus, setIsLegacySyllabus] = useState<boolean>(false);
  const [isEasyMode, setIsEasyMode] = useState<boolean>(false);

  // Generate question when component loads or when Easy Mode changes
  useEffect(() => {
    handleNextQuestion();
    return () => stopAllAudio();
  }, [isEasyMode]);

  const handleNextQuestion = () => {
    stopAllAudio();
    const newQuestion = generateQuestion(isEasyMode);
    setQuestion(newQuestion);
    setSelectedCadence('');
    setSelectedChords(['', '', '']);
    setHasChecked(false);
    setFeedback(null);
  };

  const handlePlayFullProgression = () => {
    if (!question) return;
    playCadenceProgression(question.keyChordMidi, question.progressionMidi);
  };

  const handlePlayKeyChordOnly = () => {
    if (!question) return;
    playChord(question.keyChordMidi, '1n');
  };

  const handlePlayIndividualChord = (index: number) => {
    if (!question) return;
    playChord(question.progressionMidi[index], '1n');
  };

  const handleChordSelection = (chordIndex: number, val: string) => {
    const updated = [...selectedChords];
    updated[chordIndex] = val;
    setSelectedChords(updated);
  };

  const handleCheckAnswer = () => {
    if (!question) return;

    // 1. Check Cadence Name
    const cadenceIsCorrect = selectedCadence.toLowerCase() === question.cadenceType.toLowerCase();

    // 2. Check Progression based on selected ABRSM Syllabus settings
    let chordsAreCorrect = false;
    if (isLegacySyllabus) {
      // 2025-2026: Compare with simplified base chords (no inversions allowed)
      chordsAreCorrect = selectedChords.every((chord: string, idx: number) => 
        chord === question.simplifiedSymbols[idx]
      );
    } else {
      // 2027-2028: Compare with exact structural inversions
      chordsAreCorrect = selectedChords.every((chord: string, idx: number) => 
        chord === (isEasyMode ? question.simplifiedSymbols[idx] : question.chordSymbols[idx])
      );
    }

    const isFullyCorrect = cadenceIsCorrect && chordsAreCorrect;

    if (isFullyCorrect) {
      setScore(prev => prev + 1);
      setFeedback({ isCorrect: true, message: 'Excellent! Perfect tracking of the chord progression.' });
    } else {
      const correctAnswers = isLegacySyllabus || isEasyMode ? question.simplifiedSymbols : question.chordSymbols;
      let msg = `Incorrect. The correct cadence was ${question.cadenceType}. `;
      msg += `The progression was: ${correctAnswers.join(' — ')}.`;
      setFeedback({ isCorrect: false, message: msg });
    }

    setTotalQuestions(prev => prev + 1);
    setHasChecked(true);
  };

  if (!question) return <div style={styles.container}>Loading Test Engine...</div>;

  const cadenceOptions = ['Perfect', 'Imperfect', 'Plagal', 'Interrupted'];
  
  // Conditionally populate dropdown lists to match active exam frameworks
  const legacyChords = ['I', 'II', 'IV', 'V', 'V7', 'VI'];
  const fullChordsList = ['I', 'Ib', 'Ic', 'II', 'IIb', 'IV', 'V', 'Vb', 'Vc', 'V7', 'VI'];
  const availableDropdownChords = (isLegacySyllabus || isEasyMode) ? legacyChords : fullChordsList;

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <div style={styles.header}>
        <button onClick={onBackToMenu} style={styles.backBtn}>← Menu</button>
        <h2 style={styles.title}>Cadence Trainer (Grade 8)</h2>
        <div style={styles.score}>Score: {score}/{totalQuestions}</div>
      </div>

      {/* Config Switches Panel Card */}
      <div style={styles.card}>
        <div style={styles.toggleRow}>
          <label style={styles.toggleLabel}>
            <input 
              type="checkbox" 
              checked={isLegacySyllabus} 
              onChange={(e) => {
                setIsLegacySyllabus(e.target.checked);
                setSelectedChords(['', '', '']);
              }}
              style={styles.checkbox}
            />
            2025–2026 Syllabus (No Inversions)
          </label>
        </div>
        <div style={styles.toggleRow}>
          <label style={styles.toggleLabel}>
            <input 
              type="checkbox" 
              checked={isEasyMode} 
              onChange={(e) => {
                setIsEasyMode(e.target.checked);
                setSelectedChords(['', '', '']);
              }}
              style={styles.checkbox}
            />
            Easy Mode (Force Root Position Audio)
          </label>
        </div>
      </div>

      {/* Main Playback Audio Controls Card */}
      <div style={styles.card}>
        <h3 style={styles.subtitle}>Current Key: {question.key.name} {question.key.type}</h3>
        
        <div style={styles.buttonGroup}>
          <button onClick={handlePlayKeyChordOnly} style={styles.audioBtn}>🎹 Play Key-Chord</button>
          <button onClick={handlePlayFullProgression} style={styles.primaryAudioBtn}>▶ Play Full Sequence</button>
        </div>

        <div style={styles.individualPlaySection}>
          <p style={styles.sectionLabel}>Play Individual Chords:</p>
          <div style={styles.row}>
            {[0, 1, 2].map((idx: number) => (
              <button key={idx} onClick={() => handlePlayIndividualChord(idx)} style={styles.smallAudioBtn}>
                Chord {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Selection Card */}
      <div style={styles.card}>
        <h4 style={styles.inputTitle}>1. Identify the Cadence Type</h4>
        <div style={styles.grid}>
          {cadenceOptions.map((opt: string) => (
            <button
              key={opt}
              onClick={() => !hasChecked && setSelectedCadence(opt)}
              style={{
                ...styles.selectorBtn,
                backgroundColor: selectedCadence === opt ? '#3b82f6' : '#f3f4f6',
                color: selectedCadence === opt ? '#ffffff' : '#1f2937'
              }}
              disabled={hasChecked}
            >
              {opt}
            </button>
          ))}
        </div>

        <h4 style={styles.inputTitle}>
          2. Identify the Three Chords ({isLegacySyllabus ? "Chord Types" : "Including Positions"})
        </h4>
        <div style={styles.chordSelectorsRow}>
          {[0, 1, 2].map((chordIdx: number) => (
            <div key={chordIdx} style={styles.chordCol}>
              <label style={styles.chordLabel}>Chord {chordIdx + 1}</label>
              <select
                value={selectedChords[chordIdx]}
                onChange={(e) => handleChordSelection(chordIdx, e.target.value)}
                disabled={hasChecked}
                style={styles.dropdown}
              >
                <option value="">Select...</option>
                {availableDropdownChords.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {!hasChecked ? (
          <button 
            onClick={handleCheckAnswer} 
            disabled={!selectedCadence || selectedChords.some((c: string) => c === '')} 
            style={styles.actionBtn}
          >
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNextQuestion} style={styles.nextBtn}>
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
  title: { fontSize: '18px', margin: 0, fontWeight: 'bold' },
  score: { fontSize: '14px', background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px' },
  card: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  toggleRow: { display: 'flex', alignItems: 'center', margin: '6px 0' },
  toggleLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer', fontWeight: '500' },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer' },
  subtitle: { margin: '0 0 16px 0', fontSize: '16px', textAlign: 'center' },
  buttonGroup: { display: 'flex', gap: '12px', marginBottom: '16px' },
  audioBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
primaryAudioBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#059669', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },individualPlaySection: { borderTop: '1px solid #f3f4f6', paddingTop: '12px' },sectionLabel: { margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280' },row: { display: 'flex', gap: '8px' },smallAudioBtn: { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '12px', cursor: 'pointer' },inputTitle: { fontSize: '14px', margin: '0 0 10px 0', color: '#374151' },grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' },selectorBtn: { padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' },chordSelectorsRow: { display: 'flex', gap: '12px', marginBottom: '24px' },chordCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },chordLabel: { fontSize: '12px', color: '#6b7280' },dropdown: { padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', background: '#fff' },actionBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: '600', fontSize: '15px', cursor: 'pointer' },nextBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', background: '#1f2937', color: '#fff', fontWeight: '600', fontSize: '15px', cursor: 'pointer' },feedbackBanner: { padding: '14px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', lineHeight: '1.4', textAlign: 'center' }};