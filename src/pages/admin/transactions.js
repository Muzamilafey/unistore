import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminSidebar';
import api from '../../utils/api';
import './AdminDashboard.css';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter(t =>
    (t._id || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.phoneNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading transactions...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-orders-bg">
      <AdminNavbar />
      <main className="admin-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <h2 className="admin-page-title">Transactions</h2>
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
