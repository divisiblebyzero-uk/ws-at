import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { CadenceQuiz } from './components/CadenceQuiz';
import { ModulationQuiz } from './components/ModulationQuiz';
import { AudioSandbox } from './components/AudioSandbox';

type ActiveView = 'grade-selector' | 'grade-dashboard' | 'cadences' | 'modulations' | 'sandbox';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ActiveView>('grade-selector');
  const [selectedGrade, setSelectedGrade] = useState<number>(8);

  // --- FIX: Corrected state keys and value fallbacks for native hardware navigation ---
  useEffect(() => {
    const handleHardwareBack = async () => {
      const listener = await CapApp.addListener('backButton', () => {
        if (currentView === 'cadences' || currentView === 'modulations' || currentView === 'sandbox') {
          // If inside a sub-module, step safely back out to the grade dashboard menu
          setCurrentView('grade-dashboard');
        } else if (currentView === 'grade-dashboard') {
          // If on the dashboard menu, step back to the primary landing grade selector wheel
          setCurrentView('grade-selector');
        } else {
          // If already on the landing wheel, minimize the application container gracefully
          CapApp.exitApp();
        }
      });
      return listener;
    };

    const backButtonEvent = handleHardwareBack();

    return () => {
      backButtonEvent.then(handler => handler.remove());
    };
  }, [currentView]);

  const handleSelectGrade = (grade: number) => {
    setSelectedGrade(grade);
    if (grade === 6 || grade === 7 || grade === 8) {
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
              const isReady = g === 6 || g === 7 || g === 8;
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
            <button 
              onClick={() => setCurrentView('cadences')} 
              style={{ ...styles.menuCard, borderLeft: '6px solid #2563eb' }}
            >
              <div style={styles.cardIcon}>🎼</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Cadence Progressions</h3>
                <p style={styles.cardDesc}>
                  {selectedGrade === 6 && 'Identify 2-chord root-position cadences (Perfect or Imperfect).'}
                  {selectedGrade === 7 && 'Identify 2-chord root-position cadences (Perfect, Imperfect, Interrupted).'}
                  {selectedGrade === 8 && 'Identify 3-chord cadences and complex inversion positions.'}
                </p>
              </div>
            </button>

            {(selectedGrade === 7 || selectedGrade === 8) && (
              <button 
                onClick={() => setCurrentView('modulations')} 
                style={{ ...styles.menuCard, borderLeft: '6px solid #d97706' }}
              >
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
            )}

            <button 
              onClick={() => setCurrentView('sandbox')} 
              style={{ ...styles.menuCard, borderLeft: '6px solid #059669' }}
            >
              <div style={styles.cardIcon}>🔊</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Audio Reference Sandbox</h3>
                <p style={styles.cardDesc}>Explore 4-voice chord qualities and animated real-time piano layouts.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: CORE QUIZ MODULES */}
      {currentView === 'cadences' && <CadenceQuiz grade={selectedGrade} onBackToMenu={() => setCurrentView('grade-dashboard')} />}
      {currentView === 'modulations' && <ModulationQuiz grade={selectedGrade} onBackToMenu={() => setCurrentView('grade-dashboard')} />}
      {currentView === 'sandbox' && <AudioSandbox onBackToMenu={() => setCurrentView('grade-dashboard')} />}

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

// Paste your original styles mapping tree below this comment block intact
const styles: Record<string, React.CSSProperties> = {
  appShell: { backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '32px' },
  container: { padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  heroSection: { textAlign: 'center', marginBottom: '24px', marginTop: '12px' },
  mainTitle: { fontSize: '24px', fontWeight: '800', color: '#1f2937', margin: '0 0 4px 0' },
  dashboardTitle: { fontSize: '20px', fontWeight: '800', color: '#1f2937', margin: '0 0 4px 0' },
  subTitle: { fontSize: '13px', color: '#6b7280', margin: 0 },
  gradeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' },
  gradeCard: { padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '15px', fontWeight: '700', color: '#374151', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' },
  activeBadge: { fontSize: '10px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' },
  navigationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  backLink: { background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: 0 },
  pillBadge: { fontSize: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '9999px', fontWeight: '700' },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' },
  menuCard: { display: 'flex', gap: '14px', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', textAlign: 'left', cursor: 'pointer', width: '100%', boxSizing: 'border-box' },
  cardIcon: { fontSize: '24px', display: 'flex', alignItems: 'center' },
  cardContent: { display: 'flex', flexDirection: 'column', gap: '2px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#1f2937', margin: 0 },
  cardDesc: { fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: '1.4' }
};
