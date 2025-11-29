import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './pages.css';

const Pay = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setMessage('No order specified');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('Please login to continue to payment');
          setLoading(false);
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await api.get(`/orders/${orderId}`, config);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setMessage(err.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePayNow = async () => {
    if (!order) return;
    setMessage('Redirecting to payment provider...');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        amount: order.finalAmount || order.totalPrice,
        email: order.user?.email,
        orderId: order._id,
      };
      const { data } = await api.post('/pesapal/initiate-payment', payload, config);
      const redirectUrl = data.redirect_url || data.redirectUrl || data.data?.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setMessage('Payment initiation failed. Please try another method.');
        console.error('Pesapal initiate response', data);
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setMessage(err.response?.data?.message || 'Payment initiation failed');
    }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  if (message && !order) return (
    <div className="page-container">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="page-container">
      <h2>Complete Payment</h2>
      {order && (
        <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', padding: 20, borderRadius: 8 }}>
          <p><strong>Order ID:</strong> {order.orderId || order._id}</p>
          <p><strong>Amount:</strong> KES {(order.finalAmount || order.totalPrice).toFixed(2)}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p><strong>Payment Status:</strong> {order.paymentStatus || 'Unpaid'}</p>

          <div style={{ marginTop: 16 }}>
            <button className="form-button" onClick={handlePayNow}>Pay Now</button>
            <button className="form-button" style={{ marginLeft: 8 }} onClick={() => navigate('/orders')}>Back to Orders</button>
          </div>

          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      )}
    </div>
  );
};

export default Pay;
