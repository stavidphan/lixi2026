import { AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from './store/gameStore';
import SetupScreen from './components/SetupScreen';
import FingerprintScreen from './components/FingerprintScreen';
import EnvelopeScreen from './components/EnvelopeScreen';
import EndScreen from './components/EndScreen';
import './App.css';

function GameScreens() {
  const { state } = useGame();

  return (
    <div className="app-wrapper">
      <div className="tet-background" />
      <FloatingParticles />
      <AnimatePresence mode="wait">
        {state.screen === 'setup' && <SetupScreen key="setup" />}
        {state.screen === 'fingerprint' && <FingerprintScreen key="fingerprint" />}
        {state.screen === 'envelope' && <EnvelopeScreen key="envelope" />}
        {state.screen === 'end' && <EndScreen key="end" />}
      </AnimatePresence>
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="particles-container">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="floating-particle"
          style={{
            '--x-start': `${Math.random() * 100}%`,
            '--y-start': `${Math.random() * 100}%`,
            '--duration': `${8 + Math.random() * 12}s`,
            '--delay': `${Math.random() * 5}s`,
            '--size': `${3 + Math.random() * 5}px`,
            '--opacity': `${0.15 + Math.random() * 0.25}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameScreens />
    </GameProvider>
  );
}

export default App;
