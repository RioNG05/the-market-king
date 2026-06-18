import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Home from './components/Home';
import MasterDashboard from './components/MasterDashboard';
import PlayerController from './components/PlayerController';

// The original Single-Player App Layout for "Solo Mode"
import SetupScreen from './components/SetupScreen';
import Dashboard from './components/Dashboard';
import GameOverScreen from './components/GameOverScreen';
import { useGame } from './context/GameContext';

function SinglePlayerGameScreen() {
  const { phase } = useGame();
  return (
    <div className="w-full flex-1 flex flex-col justify-center py-6 px-2 sm:px-4">
      {phase === 'setup' && <SetupScreen />}
      {(phase === 'production' || phase === 'sales' || phase === 'report') && <Dashboard />}
      {phase === 'gameover' && <GameOverScreen />}
    </div>
  );
}

function SoloModeApp() {
  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col justify-between cyber-grid">
        <div className="h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 w-full shadow shadow-cyan-500/40"></div>
        <SinglePlayerGameScreen />
        <footer className="text-center py-4 text-[10px] text-gray-700 font-mono border-t border-neutral-950 bg-black/40">
          <span>&copy; 2026 THE MARKET KING. CHƯƠNG TRÌNH KHỞI NGHIỆP GIẢ LẬP KINH TẾ CHÍNH TRỊ.</span>
        </footer>
      </div>
    </GameProvider>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex flex-col justify-between cyber-grid">
            <Home />
          </div>
        } />
        <Route path="/master/:roomId" element={<MasterDashboard />} />
        <Route path="/play/:roomId" element={<PlayerController />} />
        <Route path="/solo" element={<SoloModeApp />} />
      </Routes>
    </Router>
  );
}

export default App;
