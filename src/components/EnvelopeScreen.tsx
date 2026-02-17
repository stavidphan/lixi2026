import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { formatMoneyFull } from '../utils/lottery';
import ScratchCard from './ScratchCard';
import './EnvelopeScreen.css';

export default function EnvelopeScreen() {
  const { state, nextPlayer, goToLobby } = useGame();
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const prize = state.currentPrize || 0;

  const handleEnvelopeClick = () => {
    if (!envelopeOpened) {
      setEnvelopeOpened(true);
    }
  };

  const handleReveal = () => {
    setScratched(true);
    setShowCelebration(true);
  };

  const handleNext = () => {
    nextPlayer();
  };

  return (
    <motion.div
      className="screen-container envelope-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="tet-background" />

      <button className="back-btn" onClick={() => setShowExitConfirm(true)} title="Về sảnh chờ">
        ← Thoát
      </button>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            className="exit-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="exit-confirm-dialog"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <p>Tạm dừng và quay về sảnh chờ?</p>
              <p className="exit-confirm-sub">Phiên chơi sẽ được lưu lại.</p>
              <div className="exit-confirm-actions">
                <button className="btn-secondary" onClick={() => setShowExitConfirm(false)}>Ở lại</button>
                <button className="btn-primary" onClick={goToLobby}>Thoát</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCelebration && (
        <div className="celebration-container">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                '--x': `${Math.random() * 100}vw`,
                '--delay': `${Math.random() * 2}s`,
                '--duration': `${2 + Math.random() * 3}s`,
                '--color': ['#ffd700', '#ff6b6b', '#ff3838', '#ffa502', '#fff'][
                  Math.floor(Math.random() * 5)
                ],
                '--rotation': `${Math.random() * 360}deg`,
                '--size': `${6 + Math.random() * 8}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!envelopeOpened ? (
          <motion.div
            key="envelope-closed"
            className="envelope-wrapper"
            initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 1.2, opacity: 0, rotateY: 90 }}
            transition={{ type: 'spring', damping: 15 }}
            onClick={handleEnvelopeClick}
          >
            <div className="envelope">
              <div className="envelope-flap" />
              <div className="envelope-body">
                <div className="envelope-circle">
                  <span className="envelope-fu">福</span>
                </div>
                <p className="envelope-text">LÌ XÌ</p>
                <p className="envelope-year">Tết 2026</p>
              </div>
              <div className="envelope-shine" />
            </div>
            <p className="tap-hint">Chạm để mở phong bì</p>
          </motion.div>
        ) : (
          <motion.div
            key="envelope-opened"
            className="scratch-wrapper"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.h2
              className="title-text scratch-title"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              🧧 Phong Bì Lì Xì
            </motion.h2>

            <motion.p
              className="scratch-instruction"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {scratched ? 'Chúc mừng bạn!' : 'Cào phần bên dưới để xem mệnh giá'}
            </motion.p>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 15 }}
            >
              <ScratchCard width={280} height={180} onReveal={handleReveal}>
                <div className="prize-content">
                  <p className="prize-label">Bạn nhận được</p>
                  <p className="prize-amount">{formatMoneyFull(prize)}</p>
                  <div className="prize-decoration">
                    <span>🧧</span>
                    <span>🧧</span>
                    <span>🧧</span>
                  </div>
                </div>
              </ScratchCard>
            </motion.div>

            <AnimatePresence>
              {scratched && (
                <motion.div
                  className="after-scratch"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="prize-display"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring', damping: 10 }}
                  >
                    <span className="prize-big">{formatMoneyFull(prize)}</span>
                  </motion.div>

                  <motion.button
                    className="btn-primary next-btn"
                    onClick={handleNext}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Người tiếp theo →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
