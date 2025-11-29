import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import './OrderDetails.css';
import AdminNavbar from './AdminSidebar';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!order) return <div className="order-details-loading">Loading...</div>;

  const shipping = order.shippingAddress || {};

  return (
    <div className="order-details-container">
      <AdminNavbar />
      <h2 className="order-details-title">Order #{order.orderId}</h2>

      {/* 🧍 Customer Info */}
      <div className="order-section">
        <h3>Customer Information</h3>
        <div className="info-grid">
          <p><strong>Name:</strong> {order.user?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {order.user?.phone || 'N/A'}</p>
        </div>
      </div>

      {/* 🏠 Shipping Info */}
      <div className="order-section">
        <h3>Shipping Address</h3>
        <div className="info-grid">
          <p><strong>Full Name:</strong> {shipping.fullName || 'N/A'}</p>
          <p><strong>Phone:</strong> {shipping.phone || 'N/A'}</p>
          <p><strong>Address:</strong> {shipping.address || 'N/A'}</p>
          <p><strong>City:</strong> {shipping.city || 'N/A'}</p>
          {shipping.county && <p><strong>County:</strong> {shipping.county}</p>}
          {shipping.postalCode && <p><strong>Postal Code:</strong> {shipping.postalCode}</p>}
          {shipping.notes && <p><strong>Notes:</strong> {shipping.notes}</p>}
        </div>
      </div>

      {/* 📦 Products */}
      <div className="order-section">
        <h3>Products</h3>
        <ul className="order-items-list">
          {order.orderItems.map(item => (
            <li key={item._id} className="order-item">
              <span className="item-name">{item.product?.name}</span>
              <span className="item-details">
                x{item.qty} — <strong>KES {item.price.toFixed(2)}</strong>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 💰 Summary */}
      <div className="order-section">
        <h3>Order Summary</h3>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        <p><strong>Payment Status:</strong> <span style={{ fontWeight: 700, color: order.paymentStatus === 'Paid' ? '#4CAF50' : '#ff9800' }}>{order.paymentStatus || 'Unpaid'}</span></p>
        <p><strong>Total Price:</strong> KES {order.totalPrice.toFixed(2)}</p>
        {order.discountValue > 0 && (
          <p>
            <strong>Discount:</strong> {order.discountType === 'percent' ? `${order.discountValue}%` : `KES ${order.discountValue}`} 
            {order.couponCode && ` (Coupon: ${order.couponCode})`}
          </p>
        )}
        <p><strong>Final Amount:</strong> KES {order.finalAmount.toFixed(2)}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          { (order.paymentStatus || 'Unpaid') !== 'Paid' && (
            <>
              <button className="admin-btn-secondary" onClick={async () => {
                if (!confirm('Send payment reminder to customer?')) return;
                try {
                  await api.post(`/orders/${order._id}/send-payment-reminder`);
                  alert('Payment reminder sent');
                } catch (err) {
                  console.error(err);
                  alert(err.response?.data?.message || 'Failed to send reminder');
                }
              }}>Send Reminder</button>

              <button className="admin-btn-primary" onClick={async () => {
                if (!confirm('Mark this order as PAID? This will adjust stock and create a transaction record.')) return;
                try {
                  await api.put(`/orders/${order._id}/payment-status`, { paymentStatus: 'Paid' });
                  alert('Order marked as Paid');
                  window.location.reload();
                } catch (err) {
                  console.error(err);
                  alert(err.response?.data?.message || 'Failed to mark paid');
                }
              }}>Mark Paid</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
