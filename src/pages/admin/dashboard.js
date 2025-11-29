import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminSidebar';
import AdminSidebar from './AdminSidebar';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import api from '../../utils/api';

const DashboardPage = () => {
  const [ordersSummary, setOrdersSummary] = useState({
    totalOrders: 0,
    newOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard-data')
      .then(res => {
        setOrdersSummary(res.data);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        api.get('/admin/stats')
          .then(res => {
            setOrdersSummary(res.data);
            setError(null);
          })
          .catch(err => {
            setError(err.response?.data?.message || 'Failed to fetch orders summary');
          })
          .finally(() => setLoading(false));
      });
  }, []);

  return (
    <div className="admin-dashboard-layout">
      <AdminNavbar />
      <div className="admin-main-wrapper">
        <aside className="admin-sidebar-panel">
          <div className="sidebar-content">
            <Link to="/admin/dashboard" className="sidebar-item active">
              <span>📊</span> Dashboards
            </Link>
            <Link to="/admin/products" className="sidebar-item">
              <span>📦</span> eCommerce
            </Link>
            <Link to="/admin/orders" className="sidebar-item">
              <span>📋</span> Analytics
            </Link>
            <Link to="/admin/customers" className="sidebar-item">
              <span>👥</span> CRM
            </Link>
            <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />
            <div className="sidebar-label">WEBAPPS</div>
            <Link to="/admin/transactions" className="sidebar-item">
              <span>💬</span> Chat
            </Link>
            <Link to="/admin/support" className="sidebar-item">
              <span>📧</span> Email
            </Link>
            <Link to="/admin/discounts" className="sidebar-item">
              <span>📝</span> Contact
            </Link>
            <Link to="/admin/returns" className="sidebar-item">
              <span>📄</span> Invoice
            </Link>
            <Link to="/admin/deals" className="sidebar-item">
              <span>📊</span> Kanban
            </Link>
            <Link to="/admin/discount-carousel" className="sidebar-item">
              <span>📅</span> Calendar
            </Link>
            <hr style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />
            <div className="sidebar-label">UI PANELS</div>
            <Link to="/admin/applock" className="sidebar-item">
              <span>👤</span> User Profile
            </Link>
            <div className="sidebar-item">
              <span>⚙️</span> Account Settings
            </div>
            <div className="sidebar-item">
              <span>📄</span> Other Pages
            </div>
          </div>
        </aside>
        <main className="admin-main-content">
          <div className="admin-header-row">
            <h2 className="admin-page-title">eCommerce</h2>
            <div className="admin-header-actions">
              <button className="admin-btn-icon">📊</button>
              <button className="admin-btn-icon">🔔</button>
              <button className="admin-btn-icon">👤</button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="dashboard-content">
              <div className="orders-grid">
                <div className="order-summary-card">
                  <h3>Performance Goal</h3>
                  <div className="card-metric">Monthly performance reports</div>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#007bff', marginTop: 12 }}>12.65%</p>
                  <button className="admin-btn" style={{ marginTop: 12 }}>View Reports</button>
                </div>
                <div className="order-summary-card">
                  <h3>Sales: $5,65K</h3>
                  <div style={{ textAlign: 'center', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '2rem', color: '#3b82f6' }}>60%</div>
                  </div>
                </div>
                <div className="order-summary-card">
                  <h3>Monthly Earning</h3>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ef4444', marginTop: 12 }}>$32.46K</p>
                  <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: 8 }}>📈 112.4%</div>
                </div>
              </div>

              <div className="orders-grid" style={{ marginTop: 24 }}>
                <div className="order-summary-card">
                  <h3>Total Orders</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: 12 }}>{ordersSummary.totalOrders}</p>
                </div>
                <div className="order-summary-card">
                  <h3>New Orders</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: 12 }}>{ordersSummary.newOrders}</p>
                </div>
                <div className="order-summary-card">
                  <h3>Completed Orders</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: 12 }}>{ordersSummary.completedOrders}</p>
                </div>
                <div className="order-summary-card revenue-card">
                  <h3>Total Revenue</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 700, marginTop: 12 }}>Ksh {ordersSummary.totalRevenue?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
