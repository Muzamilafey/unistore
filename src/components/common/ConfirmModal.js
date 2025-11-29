import React from 'react';

const ConfirmModal = ({ isOpen, title = 'Confirm', message = '', onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ width: '92%', maxWidth: 460, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 12px 40px rgba(2,6,23,0.2)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ color: '#334155', marginTop: 8 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#ef4444,#f97316)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
