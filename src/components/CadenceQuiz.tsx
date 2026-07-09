import React, { useState, useEffect } from 'react';
import * as Tone from 'tone'; // Correct import path for the Tone audio instance
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

  // Syllabus Configuration Settings
  const [isLegacySyllabus, setIsLegacySyllabus] = useState<boolean>(false); // True = 2025-2026 mode (No inversions checked)
  const [isEasyMode, setIsEasyMode] = useState<boolean>(false); // True = Restricts playback strictly to root position

  // Load a random question sequence immediately when entering the view
  useEffect(() => {
    handleNextQuestion();
    return () => stopAllAudio(); // Safety clean-up if user leaves mid-playback
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

  const handlePlayFullProgression = async () => {
    if (!question) return;
    // Crucial for Mobile: Wakes up the mobile device audio engine on user interaction
    await Tone.start(); 
    playCadenceProgression(question.keyChordMidi, question.progressionMidi);
  };

  const handlePlayKeyChordOnly = async () => {
    if (!question) return;
    await Tone.start();
    playChord(question.keyChordMidi, '1n');
  };

  const handlePlayIndividualChord = async (index: number) => {
    if (!question) return;
    await Tone.start();
    playChord(question.progressionMidi[index], '1n');
  };

  const handleChordSelection = (chordIndex: number, val: string) => {
    const updated = [...selectedChords];
    updated[chordIndex] = val;
    setSelectedChords(updated);
  };

  const handleCheckAnswer = () => {
    if (!question) return;

    // Check Part 1: Cadence Name Identification
    const cadenceIsCorrect = selectedCadence.toLowerCase() === question.cadenceType.toLowerCase();

    // Check Part 2: Chord Tracking (Switches target array evaluation depending on Syllabus setting)
    const targetSolutionSymbols = isLegacySyllabus ? question.simplifiedSymbols : question.chordSymbols;
    const chordsAreCorrect = selectedChords.every((chord, idx) => chord === targetSolutionSymbols[idx]);

    const isFullyCorrect = cadenceIsCorrect && chordsAreCorrect;

    if (isFullyCorrect) {
      setScore(prev => prev + 1);
      setFeedback({ isCorrect: true, message: 'Excellent! Perfect tracking of both the cadence and chord forms.' });
    } else {
      let msg = `Incorrect. The correct cadence was ${question.cadenceType}. `;
      msg += `The progression was: ${targetSolutionSymbols.join(' — ')}.`;
      setFeedback({ isCorrect: false, message: msg });
    }

    setTotalQuestions(prev => prev + 1);
    setHasChecked(true);
  };

  if (!question) return <div style={styles.container}>Loading Test Engine...</div>;

  const cadenceOptions = ['Perfect', 'Imperfect', 'Plagal', 'Interrupted'];
  
  // Conditionally populate the active list based on selection requirements
  const grade8ChordsList = isLegacySyllabus
    ? ['I', 'II', 'IV', 'V', 'V7', 'VI'] // 2025-2026 Core Triads
    : ['I', 'Ib', 'Ic', 'II', 'IIb', 'IV', 'V', 'Vb', 'Vc', 'V7', 'VI']; // 2027-2028 Full Positions

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <div style={styles.header}>
        <button onClick={onBackToMenu} style={styles.backBtn}>← Menu</button>
        <h2 style={styles.title}>Cadence Trainer (Grade 8)</h2>
        <div style={styles.score}>Score: {score}/{totalQuestions}</div>
      </div>

      {/* Mode Selector Options Panel */}
      <div style={styles.card}>
        <div style={styles.toggleRow}>
          <label style={styles.toggleLabel}>
            <input 
              type="checkbox" 
              checked={isLegacySyllabus} 
              onChange={(e) => {
                setIsLegacySyllabus(e.target.checked);
                setSelectedChords(['', '', '']); // Wipe selections to match new parameters
              }} 
              disabled={hasChecked}
            />
            2025-2026 Syllabus Mode (Skip Inversions)
          </label>
        </div>
        <div style={styles.toggleRow}>
          <label style={styles.toggleLabel}>
            <input 
              type="checkbox" 
              checked={isEasyMode} 
              onChange={(e) => setIsEasyMode(e.target.checked)} 
              disabled={hasChecked}
            />
            Easy Mode (Force All Chords to Root Position)
          </label>
        </div>
      </div>

      {/* Main Control Panel Card */}
      <div style={styles.card}>
        <h3 style={styles.subtitle}>Current Key: {question.key.name} {question.key.type}</h3>
        
        <div style={styles.buttonGroup}>
          <button onClick={handlePlayKeyChordOnly} style={styles.audioBtn}>🎹 Play Key-Chord</button>
          <button onClick={handlePlayFullProgression} style={styles.primaryAudioBtn}>▶ Play Full Sequence</button>
        </div>

        {/* Syllabus Part (iii): Individual Testing Grid */}
        <div style={styles.individualPlaySection}>
          <p style={styles.sectionLabel}>Play Individual Chords:</p>
          <div style={styles.row}>
            <button onClick={() => handlePlayIndividualChord(0)} style={styles.smallAudioBtn}>Chord 1</button>
            <button onClick={() => handlePlayIndividualChord(1)} style={styles.smallAudioBtn}>Chord 2</button>
            <button onClick={() => handlePlayIndividualChord(2)} style={styles.smallAudioBtn}>Chord 3</button>
          </div>
        </div>
      </div>

      {/* Input Form Fields */}
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

        <h4 style={styles.inputTitle}>2. Identify Chords ({isLegacySyllabus ? 'Syllabus Part ii' : 'Syllabus Part iii'})</h4>
        <div style={styles.chordSelectorsRow}>
          {[0, 1, 2].map((chordIdx: number) => (
            <div key={chordIdx} style={styles.chordCol}>
              <label style={styles.chordLabel}>Chord {chordIdx + 1}</label>
              <select
                value={selectedChords[chordIdx]}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChordSelection(chordIdx, e.target.value)}
                disabled={hasChecked}
                style={styles.dropdown}
              >
                <option value="">Select...</option>
                {grade8ChordsList.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Action Button */}
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

      {/* Feedback Banner */}
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
  toggleRow: { marginBottom: '8px' },
  toggleLabel: { fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  buttonGroup: { display: 'flex', gap: '12px', marginBottom: '16px' },

  audioBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#ffffff', color: '#1f2937', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },primaryAudioBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#059669', color: '#ffffff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },individualPlaySection: { borderTop: '1px solid #f3f4f6', paddingTop: '12px' },sectionLabel: { margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280' },row: { display: 'flex', gap: '8px' },smallAudioBtn: { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', background: '#f9fafb', color: '#374151', fontSize: '12px', cursor: 'pointer' },inputTitle: { fontSize: '14px', margin: '0 0 10px 0', color: '#374151', fontWeight: '600' },grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' },selectorBtn: { padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' },chordSelectorsRow: { display: 'flex', gap: '12px', marginBottom: '24px' },chordCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },chordLabel: { fontSize: '12px', color: '#6b7280' },dropdown: { padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', background: '#ffffff', color: '#1f2937' },actionBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontWeight: '600', fontSize: '15px', cursor: 'pointer' },nextBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', background: '#1f2937', color: '#ffffff', fontWeight: '600', fontSize: '15px', cursor: 'pointer' },feedbackBanner: { padding: '14px', borderRadius: '6px', fontSize: '14px', fontWeight: '500', lineHeight: '1.4', textAlign: 'center' }};