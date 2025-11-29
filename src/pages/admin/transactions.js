import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminSidebar';
import api from '../../utils/api';
import AppLockModal from '../../components/admin/AppLockModal';
import ConfirmModal from '../../components/common/ConfirmModal';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [lastDeletedTx, setLastDeletedTx] = useState(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [pendingDeletePermanent, setPendingDeletePermanent] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

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

  const handleDeleteConfirm = (txId) => {
    setSelectedTxId(txId);
    setConfirmTitle('Delete Transaction');
    setConfirmMessage('Delete this transaction? It will be moved to trash and can be restored later.');
    setPendingDeletePermanent(false);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    // This function is invoked after PIN verification via AppLockModal
    const txId = pendingDeleteId || selectedTxId;
    if (!txId) return;
    try {
      if (pendingDeletePermanent) {
        await api.delete(`/admin/transactions/${txId}/permanent`);
        setTransactions(prev => prev.filter(t => t._id !== txId));
      } else {
        await api.delete(`/admin/transactions/${txId}`);
        // remove from current list
        setTransactions(prev => prev.filter(t => t._id !== txId));
        // set lastDeletedTx for undo
        const deleted = transactions.find(t => t._id === txId);
        setLastDeletedTx(deleted || { _id: txId });
        // set undo timer (8s)
        const id = setTimeout(() => setLastDeletedTx(null), 8000);
        setUndoTimeoutId(id);
      }
    } catch (err) {
      console.error('Failed to delete transaction', err);
      alert('Failed to delete transaction.');
    } finally {
      setConfirmOpen(false);
      setSelectedTxId(null);
      setPendingDeleteId(null);
      setPendingDeletePermanent(false);
      setShowLockModal(false);
    }
  };

  const handleUndo = async () => {
    if (!lastDeletedTx) return;
    try {
      await api.put(`/admin/transactions/${lastDeletedTx._id}/restore`);
      // re-fetch transactions to get updated list
      fetchTransactions();
      setLastDeletedTx(null);
      if (undoTimeoutId) clearTimeout(undoTimeoutId);
    } catch (err) {
      console.error('Failed to restore transaction', err);
      alert('Failed to restore.');
    }
  };

  const handleViewTrash = async () => {
    setShowTrash(!showTrash);
    if (!showTrash) {
      // load trashed
      try {
        const { data } = await api.get('/admin/transactions/trash');
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load trash', err);
        setError('Failed to load trash');
      }
    } else {
      fetchTransactions();
    }
  };

  const handlePermanentDelete = async (txId) => {
    setSelectedTxId(txId);
    setConfirmTitle('Permanently Delete');
    setConfirmMessage('Permanently delete this transaction? This cannot be undone.');
    setPendingDeletePermanent(true);
    setConfirmOpen(true);
  };

  const requestPinForPendingDelete = () => {
    // open AppLockModal to verify PIN before performing delete
    setPendingDeleteId(selectedTxId);
    setShowLockModal(true);
    setConfirmOpen(false);
  };

  const handleAppLockVerified = async (pin) => {
    // If there is a pending delete, perform it; otherwise, treat as general verification
    if (pendingDeleteId || selectedTxId) {
      // ensure pendingDeleteId is populated
      if (!pendingDeleteId) setPendingDeleteId(selectedTxId);
      await handleDelete();
    } else {
      setIsVerified(true);
      fetchTransactions();
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
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onVerified={handleAppLockVerified}
      />

      <AdminNavbar />
      <main className="admin-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <h2 className="admin-page-title">Transactions</h2>

        <div className="transactions-top">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
            <div className="transactions-search">
              <input type="text" placeholder="Search by id, customer, email or phone" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="admin-btn" onClick={handleViewTrash}>{showTrash ? 'Back to Transactions' : 'View Trash'}</button>
            </div>
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
                    {!showTrash ? (
                      <button className="tx-delete-btn" onClick={() => handleDeleteConfirm(tx._id)}>Delete</button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="admin-btn" onClick={() => {
                          // restore
                          api.put(`/admin/transactions/${tx._id}/restore`).then(() => setTransactions(prev => prev.filter(p => p._id !== tx._id))).catch(err => { console.error(err); alert('Failed to restore'); });
                        }}>Restore</button>
                        <button className="tx-delete-btn" onClick={() => handlePermanentDelete(tx._id)}>Delete Permanently</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lastDeletedTx && (
          <div style={{ position: 'fixed', right: 20, bottom: 20, background: '#111827', color: '#fff', padding: 12, borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', zIndex: 9999 }}>
            <div>Transaction deleted</div>
            <button onClick={handleUndo} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 8, fontWeight: 700 }}>Undo</button>
            <button onClick={() => setLastDeletedTx(null)} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 10px', borderRadius: 8 }}>Dismiss</button>
          </div>
        )}

        <ConfirmModal isOpen={confirmOpen} title={confirmTitle || 'Confirm'} message={confirmMessage || ''} onCancel={() => setConfirmOpen(false)} onConfirm={requestPinForPendingDelete} />
      </main>
    </div>
  );
};

export default AdminTransactions;
