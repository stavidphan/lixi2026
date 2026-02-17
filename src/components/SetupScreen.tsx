import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/gameStore';
import type { Denomination } from '../types';
import { formatMoneyFull } from '../utils/lottery';
import './SetupScreen.css';

let idCounter = 0;
function nextId() {
  return `denom_${++idCounter}_${Date.now()}`;
}

export default function SetupScreen() {
  const { state, setDenominations, startGame, goToLobby } = useGame();
  const [denoms, setDenoms] = useState<Denomination[]>(
    state.denominations.length > 0
      ? state.denominations
      : []
  );
  const [inputValue, setInputValue] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editQty, setEditQty] = useState('');

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDenominations(denoms);
  }, [denoms, setDenominations]);

  const totalEnvelopes = denoms.reduce((sum, d) => sum + d.quantity, 0);
  const totalMoney = denoms.reduce((sum, d) => sum + d.value * d.quantity, 0);

  function handleAdd() {
    const value = parseInt(inputValue);
    const qty = parseInt(inputQty);

    if (!value || value <= 0) {
      setError('Vui lòng nhập mệnh giá hợp lệ');
      return;
    }
    if (!qty || qty <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    const existing = denoms.find((d) => d.value === value);
    if (existing) {
      const updated = denoms.map((d) =>
        d.value === value ? { ...d, quantity: d.quantity + qty } : d
      );
      setDenoms(updated);
    } else {
      setDenoms([...denoms, { id: nextId(), value, quantity: qty }]);
    }

    setInputValue('');
    setInputQty('');
    setError('');
  }

  function handleRemove(id: string) {
    setDenoms(denoms.filter((d) => d.id !== id));
  }

  function handleUpdateQty(id: string, newQty: number) {
    if (newQty <= 0) {
      handleRemove(id);
      return;
    }
    setDenoms(denoms.map((d) => (d.id === id ? { ...d, quantity: newQty } : d)));
  }

  function handleEditStart(d: Denomination) {
    setEditingId(d.id);
    setEditValue(String(d.value));
    setEditQty(String(d.quantity));
  }

  function handleEditSave() {
    if (!editingId) return;
    const newValue = parseInt(editValue);
    const newQty = parseInt(editQty);
    if (!newValue || newValue <= 0 || !newQty || newQty <= 0) return;

    const duplicate = denoms.find((d) => d.id !== editingId && d.value === newValue);
    if (duplicate) {
      setError('Mệnh giá này đã tồn tại!');
      return;
    }

    setDenoms(
      denoms.map((d) => (d.id === editingId ? { ...d, value: newValue, quantity: newQty } : d))
    );
    setEditingId(null);
    setError('');
  }

  function handleEditCancel() {
    setEditingId(null);
  }

  function handleStart() {
    if (denoms.length === 0) return;
    setDenominations(denoms);
    setTimeout(() => startGame(), 50);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleAdd();
    }
  }

  return (
    <motion.div
      className="screen-container setup-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="tet-background" />

      <button className="back-btn" onClick={goToLobby} title="Về sảnh chờ">
        ← Sảnh chờ
      </button>

      <motion.div
        className="setup-header"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="lantern-icon">🏮</div>
        <h1 className="title-text setup-title">Lì Xì Tết 2026</h1>
        <p className="setup-subtitle">Thiết lập mệnh giá lì xì</p>
      </motion.div>

      <motion.div
        className="setup-form"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="form-row">
          <div className="input-group">
            <label>Mệnh giá (VNĐ)</label>
            <input
              type="number"
              placeholder="VD: 10000"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              min="1000"
              step="1000"
            />
          </div>
          <div className="input-group">
            <label>Số lượng</label>
            <input
              type="number"
              placeholder="VD: 5"
              value={inputQty}
              onChange={(e) => setInputQty(e.target.value)}
              onKeyDown={handleKeyDown}
              min="1"
            />
          </div>
          <button className="btn-add" onClick={handleAdd}>
            +
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}

        <div className="quick-add">
          <span className="quick-label">Thêm nhanh:</span>
          <div className="quick-buttons">
            {[10000, 20000, 50000, 100000, 200000, 500000].map((v) => (
              <button
                key={v}
                className="quick-btn"
                onClick={() => {
                  setInputValue(String(v));
                  setInputQty('1');
                }}
              >
                {v / 1000}k
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="denom-list"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence>
          {denoms
            .sort((a, b) => a.value - b.value)
            .map((d) => (
              <motion.div
                key={d.id}
                className={`denom-item ${editingId === d.id ? 'denom-item--editing' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                {editingId === d.id ? (
                  <>
                    <div className="edit-inputs">
                      <input
                        type="number"
                        className="edit-input"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Mệnh giá"
                        min="1000"
                        step="1000"
                        autoFocus
                      />
                      <input
                        type="number"
                        className="edit-input edit-input--qty"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        placeholder="SL"
                        min="1"
                      />
                    </div>
                    <div className="denom-controls">
                      <button className="save-btn" onClick={handleEditSave}>✓</button>
                      <button className="cancel-btn" onClick={handleEditCancel}>✕</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="denom-info">
                      <span className="denom-value">{formatMoneyFull(d.value)}</span>
                      <span className="denom-total">= {formatMoneyFull(d.value * d.quantity)}</span>
                    </div>
                    <div className="denom-controls">
                      <button className="edit-btn" onClick={() => handleEditStart(d)} title="Chỉnh sửa">
                        ✎
                      </button>
                      <button className="qty-btn" onClick={() => handleUpdateQty(d.id, d.quantity - 1)}>
                        −
                      </button>
                      <span className="denom-qty">{d.quantity}</span>
                      <button className="qty-btn" onClick={() => handleUpdateQty(d.id, d.quantity + 1)}>
                        +
                      </button>
                      <button className="remove-btn" onClick={() => handleRemove(d.id)}>
                        ✕
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
        </AnimatePresence>

        {denoms.length === 0 && (
          <p className="empty-text">Chưa có mệnh giá nào. Hãy thêm mệnh giá ở trên!</p>
        )}
      </motion.div>

      <motion.div
        className="setup-summary"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="summary-row">
          <span>Tổng phong bì:</span>
          <span className="summary-value">{totalEnvelopes}</span>
        </div>
        <div className="summary-row">
          <span>Tổng tiền:</span>
          <span className="summary-value">{formatMoneyFull(totalMoney)}</span>
        </div>
      </motion.div>

      <motion.button
        className="btn-primary start-btn"
        disabled={denoms.length === 0}
        onClick={handleStart}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🧧 Bắt Đầu Phát Lì Xì
      </motion.button>
    </motion.div>
  );
}
