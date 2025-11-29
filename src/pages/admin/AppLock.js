import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import AdminNavbar from './AdminSidebar';
import './AdminDashboard.css';

const AdminAppLock = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [lockStatus, setLockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchLockStatus();
  }, []);

  const fetchLockStatus = async () => {
    try {
      const { data } = await api.get('/admin/applock/status');
      setLockStatus(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching lock status:', err);
      setError('Failed to load lock status');
      setLoading(false);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be between 4-6 digits');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }

    try {
      // If changing existing PIN, prompt for current PIN
      let previousPin = undefined;
      if (lockStatus?.hasPin) {
        previousPin = window.prompt('Enter your current PIN to confirm change');
        if (!previousPin) {
          setError('Current PIN required to change PIN');
          return;
        }
      }

      await api.post('/admin/applock/set-pin', { pin, previousPin });
      setSuccess('PIN set successfully!');
      setPin('');
      setConfirmPin('');
      setShowForm(false);
      fetchLockStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set PIN');
    }
  };

  const handleToggleAppLock = async (enabled) => {
    try {
      let body = { isEnabled: enabled };
      // if we're disabling, require current PIN confirmation
      if (!enabled) {
        const current = window.prompt('Enter current PIN to disable app lock');
        if (!current) {
          setError('Current PIN required to disable lock');
          return;
        }
        body.previousPin = current;
      }
      await api.put('/admin/applock/toggle', body);
      fetchLockStatus();
      setSuccess(`App lock ${enabled ? 'enabled' : 'disabled'} successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle app lock');
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-orders-bg">
      <AdminNavbar />
      <main className="admin-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', minHeight: '80vh' }}>
        <h2 className="admin-page-title" style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 32 }}>
          🔐 App Lock Settings
        </h2>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid #fcc',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#efe',
            color: '#3c3',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid #cfc',
          }}>
            {success}
          </div>
        )}

        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>App Lock Status</h3>
              <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                {lockStatus?.hasPin ? '✓ PIN configured' : '✗ No PIN set yet'}
              </p>
            </div>
            {lockStatus?.hasPin && (
              <button
                className="admin-btn-primary"
                onClick={() => handleToggleAppLock(!lockStatus?.isEnabled)}
                style={{ background: lockStatus?.isEnabled ? '#dc2626' : '#10b981' }}
              >
                {lockStatus?.isEnabled ? 'Disable Lock' : 'Enable Lock'}
              </button>
            )}
          </div>
        </div>

        {!showForm ? (
          <button
            className="admin-btn-primary"
            onClick={() => setShowForm(true)}
            style={{ marginBottom: 24 }}
          >
            {lockStatus?.hasPin ? '📝 Change PIN' : '🔒 Set PIN'}
          </button>
        ) : (
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: 24,
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
              {lockStatus?.hasPin ? 'Change PIN' : 'Set Your PIN'}
            </h3>

            <form onSubmit={handleSetPin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Enter PIN (4-6 digits)
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.slice(0, 6))}
                  placeholder="Enter your PIN"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Confirm PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.slice(0, 6))}
                  placeholder="Confirm your PIN"
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="admin-btn-primary">
                  Save PIN
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setPin('');
                    setConfirmPin('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              color: '#92400e',
              padding: '12px 16px',
              borderRadius: 6,
              marginTop: 16,
              fontSize: '0.9rem',
            }}>
              <strong>⚠️ Important:</strong> Keep your PIN safe and secure. You'll need it to access transactions.
            </div>
          </div>
        )}

        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          padding: '16px',
          borderRadius: 8,
          lineHeight: '1.6',
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>ℹ️ How it works:</h4>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Set a 4-6 digit PIN to protect your transactions page</li>
            <li>When you or another admin tries to view transactions, you'll be asked to enter your PIN</li>
            <li>The app lock is personal to each admin account</li>
            <li>You can enable or disable the lock anytime</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default AdminAppLock;
