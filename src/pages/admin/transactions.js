import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminSidebar';
import api from '../../utils/api';
import AppLockModal from '../../components/admin/AppLockModal';
import './AdminDashboard.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showLockModal, setShowLockModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [lockStatus, setLockStatus] = useState(null);

  useEffect(() => {
    checkAppLockStatus();
  }, []);

  const checkAppLockStatus = async () => {
    try {
      const { data } = await api.get('/admin/applock/status');
      setLockStatus(data);
      if (data.hasPin && data.isEnabled) {
        setShowLockModal(true);
        setLoading(false);
      } else {
        fetchTransactions();
      }
    } catch (err) {
      console.error('Failed to check app lock status', err);
      fetchTransactions();
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get('/admin/transactions');
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = () => {
    setIsVerified(true);
    fetchTransactions();
  };

  const filtered = transactions.filter(t =>
    (t._id || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.phoneNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  // compute total received (sum of successful/paid transactions)
  const totalReceived = transactions.reduce((sum, t) => {
    const amt = Number(t.amount) || 0;
    const st = (t.status || '').toString().toLowerCase();
    if (st.includes('paid') || st.includes('completed') || st.includes('accepted') || st.includes('success')) {
      return sum + amt;
    }
    return sum;
  }, 0);

  if (loading) return <div className="admin-loading">Loading transactions...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-orders-bg">
      <AppLockModal
        isOpen={showLockModal && !isVerified}
        onClose={() => {}}
        onVerified={handleVerified}
      />

      <AdminNavbar />
      <main className="admin-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <h2 className="admin-page-title">Transactions</h2>
        <div className="admin-summary-cards" style={{ marginBottom: 12 }}>
          <div className="admin-summary-card">
            <div className="admin-summary-title">Total Received</div>
            <div className="admin-summary-value">KES {Number(totalReceived).toLocaleString()}</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>All successful transactions</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search by id, customer, email or phone"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px', width: 360 }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Customer</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Phone</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Amount</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{tx._id}</td>
                <td style={{ padding: 8 }}>{tx.user?.name || '—'}</td>
                <td style={{ padding: 8 }}>{tx.user?.email || '—'}</td>
                <td style={{ padding: 8 }}>{tx.phoneNumber || tx.user?.phone || '—'}</td>
                <td style={{ padding: 8 }}>KES {(Number(tx.amount) || 0).toFixed(2)}</td>
                <td style={{ padding: 8 }}>{tx.status || '—'}</td>
                <td style={{ padding: 8 }}>{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default AdminTransactions;
