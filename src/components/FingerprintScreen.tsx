import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/gameStore';
import './FingerprintScreen.css';

const HOLD_DURATION = 1500;
const PROGRESS_INTERVAL = 16;

export default function FingerprintScreen() {
  const { drawPrize, state, goToLobby } = useGame();
  const [pressing, setPressing] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const rippleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const remaining = state.pool.length;

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleComplete = useCallback(() => {
    cleanup();
    setConfirmed(true);

    setTimeout(() => {
      drawPrize();
    }, 1500);
  }, [cleanup, drawPrize]);

  const getPosition = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if ('clientX' in e) {
      return { x: e.clientX, y: e.clientY };
    }
    return null;
  };

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (confirmed) return;
    e.preventDefault();

    const pos = getPosition(e);
    if (!pos) return;

    setTouchPos(pos);
    setPressing(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    const newRippleId = ++rippleIdRef.current;
    setRipples((prev) => [...prev, { id: newRippleId, x: pos.x, y: pos.y }]);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / HOLD_DURATION, 1);
      setProgress(pct);

      if (elapsed % 300 < PROGRESS_INTERVAL) {
        const rid = ++rippleIdRef.current;
        setRipples((prev) => [...prev.slice(-8), { id: rid, x: pos.x, y: pos.y }]);
      }

      if (pct >= 1) {
        handleComplete();
      }
    }, PROGRESS_INTERVAL);
  };

  const handlePressEnd = () => {
    if (confirmed) return;
    cleanup();
    setPressing(false);
    setProgress(0);
    setRipples([]);
    setTouchPos(null);
  };

  return (
    <motion.div
      ref={containerRef}
      className="screen-container fingerprint-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
    >
      <div className="tet-background" />

      <button
        className="back-btn"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={() => setShowExitConfirm(true)}
        title="Về sảnh chờ"
      >
        ← Thoát
      </button>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            className="exit-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
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

      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className="ripple-ring"
            style={{ left: r.x, top: r.y }}
            initial={{ scale: 0.5, opacity: 0.7 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((rr) => rr.id !== r.id));
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!confirmed ? (
          <motion.div
            className="fingerprint-content"
            key="prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="remaining-badge">
              Còn lại: <strong>{remaining}</strong> phong bì
            </div>

            <div className="fingerprint-area">
              {touchPos && pressing && (
                <svg
                  className="progress-ring"
                  style={{
                    position: 'fixed',
                    left: touchPos.x - 60,
                    top: touchPos.y - 60,
                  }}
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="rgba(255,215,0,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="var(--gold-primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                  />
                </svg>
              )}

              <div className={`fingerprint-icon ${pressing ? 'pressing' : ''}`}>
                <svg viewBox="0 0 100 100" width="120" height="120">
                  <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9">
                    <path d="M50 10 C25 10, 10 30, 10 50 C10 75, 25 95, 50 95" />
                    <path d="M50 10 C75 10, 90 30, 90 50 C90 70, 80 85, 65 92" />
                    <path d="M50 20 C30 20, 18 35, 18 50 C18 70, 30 88, 50 90" />
                    <path d="M50 20 C70 20, 82 35, 82 50 C82 68, 72 82, 58 88" />
                    <path d="M50 30 C36 30, 26 40, 26 50 C26 65, 35 80, 50 85" />
                    <path d="M50 30 C64 30, 74 40, 74 50 C74 65, 66 77, 54 82" />
                    <path d="M50 40 C42 40, 34 45, 34 52 C34 62, 40 72, 50 78" />
                    <path d="M50 40 C58 40, 66 45, 66 52 C66 62, 60 72, 52 76" />
                    <path d="M50 50 C46 50, 42 53, 42 56 C42 62, 46 68, 50 72" />
                    <path d="M50 50 C54 50, 58 53, 58 56 C58 62, 54 68, 52 70" />
                  </g>
                </svg>
              </div>

              <p className="fingerprint-hint">
                {pressing ? 'Giữ ngón tay...' : 'Nhấn và giữ ngón tay vào màn hình'}
              </p>

              {pressing && (
                <div className="progress-bar-container">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.05 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="confirm-content"
            key="confirmed"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <div className="confirm-sparkles">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="sparkle"
                  style={{
                    '--angle': `${i * 30}deg`,
                    '--delay': `${i * 0.05}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>
            <div className="confirm-check">✓</div>
            <h2 className="title-text confirm-text">Xác nhận thành công!</h2>
            <p className="confirm-subtext">Đang mở phong bì lì xì...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
