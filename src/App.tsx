import React, { useState } from 'react';
import { CadenceQuiz } from './components/CadenceQuiz';
import { ModulationQuiz } from './components/ModulationQuiz';
import { AudioSandbox } from './components/AudioSandbox';

type ActiveView = 'grade-selector' | 'grade-dashboard' | 'cadences' | 'modulations' | 'sandbox';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ActiveView>('grade-selector');
  const [selectedGrade, setSelectedGrade] = useState<number>(8);

  const handleSelectGrade = (grade: number) => {
    setSelectedGrade(grade);
    if (grade === 7 || grade === 8) {
      setCurrentView('grade-dashboard');
    } else {
      alert(`Grade ${grade} curriculum parameters coming soon!`);
    }
  };

  const gradesArray: number[] = Array.of(1, 2, 3, 4, 5, 6, 7, 8);

  return (
    <div style={styles.appShell}>
      {/* VIEW 1: THE GRADE SELECTOR MENU */}
      {currentView === 'grade-selector' && (
        <div style={styles.container}>
          <div style={styles.heroSection}>
            <h1 style={styles.mainTitle}>Divisible By Zero</h1>
            <p style={styles.subTitle}>ABRSM Aural Examination Suite</p>
          </div>
          
          <div style={styles.gradeGrid}>
            {gradesArray.map((g: number) => {
              const isReady = g === 7 || g === 8;
              return (
                <button 
                  key={g} 
                  onClick={() => handleSelectGrade(g)} 
                  style={{
                    ...styles.gradeCard,
                    borderLeft: isReady ? '5px solid #2563eb' : '5px solid #d1d5db',
                    backgroundColor: isReady ? '#ffffff' : '#f3f4f6'
                  }}
                >
                  Grade {g} {isReady && <span style={styles.activeBadge}>Ready</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: DYNAMIC GRADE DASHBOARD SCREEN */}
      {currentView === 'grade-dashboard' && (
        <div style={styles.container}>
          <div style={styles.navigationHeader}>
            <button onClick={() => setCurrentView('grade-selector')} style={styles.backLink}>
              ← Change Grade
            </button>
            <div style={styles.pillBadge}>Grade {selectedGrade} Active</div>
          </div>

          <div style={styles.heroSection}>
            <h2 style={styles.dashboardTitle}>Practical Aural Dashboard</h2>
            <p style={styles.subTitle}>Select a practice module matching the exam guidelines</p>
          </div>
          
          <div style={styles.menuGrid}>
            <button onClick={() => setCurrentView('cadences')} style={{ ...styles.menuCard, borderLeft: '6px solid #2563eb' }}>
              <div style={styles.cardIcon}>🎼</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Cadence Progressions</h3>
                <p style={styles.cardDesc}>
                  {selectedGrade === 7 
                    ? 'Identify 2-chord root-position cadences (Perfect, Imperfect, Interrupted).' 
                    : 'Identify 3-chord cadences and complex inversion positions.'}
                </p>
              </div>
            </button>

            <button onClick={() => setCurrentView('modulations')} style={{ ...styles.menuCard, borderLeft: '6px solid #d97706' }}>
              <div style={styles.cardIcon}>🔄</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Modulations</h3>
                <p style={styles.cardDesc}>
                  {selectedGrade === 7 
                    ? 'Track transitions starting from Major keys to Dominant, Subdominant, or Relative Minor.' 
                    : 'Track advanced Major and minor starting key variations.'}
                </p>
              </div>
            </button>

            <button onClick={() => setCurrentView('sandbox')} style={{ ...styles.menuCard, borderLeft: '6px solid #059669' }}>
              <div style={styles.cardIcon}>🔊</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Audio Reference Sandbox</h3>
                <p style={styles.cardDesc}>Explore 4-voice chord qualities and animated real-time piano layouts.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: CORE QUIZ MODULES (Passing the selectedGrade context prop down) */}
      {currentView === 'cadences' && <CadenceQuiz grade={selectedGrade} onBackToMenu={() => setCurrentView('grade-dashboard')} />}
      {currentView === 'modulations' && <ModulationQuiz grade={selectedGrade} onBackToMenu={() => setCurrentView('grade-dashboard')} />}
      {currentView === 'sandbox' && <AudioSandbox onBackToMenu={() => setCurrentView('grade-dashboard')} />}

        {/* Place this at the bottom of your container block inside src/App.tsx */}
<p style={{ 
  fontSize: '11px', 
  color: '#9ca3af', 
  textAlign: 'center', 
  marginTop: '32px', 
  lineHeight: '1.4' 
}}>
  This app is an independent educational tool and is not affiliated with or endorsed by ABRSM.
</p>
    </div>

    
  );
};


// Polished layout engine properties insulated against native dark mode overriding
const styles: Record<string, React.CSSProperties> = {
  appShell: { 
    backgroundColor: '#f9fafb', 
    minHeight: '100vh', 
    width: '100%', 
    margin: 0, 
    padding: 0, 
    boxSizing: 'border-box' 
  },
  container: { 
    padding: '24px 16px', 
    maxWidth: '500px', 
    margin: '0 auto', 
    fontFamily: 'system-ui, -apple-system, sans-serif' 
  },
  heroSection: { 
    textAlign: 'center', 
    margin: '24px 0' 
  },
  mainTitle: { 
    fontSize: '28px', 
    fontWeight: '800', 
    color: '#111827', 
    margin: '0 0 4px 0' 
  },
  dashboardTitle: { 
    fontSize: '24px', 
    fontWeight: '800', 
    color: '#111827', 
    margin: '0 0 4px 0' 
  },
  subTitle: { 
    fontSize: '14px', 
    color: '#4b5563', 
    margin: 0, 
    lineHeight: '1.4' 
  },
  navigationHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px' 
  },
  backLink: { 
    background: 'none', 
    border: 'none', 
    color: '#2563eb', 
    fontSize: '15px', 
    fontWeight: '600', 
    cursor: 'pointer', 
    padding: 0 
  },
  pillBadge: { 
    fontSize: '11px', 
    backgroundColor: '#e0f2fe', 
    color: '#0369a1', 
    padding: '4px 10px', 
    borderRadius: '9999px', 
    fontWeight: 'bold' 
  },
  gradeGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '12px', 
    marginTop: '16px' 
  },
  gradeCard: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px', 
    color: '#1f2937', 
    borderRadius: '10px', 
    border: '1px solid #e5e7eb', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)', 
    fontWeight: '700', 
    fontSize: '15px', 
    cursor: 'pointer', 
    textAlign: 'left' 
  },
  activeBadge: { 
    fontSize: '10px', 
    backgroundColor: '#dbeafe', 
    color: '#2563eb', 
    padding: '2px 6px', 
    borderRadius: '4px', 
    textTransform: 'uppercase' 
  },
  menuGrid: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  menuCard: { 
    display: 'flex', 
    alignItems: 'center', 
    textAlign: 'left', 
    padding: '18px', 
    backgroundColor: '#ffffff', 
    borderRadius: '12px', 
    border: '1px solid #e5e7eb', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)', 
    cursor: 'pointer', 
    width: '100%', 
    outline: 'none' 
  },
  cardIcon: { 
    fontSize: '28px', 
    marginRight: '16px', 
    minWidth: '36px', 
    textAlign: 'center' 
  },
  cardContent: { 
    display: 'flex', 
    flexDirection: 'column', 
    width: '100%' 
  },
  cardTitle: { 
    fontSize: '16px', 
    fontWeight: '700', 
    color: '#1f2937', 
    margin: '0 0 4px 0' 
  },
  cardDesc: { 
    fontSize: '12px', 
    color: '#6b7280', 
    margin: 0, 
    lineHeight: '1.4' 
  }
};

