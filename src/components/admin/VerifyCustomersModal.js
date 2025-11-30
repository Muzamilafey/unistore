import React, { useState, useEffect } from 'react';
import './VerifyCustomersModal.css';

const VerifyCustomersModal = ({ isOpen, onClose, authToken, apiUrl, onVerified }) => {
  const [unverifiedCustomers, setUnverifiedCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const baseUrl = apiUrl || process.env.REACT_APP_API_URL || window.location.origin;

  // Fetch unverified customers
  const fetchUnverifiedCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = authToken || localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/admin/unverified-customers`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUnverifiedCustomers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch unverified customers');
      }
    } catch (err) {
      setError('Error fetching unverified customers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify a customer
  const verifyCustomer = async (userId) => {
    try {
      const token = authToken || localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/admin/verify-customer/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(`✅ ${data.user.email} verified successfully!`);
        // Remove from list
        setUnverifiedCustomers(
          unverifiedCustomers.filter((u) => u._id !== userId)
        );
        // Notify parent to refresh counts/lists
        if (onVerified && typeof onVerified === 'function') onVerified();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(data.message || 'Failed to verify customer');
      }
    } catch (err) {
      setError('Error verifying customer: ' + err.message);
    }
  };

  // Fetch on modal open
  useEffect(() => {
    if (isOpen) {
      fetchUnverifiedCustomers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content verify-customers-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Verify Customers</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {successMsg && <div className="success-msg">{successMsg}</div>}
        {error && <div className="error-msg">{error}</div>}

        <div className="modal-body">
          {loading ? (
            <p className="loading">Loading unverified customers...</p>
          ) : unverifiedCustomers.length === 0 ? (
            <p className="no-data">
              ✅ All customers have verified their emails!
            </p>
          ) : (
            <div className="customers-list">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unverifiedCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="verify-btn"
                          onClick={() => verifyCustomer(customer._id)}
                          title="Click to verify this customer"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
          <button
            className="refresh-btn"
            onClick={fetchUnverifiedCustomers}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCustomersModal;
