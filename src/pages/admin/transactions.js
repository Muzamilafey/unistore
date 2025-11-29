import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminSidebar';
import api from '../../utils/api';
import AppLockModal from '../../components/admin/AppLockModal';
import './AdminDashboard.css';
import './transactions.css';

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

  const handleDelete = async (txId) => {
    const ok = window.confirm('Delete this transaction? This action cannot be undone.');
    if (!ok) return;
    try {
      await api.delete(`/admin/transactions/${txId}`);
      setTransactions(prev => prev.filter(t => t._id !== txId));
    } catch (err) {
      console.error('Failed to delete transaction', err);
      alert('Failed to delete transaction.');
    }
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

        <div className="transactions-top">
          <div className="transactions-search">
            <input type="text" placeholder="Search by id, customer, email or phone" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="transactions-card-wrap">
          <div className="transactions-card">
            <div className="label">Total Received</div>
            <div className="value">KES {Number(totalReceived).toLocaleString()}</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>All successful transactions</div>
          </div>
        </div>

        <div className="transactions-table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx._id}>
                  <td>{tx._id}</td>
                  <td>{tx.user?.name || '—'}</td>
                  <td>{tx.user?.email || '—'}</td>
                  <td>{tx.phoneNumber || tx.user?.phone || '—'}</td>
                  <td className="tx-amount">KES {(Number(tx.amount) || 0).toFixed(2)}</td>
                  <td>
                    <span className={`tx-status ${((tx.status||'').toString().toLowerCase().includes('paid'))?'paid':((tx.status||'').toString().toLowerCase().includes('pending')?'pending':'failed')}`}>
                      {tx.status || '—'}
                    </span>
                  </td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="tx-delete-btn" onClick={() => handleDelete(tx._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminTransactions;
