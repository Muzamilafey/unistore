import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './ShippingFeeModal.css';

const ShippingFeeModal = ({ onClose, onUpdated }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Standard Shipping Fee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch current shipping fee
    const fetchFee = async () => {
      try {
        const { data } = await api.get('/admin/shipping-fees');
        setAmount(data.amount || '');
        setDescription(data.description || 'Standard Shipping Fee');
      } catch (err) {
        console.error('Failed to fetch shipping fee', err);
      }
    };
    fetchFee();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (amount === '' || isNaN(amount)) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      await api.post('/admin/shipping-fees', {
        amount: parseFloat(amount),
        description
      });
      setSuccess('✅ Shipping fee updated successfully!');
      setTimeout(() => {
        onUpdated?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update shipping fee');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className && e.target.className.includes('modal-overlay')) onClose();
    }}>
      <div className="shipping-fee-modal">
        <h2>Manage Shipping Fee</h2>
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Shipping Fee Amount (KES)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 150.00"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Standard Shipping Fee"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Shipping Fee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingFeeModal;
