import React, { useState } from 'react';
import api from '../../utils/api';

const AppLockModal = ({ isOpen, onClose, onVerified }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/admin/applock/verify-pin', { pin });
      setPin('');
      setLoading(false);
      // pass the verified pin back to caller for actions that require the PIN
      if (onVerified) onVerified(pin);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid PIN');
      setPin('');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        padding: '32px',
        maxWidth: 400,
        width: '90%',
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 700 }}>🔐 Enter PIN</h2>
        <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '0.9rem' }}>
          This section is protected. Please enter your PIN to continue.
        </p>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: 6,
            marginBottom: 16,
            border: '1px solid #fcc',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyPin}>
          <div style={{ marginBottom: 24 }}>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 6))}
              placeholder="Enter your PIN"
              maxLength="6"
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: '1.1rem',
                textAlign: 'center',
                letterSpacing: '0.2em',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '⏳ Verifying...' : '✓ Verify'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppLockModal;
