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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  const handlePlayCadence = async () => {
    if (isPlaying || !question || !question.progressionMidi) return; 

    try {
      setIsPlaying(true);
      await Tone.getContext().resume();
      
      // FIX: Pass both the progression array and the single key chord array into the utility
      await playCadenceProgression(question.progressionMidi, question.keyChordMidi); 
      
    } catch (error) {
      console.error("Cadence midi progression failed to play:", error);
    } finally {
      setIsPlaying(false); 
    }
  };
  
  const handlePlayKeyChordOnly = async () => {
    if (!question || isPlaying) return;
    try {
      setIsPlaying(true);
      await Tone.getContext().resume();
      await playChord(question.keyChordMidi, '1n');
    } finally {
      setIsPlaying(false);
    }
  };

  const handlePlayIndividualChord = async (index: number) => {
    if (!question || isPlaying) return;
    try {
      setIsPlaying(true);
      await Tone.getContext().resume();
      await playChord(question.progressionMidi[index], '1n');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleChordSelection = (chordIndex: number, val: string) => {
    if (isPlaying) return; // Prevent altering choices mid-audio
    const updated = [...selectedChords];
    updated[chordIndex] = val;
    setSelectedChords(updated);
  };

  const handleCheckAnswer = () => {
    if (!question || isPlaying) return;

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
        <div style={styles.toggleCard}>
          <span style={styles.toggleLabel}>🎹 Easy Mode (Root Chords Only)</span>
          <input
            type="checkbox"
            checked={easyMode}
            disabled={isPlaying}
            onChange={(e) => setEasyMode(e.target.checked)}
            style={{
              ...styles.checkboxInput,
              opacity: isPlaying ? 0.5 : 1,
              cursor: isPlaying ? 'not-allowed' : 'pointer'
            }}
          />
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.subtitle}>Current Key: {question.key.name} {question.key.type}</h3>

        <div style={styles.buttonGroup}>
          <button 
            onClick={handlePlayKeyChordOnly} 
            disabled={isPlaying}
            style={{
              ...styles.audioBtn,
              opacity: isPlaying ? 0.4 : 1,
              cursor: isPlaying ? 'not-allowed' : 'pointer'
            }}
          >
            {isPlaying ? '⏳ Busy...' : '🎹 Play Key-Chord'}
          </button>
          
          <button 
            onClick={handlePlayCadence} 
            disabled={isPlaying}
            style={{
              ...styles.primaryAudioBtn,
              opacity: isPlaying ? 0.4 : 1,
              cursor: isPlaying ? 'not-allowed' : 'pointer'
            }}
          >
            {isPlaying ? '🔊 Playing Full Sequence...' : '▶ Play Full Sequence'}
          </button>
        </div>

        <div style={styles.individualPlaySection}>
          <p style={styles.sectionLabel}>Play Individual Chords:</p>
          <div style={styles.row}>
            {chordIndexes.map((idx: number) => (
              <button 
                key={idx} 
                onClick={() => handlePlayIndividualChord(idx)} 
                disabled={isPlaying}
                style={{
                  ...styles.smallAudioBtn,
                  opacity: isPlaying ? 0.4 : 1,
                  cursor: isPlaying ? 'not-allowed' : 'pointer'
                }}
              >
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
              onClick={() => !hasChecked && !isPlaying && setSelectedCadence(opt)}
              style={{
                ...styles.selectorBtn,
                // FIX: Falls back gracefully to CSS tokens instead of absolute light-only colors
                backgroundColor: selectedCadence === opt ? '#2563eb' : 'var(--btn-selector)',
                color: selectedCadence === opt ? '#ffffff' : 'var(--text-selector)',
                opacity: isPlaying ? 0.4 : 1,
                cursor: (hasChecked || isPlaying) ? 'not-allowed' : 'pointer'
              }}
              disabled={hasChecked || isPlaying}
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
                disabled={hasChecked || isPlaying}
                style={{
                  ...styles.dropdown,
                  opacity: isPlaying ? 0.5 : 1,
                  cursor: (hasChecked || isPlaying) ? 'not-allowed' : 'default'
                }}
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
            disabled={!selectedCadence || selectedChords.some(c => c === '') || isPlaying}
            style={{
              ...styles.actionBtn,
              opacity: (isPlaying || !selectedCadence || selectedChords.some(c => c === '')) ? 0.4 : 1,
              cursor: (isPlaying || !selectedCadence || selectedChords.some(c => c === '')) ? 'not-allowed' : 'pointer'
            }}
          >
            Submit Answer
          </button>
        ) : (
          <button 
            onClick={() => handleNextQuestion(easyMode)} 
            disabled={isPlaying}
            style={{
              ...styles.nextBtn,
              opacity: isPlaying ? 0.4 : 1,
              cursor: isPlaying ? 'not-allowed' : 'pointer'
            }}
          >
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
const styles = {
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
    border: '1px solid #cbd5e1', // Slightly darker border for crisp edges
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
  score: {
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: 'var(--btn-selector)', // FIX: Swapped hardcoded light gray out for a dynamic CSS token
    color: 'var(--text-main)',               // FIX: Guarantees high-contrast typography in dark mode
    fontWeight: '700',
    fontSize: '12px',
    border: '1px solid var(--border-element)', // Gives it a clean outline layout definition
  },
  toggleCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '12px',
    border: '1px solid #cbd5e1', // Matches main panel depth lines
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: '13px',
    fontWeight: '700', // Made text slightly bolder
    color: 'var(--text-main)',
  },
  checkboxInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px', 
    padding: '16px', 
    marginBottom: '12px', 
    border: '1px solid #cbd5e1', // Darkened from var(--border-element) so panels look less faint
    boxShadow: 'var(--card-shadow)', 
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px', 
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 2px 0',
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
    backgroundColor: '#059669', 
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
  },
  individualPlaySection: {
    marginTop: '2px',
    borderTop: '1px solid var(--border-element)',
    paddingTop: '10px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 8px 0',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', 
    gap: '6px',
  },
  smallAudioBtn: {
    padding: '8px', 
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: 'var(--btn-selector)',
    color: 'var(--text-selector)',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  inputTitle: {
    color: 'var(--text-main)',
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '4px',
  },
  selectorBtn: {
    padding: '10px 12px', 
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
  },
  chordSelectorsRow: {
    display: 'grid',
    // FIX: Uses repeat auto-fit to scale 2-in-a-row for G6/7 and instantly forces 3-in-a-row for G8!
    gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
    gap: '10px',
    marginBottom: '4px',
    width: '100%',
  },
  chordCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  chordLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  dropdown: {
    width: '100%',
    padding: '8px 24px 8px 10px', // Adjusted right padding for chevron safety
    borderRadius: '8px',
    backgroundColor: 'var(--btn-selector)',
    color: 'var(--text-main)',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    fontWeight: '600',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://w3.org' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '12px',
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
