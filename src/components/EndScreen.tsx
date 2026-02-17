import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { formatMoneyFull } from '../utils/lottery';
import './EndScreen.css';

export default function EndScreen() {
  const { state, resetGame } = useGame();

  const denomCounts: Record<number, number> = {};
  state.history.forEach((val) => {
    denomCounts[val] = (denomCounts[val] || 0) + 1;
  });

  const sortedDenoms = Object.entries(denomCounts)
    .map(([value, count]) => ({ value: Number(value), count }))
    .sort((a, b) => a.value - b.value);

  return (
    <motion.div
      className="screen-container end-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="tet-background" />

      <motion.div
        className="end-header"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="end-icon">🎊</div>
        <h1 className="title-text end-title">Hết Lì Xì!</h1>
        <p className="end-subtitle">Chúc mừng năm mới 2026</p>
      </motion.div>

      <motion.div
        className="stats-card"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="stats-heading">Thống kê</h3>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{state.totalPlayed}</span>
            <span className="stat-label">Người chơi</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatMoneyFull(state.totalMoneyGiven)}</span>
            <span className="stat-label">Tổng tiền phát</span>
          </div>
        </div>

        {sortedDenoms.length > 0 && (
          <div className="denom-breakdown">
            <h4 className="breakdown-title">Chi tiết mệnh giá</h4>
            {sortedDenoms.map(({ value, count }) => (
              <div key={value} className="breakdown-row">
                <span className="breakdown-denom">{formatMoneyFull(value)}</span>
                <div className="breakdown-bar-track">
                  <motion.div
                    className="breakdown-bar-fill"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(count / state.totalPlayed) * 100}%`,
                    }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />
                </div>
                <span className="breakdown-count">x{count}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.button
        className="btn-primary reset-btn"
        onClick={resetGame}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔄 Chơi Lại
      </motion.button>
    </motion.div>
  );
}
