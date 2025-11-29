import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import './AdminsModal.css';

const AdminsModal = ({ onClose }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError('');
      try {
        // Try a dedicated endpoint first, fallback to users endpoint filtered by role
        let res;
        try {
          res = await api.get('/admin/admins');
        } catch (e) {
          res = await api.get('/admin/users?role=admin');
        }
        const data = res?.data || [];
        // Normalize possible wrapper objects
        const arr = Array.isArray(data) ? data : (data.users || data.docs || []);
        setAdmins(arr);
      } catch (err) {
        console.error('Failed to load admins', err);
        setError('Failed to load admins');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target.className && e.target.className.includes('modal-overlay')) onClose(); }}>
      <div className="admins-modal">
        <h3>Admins</h3>
        {loading ? (
          <div className="loading">Loading admins...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="admins-list">
            {admins.length === 0 && <div style={{ color: '#666' }}>No admins found.</div>}
            {admins.map(a => (
              <div key={a._id || a.id || a.email} className="admin-row">
                <div className="admin-info">
                  <div className="admin-name">{a.name || a.fullName || a.username || a.email}</div>
                  <div className="admin-email">{a.email || '—'}</div>
                </div>
                <div className="admin-actions">
                  <a href={`mailto:${a.email}`} className="small">Email</a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AdminsModal;
