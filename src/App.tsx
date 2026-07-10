import React, { useState } from 'react';
import { CadenceQuiz } from './components/CadenceQuiz';
import { ModulationQuiz } from './components/ModulationQuiz';

type ActiveView = 'dashboard' | 'cadences' | 'modulations';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');

  return (
    <div style={styles.appShell}>
      {/* 1. MAIN DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <div style={styles.container}>
          <div style={styles.heroSection}>
            <h1 style={styles.mainTitle}>ABRSM Grade 8</h1>
            <p style={styles.subTitle}>Practical Piano Aural Trainer</p>
          </div>

          <div style={styles.menuGrid}>
            {/* Cadence Training Button */}
            <button 
              onClick={() => setCurrentView('cadences')} 
              style={{ ...styles.menuCard, borderLeft: '6px solid #2563eb' }}
            >
              <div style={styles.icon}>🎼</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Cadence Progressions</h3>
                <p style={styles.cardDesc}>Identify cadences and 3-chord inversion positions (Syllabus part iii).</p>
              </div>
            </button>

            {/* Modulation Training Button */}
            <button 
              onClick={() => setCurrentView('modulations')} 
              style={{ ...styles.menuCard, borderLeft: '6px solid #d97706' }}
            >
              <div style={styles.icon}>🔄</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Modulations</h3>
                <p style={styles.cardDesc}>Track transitions to the dominant, subdominant, or relative keys.</p>
                
              </div>
            </button>
          </div>

          <div style={styles.footer}>
            <p>Configured for 2027/2028 Syllabus Requirements</p>
          </div>
        </div>
      )}

      {/* 2. CADENCE PRACTICE SCREEN */}
      {currentView === 'cadences' && (
        <CadenceQuiz onBackToMenu={() => setCurrentView('dashboard')} />
      )}

      {/* 3. MODULATION PRACTICE SCREEN (PLACEHOLDER) */}
      {currentView === 'modulations' && (
        <ModulationQuiz onBackToMenu={() => setCurrentView('dashboard')} />
      )}
    </div>
  );
};

// Touch-friendly responsive mobile styles
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
    margin: '32px 0'
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  subTitle: {
    fontSize: '16px',
    color: '#4b5563',
    margin: 0
  },
  menuGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '40px'
  },
  menuCard: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    cursor: 'pointer',
    width: '100%',
    transition: 'transform 0.1s ease',
    outline: 'none'
  },
  icon: {
    fontSize: '32px',
    marginRight: '16px',
    minWidth: '40px',
    textAlign: 'center'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  cardDesc: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.4'
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: '8px',
    textTransform: 'uppercase'
  },
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: 'auto'
  },
  placeholderContainer: {
    padding: '40px 20px',
    textAlign: 'center',
    fontFamily: 'system-ui, sans-serif'
  },
  backBtn: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    marginTop: '16px'
  }
};
