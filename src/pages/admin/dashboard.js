import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import api from '../../utils/api';
import AdminNavbar from './AdminSidebar';
import CategoryModal from '../../components/admin/CategoryModal';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement);

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
  const [showCategories, setShowCategories] = useState(false);

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

      // Try fetching recent orders specifically (preferred)
      try {
        const o = await api.get('/admin/orders?limit=8');
        if (o?.data) {
          const orders = Array.isArray(o.data) ? o.data : (o.data.orders || o.data.docs || []);
          if (orders.length) {
            setRecent(orders.slice(0, 8));
            const revenue = orders.reduce((s, it) => s + Number(it.totalAmount || it.amount || 0), 0);
            setOrdersSummary(prev => ({ ...prev, totalRevenue: prev.totalRevenue || revenue }));
          }
        }
      } catch (e) {
        // fallback to transactions
        try {
          const t = await api.get('/admin/transactions');
          if (t?.data && Array.isArray(t.data)) {
            setRecent(t.data.slice(0, 8));
            const revenue = t.data.reduce((s, it) => s + Number(it.amount || 0), 0);
            setOrdersSummary(prev => ({ ...prev, totalRevenue: prev.totalRevenue || revenue }));
          }
        } catch (ee) {
          // ignore
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  const formatCurrency = v => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(Number(v || 0));

  // prepare chart data from recent orders (monthly sums)
  const getSalesChartData = () => {
    // Create last 12 months labels
    const labels = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('default', { month: 'short' }));
    }
    const sums = labels.map(() => 0);
    (recent || []).forEach(o => {
      const d = new Date(o.createdAt || o.created_at || o.date || Date.now());
      const idx = labels.findIndex(l => new Date(now.getFullYear(), now.getMonth() - (11 - labels.indexOf(l)), 1).getMonth() === d.getMonth());
      if (idx >= 0) sums[idx] += Number(o.totalAmount || o.amount || o.price || 0);
    });
    return {
      labels,
      datasets: [
        {
          label: 'Sales',
          data: sums,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.08)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  const getDonutData = () => {
    const inProgress = (recent || []).filter(r => (r.status || '').toLowerCase().includes('processing') || (r.status || '').toLowerCase().includes('pending')).length;
    const finished = (recent || []).filter(r => (r.status || '').toLowerCase().includes('completed') || (r.status || '').toLowerCase().includes('delivered')).length;
    const notStarted = Math.max(0, (recent || []).length - inProgress - finished);
    return {
      labels: ['In Progress', 'Finished', 'Not Started'],
      datasets: [{ data: [inProgress, finished, notStarted], backgroundColor: ['#ff7a45', '#4f46e5', '#94a3b8'] }]
    };
  };

  const exportOrdersPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text('Recent Orders', 14, 16);
    autoTable(doc, {
      head: [['No', 'Order ID', 'Date', 'Customer', 'Amount', 'Status']],
      body: (recent || []).map((r, i) => [i + 1, r.orderId || r._id || '—', r.createdAt ? new Date(r.createdAt).toLocaleString() : '—', r.customerName || r.customer || '-', formatCurrency(r.totalAmount || r.amount || 0), r.status || '-']),
      startY: 22,
    });
    doc.save('recent-orders.pdf');
  };

  const printDashboard = () => {
    window.print();
  };

  return (
    <div className="admin-dashboard-page">
      <AdminNavbar />
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
            <div style={{ marginLeft: 16, display: 'flex', gap: 8 }}>
              <button className="admin-btn-secondary" onClick={exportOrdersPDF}>Export PDF</button>
              <button className="admin-btn-secondary" onClick={printDashboard}>Print</button>
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
            <section className="top-metrics">
              <div className="metric-card c1">
                <div className="metric-label">New Customer</div>
                <div className="metric-value">{ordersSummary.customers || 0}</div>
                <div className="metric-sub">{Math.round((ordersSummary.customers || 0) * 0.1)}% | This month</div>
              </div>
              <div className="metric-card c2">
                <div className="metric-label">Running Orders</div>
                <div className="metric-value">{ordersSummary.totalOrders || 0}</div>
                <div className="metric-sub">{Math.round((ordersSummary.totalOrders || 0) * 0.1)}% | This month</div>
              </div>
              <div className="metric-card c3">
                <div className="metric-label">Total Profit</div>
                <div className="metric-value">{formatCurrency(ordersSummary.totalRevenue || 0)}</div>
                <div className="metric-sub">{Math.round((ordersSummary.totalRevenue || 0) * 0.01)}% | This month</div>
              </div>
              <div className="metric-card c4">
                <div className="metric-label">Order Completed</div>
                <div className="metric-value">{ordersSummary.completedOrders || 0}</div>
                <div className="metric-sub">{ordersSummary.completedOrders ? '10% ↑ | This month' : ''}</div>
              </div>
            </section>

            <section className="main-grid">
              <div className="sales-overview card-panel">
                <div className="panel-header">
                  <h3>Sales Overview</h3>
                  <div className="panel-controls">
                    <button className="admin-btn-secondary">This Year</button>
                  </div>
                </div>
                <div style={{ height: 260 }}>
                  <Line data={getSalesChartData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </div>

              <div className="sales-reports card-panel">
                <div className="panel-header">
                  <h3>Sales Reports</h3>
                  <div className="panel-controls small">This Year</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 180, height: 180 }}>
                    <Doughnut data={getDonutData()} options={{ maintainAspectRatio: false }} />
                  </div>
                  <div className="report-summary">
                    <div className="report-amount">{formatCurrency(ordersSummary.totalRevenue || 0)}</div>
                    <div className="report-note">{ordersSummary.totalRevenue ? '+$150 today' : ''}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="recent-orders card-panel">
              <div className="panel-header">
                <h3>Recent Orders</h3>
                <div className="panel-controls" style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowCategories(true)} className="see-all" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', textDecoration: 'underline' }}>Manage Categories</button>
                  <a href="#" className="see-all">See All</a>
                </div>
              </div>
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Product Name</th>
                      <th>Customers</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(recent && recent.length ? recent : []).map((r, i) => (
                      <tr key={r._id || i}>
                        <td>{String(i + 1).padStart(2, '0')}</td>
                        <td>{r.orderId || r._id || '—'}</td>
                        <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {((r.items && r.items[0]?.image) || r.image || r.items?.[0]?.images?.[0]) ? (
                              <img src={r.items && r.items[0]?.image ? r.items[0].image : (r.image || r.items?.[0]?.images?.[0])} alt="prod" style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                              <div style={{ width:46, height:46, borderRadius:8, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center' }}>📦</div>
                            )}
                            <div>{(r.items && r.items[0]?.name) || r.productName || '—'}</div>
                          </div>
                        </td>
                        <td>{r.customerName || r.customer || r.user?.name || '—'}</td>
                        <td>{r.amount ? formatCurrency(r.amount) : '—'}</td>
                        <td><span className={`admin-status admin-status-${(r.status || 'Pending')}`}>{r.status || 'Pending'}</span></td>
                        <td><button className="btn">View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      {showCategories && <CategoryModal onClose={() => setShowCategories(false)} onCreated={() => {}} />}
    </div>
  );
};

export default DashboardPage;
