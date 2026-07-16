import React, { useState, useEffect } from 'react';
import { generateAdvancedModulation, type AdvancedModulationQuestion } from '../utils/modulationGenerator';
import { playAdvancedModulationPassage, playChord, stopAllAudio } from '../utils/audioPlayer';
import * as Tone from 'tone';

interface ModulationQuizProps {
  grade: number;
  onBackToMenu: () => void;
}

export const ModulationQuiz: React.FC<ModulationQuizProps> = ({ grade, onBackToMenu }) => {
  const [phase, setPhase] = useState<'majorStart' | 'minorStart'>('majorStart');
  const [question, setQuestion] = useState<AdvancedModulationQuestion | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<string>('');
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (grade === 7) {
      setPhase('majorStart');
    }
  }, [grade]);

  useEffect(() => {
    loadNewQuestion();
    return () => stopAllAudio();
  }, [phase]);

  const loadNewQuestion = () => {
    stopAllAudio();
    setQuestion(generateAdvancedModulation(phase));
    setSelectedGuess('');
    setHasChecked(false);
    setFeedback(null);
  };

  const handlePlayFullPassage = async () => {
    if (!question) return;
    playAdvancedModulationPassage(question.passageNotes);
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
    if (grade === 7) {
      loadNewQuestion();
      return;
    }
    if (phase === 'majorStart') {
      setPhase('minorStart');
    } else {
      setPhase('majorStart');
    }
  };

  if (!question) return <div style={styles.container}>Loading Modulation Engine...</div>;

  const options = phase === 'majorStart'
    ? ['Dominant', 'Subdominant', 'Relative Minor']
    : ['Dominant', 'Subdominant', 'Relative Major'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
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
        <h2 style={styles.title}>Modulation Trainer (Grade {grade})</h2>
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
                // FIX: Uses dynamic variable states to prevent blinding color sheets
                backgroundColor: selectedGuess === opt ? '#d97706' : 'var(--btn-selector)',
                color: selectedGuess === opt ? '#ffffff' : 'var(--text-selector)',
                cursor: hasChecked ? 'not-allowed' : 'pointer'
              }}
              disabled={hasChecked}
            >
              {opt}
            </button>
          ))}
        </div>

        {!hasChecked ? (
          <button 
            onClick={handleVerifyAnswer} 
            disabled={!selectedGuess} 
            style={{
              ...styles.actionBtn,
              opacity: !selectedGuess ? 0.4 : 1,
              cursor: !selectedGuess ? 'not-allowed' : 'pointer'
            }}
          >
            Submit Destination Guess
          </button>
        ) : (
          <button onClick={handleNextPhase} style={styles.nextBtn}>
            {phase === 'majorStart' ? 'Proceed to Minor Test →' : 'Start Next Round →'}
          </button>
        )}
      </div>

      {feedback && (
        <div style={{
          ...styles.feedbackBanner,
          backgroundColor: feedback.includes('✅') ? '#def7ec' : '#fde8e8', 
          color: feedback.includes('✅') ? '#03543f' : '#9b1c1c'
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
};

// Slimmed down, cohesive cross-platform style tokens
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'var(--bg-main)',
    minHeight: '100vh',
    padding: '12px 14px', 
    maxWidth: '460px', 
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px', 
    gap: '8px',
    width: '100%',
  },
  backBtn: {
    padding: '6px 12px', 
    borderRadius: '16px',
    border: '1px solid #cbd5e1',
    backgroundColor: 'var(--bg-card)',
    color: '#2563eb', 
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  title: {
    color: 'var(--text-main)',
    fontSize: '18px', 
    fontWeight: '800',
    letterSpacing: '-0.025em',
    margin: 0,
    flex: 1, 
    textAlign: 'center' as const,
    lineHeight: '1.2',
  },
  phaseBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#d97706', // Dedicated Modulation Amber accent tracking
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '12px',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px', 
    padding: '16px', 
    marginBottom: '12px', 
    border: '1px solid #cbd5e1', 
    boxShadow: 'var(--card-shadow)', 
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px', 
  },
  subtitle: {
    color: 'var(--text-main)',
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 2px 0',
    textAlign: 'center' as const,
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
  },
  audioBtn: {
    padding: '10px 12px', 
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  primaryAudioBtn: {
    padding: '10px 12px', 
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#d97706', // Dynamic module color grouping
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.15)',
  },
  inputTitle: {
    color: 'var(--text-main)',
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginBottom: '4px',
  },
  selectorBtn: {
    padding: '12px 14px', 
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.1s ease',
  },
  actionBtn: {
    width: '100%',
    padding: '12px', 
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#2563eb', 
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
  },
  nextBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '6px',
  },
  feedbackBanner: {
    padding: '12px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '10px',
    lineHeight: '1.4',
    textAlign: 'center' as const,
  }
};
