import React, { useState, useEffect } from 'react';
import { generateModulationQuestion, type ModulationQuestion } from '../utils/modulationGenerator';
import { playCadenceProgression, playChord, stopAllAudio } from '../utils/audioPlayer';
import * as Tone from 'tone';

interface ModulationQuizProps {
  onBackToMenu: () => void;
}

export const ModulationQuiz: React.FC<ModulationQuizProps> = ({ onBackToMenu }) => {
  const [phase, setPhase] = useState<'majorStart' | 'minorStart'>('majorStart');
  const [question, setQuestion] = useState<ModulationQuestion | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<string>('');
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadNewQuestion();
    return () => stopAllAudio();
  }, [phase]);

  const loadNewQuestion = () => {
    stopAllAudio();
    setQuestion(generateModulationQuestion(phase));
    setSelectedGuess('');
    setHasChecked(false);
    setFeedback(null);
  };

  const handlePlayFullPassage = async () => {
    if (!question) return;
    await Tone.getContext().resume();
    // Reuses our cadence playback system to play Key-Chord followed by the 4-chord sequence
    playCadenceProgression(question.keyChordMidi, question.passageMidi);
  };

  const handlePlayKeyChord = async () => {
    if (!question) return;
    await Tone.getContext().resume();
    playChord(question.keyChordMidi, '1n');
  };

  const handleVerifyAnswer = () => {
    if (!question) return;
    const isCorrect = selectedGuess.toLowerCase() === question.targetModulation.name.toLowerCase();
    
    if (isCorrect) {
      setFeedback(`✅ Correct! The passage modulated cleanly to the ${question.targetModulation.name} (${question.targetKeyName} ${question.targetModulation.type}).`);
    } else {
      setFeedback(`❌ Incorrect. The passage modulated to the ${question.targetModulation.name}. New key: ${question.targetKeyName} ${question.targetModulation.type}.`);
    }
    setHasChecked(true);
  };

  const handleNextPhase = () => {
    if (phase === 'majorStart') {
      setPhase('minorStart'); // Step to part 2 of the syllabus requirements
    } else {
      setPhase('majorStart'); // Reset loop back to start
    }
  };

  if (!question) return <div style={styles.container}>Loading Modulation Engine...</div>;

  const options = phase === 'majorStart' 
    ? ['Dominant', 'Subdominant', 'Relative Minor'] 
    : ['Dominant', 'Subdominant', 'Relative Major'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBackToMenu} style={styles.backBtn}>← Menu</button>
        <h2 style={styles.title}>Modulation Trainer (Grade 8)</h2>
        <div style={styles.phaseBadge}>{phase === 'majorStart' ? 'Test 1: Major Start' : 'Test 2: Minor Start'}</div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Starting Key-Chord: {question.startKey.name} {question.startKey.type}</h3>
        <div style={styles.buttonGroup}>
          <button onClick={handlePlayKeyChord} style={styles.audioBtn}>🎹 Play Starting Tonic</button>
          <button onClick={handlePlayFullPassage} style={styles.primaryAudioBtn}>▶ Play Passage (Once)</button>
        </div>
      </div>

      <div style={styles.card}>
        <h4 style={styles.inputTitle}>Identify the Destination Key Relation:</h4>
        <div style={styles.grid}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => !hasChecked && setSelectedGuess(opt)}
              style={{
                ...styles.selectorBtn,
                backgroundColor: selectedGuess === opt ? '#d97706' : '#f3f4f6',
                color: selectedGuess === opt ? '#ffffff' : '#1f2937'
              }}
              disabled={hasChecked}
            >
              {opt}
            </button>
          ))}
        </div>

        {!hasChecked ? (
          <button onClick={handleVerifyAnswer} disabled={!selectedGuess} style={styles.actionBtn}>
            Submit Destination Guess
          </button>
        ) : (
          <button onClick={handleNextPhase} style={styles.nextBtn}>
            {phase === 'majorStart' ? 'Proceed to Minor Test →' : 'Start Next Round →'}
          </button>
        )}
      </div>

      {feedback && (
        <div style={{ ...styles.feedbackBanner, backgroundColor: feedback.includes('Correct') ? '#def7ec' : '#fde8e8', color: feedback.includes('Correct') ? '#03543f' : '#9b1c1c' }}>
          {feedback}
        </div>
      )}
    </div>
  );
};

// Inline design overrides matching your high-contrast mobile dark-mode parameters
const styles: Record<string, React.CSSProperties> = {
  container: { padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { background: 'none', border: 'none', color: '#2563eb', fontSize: '16px', cursor: 'pointer' },
  title: { fontSize: '16px', margin: 0, fontWeight: 'bold' },
  phaseBadge: { fontSize: '12px', background: '#f59e0b', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
  card: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
  subtitle: { margin: '0 0 16px 0', fontSize: '15px', textAlign: 'center', color: '#374151' },
  buttonGroup: { display: 'flex', gap: '12px' },
  audioBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', color: '#1f2937', fontWeight: '500', cursor: 'pointer' },
  primaryAudioBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#d97706', color: '#fff', fontWeight: '500', cursor: 'pointer' },
  inputTitle: { fontSize: '14px', margin: '0 0 12px 0', color: '#374151', fontWeight: '600' },
  grid: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  selectorBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' },
  actionBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', background: '#1f2937', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  nextBtn: { width: '100%', padding: '14px', border: 'none', borderRadius: '6px', background: '#059669', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  feedbackBanner: { padding: '14px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', textAlign: 'center', lineHeight: '1.4' }
};
