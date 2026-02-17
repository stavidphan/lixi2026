import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, loadRooms } from '../store/gameStore';
import type { Room } from '../types';
import { formatMoneyFull } from '../utils/lottery';
import './LobbyScreen.css';

export default function LobbyScreen() {
  const { createRoom, loadRoom, deleteRoom } = useGame();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);

  useEffect(() => {
    setRooms(loadRooms());
  }, []);

  function handleCreate() {
    const name = newRoomName.trim() || `Phòng ${rooms.length + 1}`;
    createRoom(name);
  }

  function handleResume(room: Room) {
    loadRoom(room);
  }

  function handleDelete(roomId: string) {
    deleteRoom(roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    setConfirmDeleteId(null);
  }

  function getRoomStatus(room: Room) {
    const gs = room.gameState;
    if (gs.screen === 'end') return { label: 'Đã kết thúc', className: 'status-ended' };
    if (gs.screen === 'setup' && gs.pool.length === 0 && gs.totalPlayed === 0) return { label: 'Chưa bắt đầu', className: 'status-new' };
    return { label: 'Đang chơi', className: 'status-playing' };
  }

  function getRoomProgress(room: Room) {
    const gs = room.gameState;
    const totalEnvelopes = gs.denominations.reduce((s, d) => s + d.quantity, 0);
    return { played: gs.totalPlayed, total: totalEnvelopes };
  }

  const sortedRooms = [...rooms].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <motion.div
      className="screen-container lobby-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="tet-background" />

      <motion.div
        className="lobby-header"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="lantern-icon">🏮</div>
        <h1 className="title-text lobby-title">Lì Xì Tết 2026</h1>
        <p className="lobby-subtitle">Chọn phòng chơi hoặc tạo phòng mới</p>
      </motion.div>

      <motion.button
        className="btn-primary create-room-btn"
        onClick={() => setShowCreateModal(true)}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        + Tạo Phòng Mới
      </motion.button>

      <motion.div
        className="rooms-list"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence>
          {sortedRooms.map((room) => {
            const status = getRoomStatus(room);
            const progress = getRoomProgress(room);
            return (
              <motion.div
                key={room.id}
                className="room-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
              >
                <div className="room-card-header">
                  <h3 className="room-name">{room.name}</h3>
                  <span className={`room-status ${status.className}`}>{status.label}</span>
                </div>

                <div className="room-card-info">
                  <div className="room-stat">
                    <span className="room-stat-label">Tiến độ</span>
                    <span className="room-stat-value">{progress.played}/{progress.total}</span>
                  </div>
                  <div className="room-stat">
                    <span className="room-stat-label">Đã phát</span>
                    <span className="room-stat-value">{formatMoneyFull(room.gameState.totalMoneyGiven)}</span>
                  </div>
                  <div className="room-stat">
                    <span className="room-stat-label">Ngày tạo</span>
                    <span className="room-stat-value">{new Date(room.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="room-card-actions">
                  <button className="btn-primary room-resume-btn" onClick={() => handleResume(room)}>
                    {status.className === 'status-ended' ? 'Xem lại' : 'Tiếp tục'}
                  </button>
                  <button className="room-detail-btn" onClick={() => setDetailRoom(room)} title="Xem cài đặt">
                    ⚙
                  </button>
                  {confirmDeleteId === room.id ? (
                    <div className="confirm-delete">
                      <span>Xóa?</span>
                      <button className="confirm-yes" onClick={() => handleDelete(room.id)}>Có</button>
                      <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>Không</button>
                    </div>
                  ) : (
                    <button className="room-delete-btn" onClick={() => setConfirmDeleteId(room.id)}>
                      🗑
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedRooms.length === 0 && (
          <div className="empty-lobby">
            <p>Chưa có phòng nào.</p>
            <p>Tạo phòng mới để bắt đầu phát lì xì!</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="modal-title">Tạo Phòng Mới</h3>
              <input
                className="modal-input"
                type="text"
                placeholder={`Phòng ${rooms.length + 1}`}
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button className="btn-primary" onClick={handleCreate}>
                  Tạo Phòng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailRoom && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailRoom(null)}
          >
            <motion.div
              className="modal-content detail-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="modal-title">⚙ Cài đặt — {detailRoom.name}</h3>
              {detailRoom.gameState.denominations.length > 0 ? (
                <div className="detail-denom-list">
                  {[...detailRoom.gameState.denominations]
                    .sort((a, b) => a.value - b.value)
                    .map((d) => (
                      <div key={d.id} className="detail-denom-row">
                        <span className="detail-denom-value">{formatMoneyFull(d.value)}</span>
                        <span className="detail-denom-qty">x{d.quantity}</span>
                        <span className="detail-denom-subtotal">{formatMoneyFull(d.value * d.quantity)}</span>
                      </div>
                    ))}
                  <div className="detail-denom-summary">
                    <div className="detail-summary-row">
                      <span>Tổng phong bì:</span>
                      <strong>{detailRoom.gameState.denominations.reduce((s, d) => s + d.quantity, 0)}</strong>
                    </div>
                    <div className="detail-summary-row">
                      <span>Tổng tiền:</span>
                      <strong>{formatMoneyFull(detailRoom.gameState.denominations.reduce((s, d) => s + d.value * d.quantity, 0))}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="detail-empty">Chưa thiết lập mệnh giá.</p>
              )}
              <div className="modal-actions">
                <button className="btn-primary" onClick={() => setDetailRoom(null)} style={{ width: '100%' }}>
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
