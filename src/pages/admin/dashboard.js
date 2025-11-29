import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import api from '../../utils/api';

const DashboardPage = () => {
  const [ordersSummary, setOrdersSummary] = useState({
    totalOrders: 0,
    newOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    products: 0,
    customers: 0,
    returns: 0,
  });
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/dashboard-data');
        if (res?.data) {
          setOrdersSummary(prev => ({ ...prev, ...res.data }));
          if (res.data.recentActivity) setRecent(res.data.recentActivity);
        }
      } catch (e) {
        try {
          const s = await api.get('/admin/stats');
          if (s?.data) setOrdersSummary(prev => ({ ...prev, ...s.data }));
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        }
      }

      // Fallback: try transactions for recent/activity and revenue if available
      try {
        const t = await api.get('/admin/transactions');
        if (t?.data && Array.isArray(t.data)) {
          setRecent(t.data.slice(0, 8));
          const revenue = t.data.reduce((s, it) => s + Number(it.amount || 0), 0);
          setOrdersSummary(prev => ({ ...prev, totalRevenue: prev.totalRevenue || revenue }));
        }
      } catch (e) {
        // ignore
      }

      setLoading(false);
    };

    load();
  }, []);

  const formatCurrency = v => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0));

  return (
    <div className="admin-dashboard-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="admin-header-actions">
            <div className="admin-summary-inline">
              <div className="small-metric">
                <span className="label">Orders</span>
                <strong>{ordersSummary.totalOrders}</strong>
              </div>
              <div className="small-metric">
                <span className="label">Revenue</span>
                <strong>{formatCurrency(ordersSummary.totalRevenue)}</strong>
              </div>
              <div className="small-metric">
                <span className="label">Products</span>
                <strong>{ordersSummary.products}</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <section className="cards-grid" aria-label="summaries">
              <div className="card">
                <div className="card-row">
                  <div>
                    <div className="card-title">Total Orders</div>
                    <div className="card-value">{ordersSummary.totalOrders}</div>
                  </div>
                  <div className="card-icon">📦</div>
                </div>
                <div className="card-sub">Orders placed across all channels</div>
              </div>

              <div className="card">
                <div className="card-row">
                  <div>
                    <div className="card-title">Revenue</div>
                    <div className="card-value">{formatCurrency(ordersSummary.totalRevenue)}</div>
                  </div>
                  <div className="card-icon">💰</div>
                </div>
                <div className="card-sub">Gross collected</div>
              </div>

              <div className="card">
                <div className="card-row">
                  <div>
                    <div className="card-title">Products</div>
                    <div className="card-value">{ordersSummary.products}</div>
                  </div>
                  <div className="card-icon">🛒</div>
                </div>
                <div className="card-sub">Active product SKUs</div>
              </div>

              <div className="card">
                <div className="card-row">
                  <div>
                    <div className="card-title">Customers</div>
                    <div className="card-value">{ordersSummary.customers}</div>
                  </div>
                  <div className="card-icon">👥</div>
                </div>
                <div className="card-sub">Registered customers</div>
              </div>

              <div className="card">
                <div className="card-row">
                  <div>
                    <div className="card-title">Returns</div>
                    <div className="card-value">{ordersSummary.returns}</div>
                  </div>
                  <div className="card-icon">↩️</div>
                </div>
                <div className="card-sub">Items returned / refunded</div>
              </div>

              <div className="card wide">
                <div className="card-row">
                  <div>
                    <div className="card-title">Conversion</div>
                    <div className="card-value">—</div>
                  </div>
                  <div className="card-icon">📈</div>
                </div>
                <div className="card-sub">Conversion and other KPIs (coming soon)</div>
              </div>
            </section>

            <section className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="recent-list">
                {recent && recent.length ? (
                  recent.map((r, i) => (
                    <div key={r._id || i} className="recent-item">
                      <div className="recent-left">
                        <div className="recent-title">{r.title || r.type || r.description || `Activity ${i + 1}`}</div>
                        <div className="recent-sub">{r.sub || r.customer || (r.createdAt ? new Date(r.createdAt).toLocaleString() : '')}</div>
                      </div>
                      <div className="recent-right">
                        <div className="recent-meta">{r.amount ? formatCurrency(r.amount) : ''}</div>
                        <div className="recent-time">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-note">No recent activity to show.</div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
