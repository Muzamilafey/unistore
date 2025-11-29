import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./pages.css";
import { CartContext } from "../context/CartContext";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login to view your order");
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await api.get(`/orders/${orderId}`, config);
        setOrder(data);

        // Clear cart when payment is confirmed for Pesapal orders
        if (data && data.paymentMethod === 'Pesapal' && data.status === 'Processing') {
          try {
            clearCart();
          } catch (e) {
            console.warn('Could not clear cart after payment:', e.message || e);
          }
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, clearCart]);

  if (loading) return <div className="page-container"><p>Loading order details...</p></div>;

  if (error) {
    return (
      <div className="page-container">
        <h2>Order Error</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => navigate("/orders")} className="form-button">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "#4CAF50", fontSize: "2.5rem" }}>✓</h1>
        <h2>Order Confirmation</h2>
      </div>

      {order && (
        <div style={{ maxWidth: "600px", margin: "0 auto", border: "1px solid #ddd", padding: "1.5rem", borderRadius: "8px" }}>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Payment Status:</strong> <span style={{ fontWeight: 600, color: order.paymentStatus === 'Paid' ? '#4CAF50' : '#ff9800' }}>{order.paymentStatus || 'Unpaid'}</span></p>
          <p><strong>Total Amount:</strong> KES {order.finalAmount?.toFixed(2) || order.totalPrice?.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p><strong>Delivery Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>

          <h3>Order Items</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {order.orderItems?.map((item, idx) => (
              <li key={idx} style={{ borderBottom: "1px solid #3d9494ff", padding: "0.5rem 0" }}>
                <strong>{item.product?.name}</strong> x {item.qty} @ KES {item.price?.toFixed(2) || 0}
              </li>
            ))}
          </ul>

          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
            {order.paymentMethod === "Pesapal" && order.status === "Pending"
              ? "⏳ Payment Pending - Waiting for payment confirmation"
              : "✅ Payment Received"}
          </p>

          <button onClick={() => navigate("/orders")} className="form-button" style={{ marginTop: "1.5rem" }}>
            View All Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;

