import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../utils/api";
import "./Payment.css";

const Payment = ({ shippingAddress, discount = { type: null, value: 0 }, couponCode = null, shippingFee = 0 }) => {
  const { cartItems, clearCart } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState("Pay on Delivery");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPaymentIcon = (method) => {
    switch (method) {
      case "Pay on Delivery":
        return "🚚";
      case "Card":
        return "💳";
      case "Pesapal":
        return "🅿️";
      default:
        return "💰";
    }
  };

  // Cart subtotal
  const totalPrice = cartItems.reduce((a, c) => a + c.product.price * c.qty, 0);

  // Compute discount amount
  const discountAmount =
    discount.type === "percent"
      ? (totalPrice * discount.value) / 100
      : discount.type === "fixed"
      ? discount.value
      : 0;

  // Total = subtotal - discount + shipping fee
  const finalAmount = totalPrice - discountAmount + shippingFee;

  // Pesapal maximum allowed amount (frontend-configurable)
  const pesapalMax = Number(process.env.REACT_APP_PESAPAL_MAX_AMOUNT || 5000);

  // If cart total exceeds Pesapal limit and Pesapal is currently selected, fallback to Pay on Delivery
  useEffect(() => {
    if (paymentMethod === 'Pesapal' && finalAmount > pesapalMax) {
      setPaymentMethod('Pay on Delivery');
    }
  }, [finalAmount, pesapalMax, paymentMethod]);

  const handlePayment = async () => {
    if (!cartItems.length) {
      setMessage("⚠️ No items in cart");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const orderPayload = {
        orderItems: cartItems.map((i) => ({
          product: i.product._id,
          qty: i.qty,
        })),
        shippingAddress,
        paymentMethod,
        totalPrice,
        discount: discount,
        couponCode: couponCode,
        shippingFee,
        finalAmount,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("⚠️ Please login to continue");
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data: orderRes } = await api.post("/orders", orderPayload, config);
      // backend returns { message, order }
      const order = orderRes?.order || orderRes;

      if (paymentMethod === "Pesapal") {
        setMessage("🔄 Redirecting to Pesapal...");
        const pesapalPayload = {
          amount: finalAmount,
          email: shippingAddress.email,
          orderId: order._id || order?.order?._id || order?.id,
        };

        // Call backend which will SubmitOrderRequest to Pesapal and return the provider redirect URL
        try {
          const { data: pesapalResponse } = await api.post('/pesapal/initiate-payment', pesapalPayload, config);
          // pesapalResponse should include redirect_url when successful
          if (pesapalResponse && (pesapalResponse.redirect_url || pesapalResponse.redirectUrl)) {
            const redirectUrl = pesapalResponse.redirect_url || pesapalResponse.redirectUrl;
            // Redirect to Pesapal checkout immediately — do not clear cart here
            window.location.href = redirectUrl;
            return;
          } else {
            console.error('Pesapal initiation missing redirect_url:', pesapalResponse);
            setMessage('❌ Pesapal initiation failed. Please retry or choose another payment option.');
            setLoading(false);
            return;
          }
        } catch (initErr) {
          console.error('Pesapal initiation error:', initErr.response || initErr.message || initErr);
          setMessage('❌ Pesapal initiation failed. Please retry or choose another payment option.');
          setLoading(false);
          return;
        }
      } else {
        setMessage("✅ Order placed successfully (Pay on Delivery).");
        clearCart();
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage(`❌ ${err.response?.data?.message || "Payment failed. Try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>Payment</h2>

      <div className="address-box">
        <p>
          Deliver to: <strong>{shippingAddress.fullName}</strong> <br />
          {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.county || shippingAddress.country}
        </p>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <p>Subtotal: <strong>KES {totalPrice.toFixed(2)}</strong></p>
        {discount.value > 0 && (
          <p>
            Discount ({discount.type === "percent" ? `${discount.value}%` : `KES ${discount.value}`}):
            <strong> -KES {discountAmount.toFixed(2)}</strong>
          </p>
        )}
        {shippingFee > 0 && (
          <p>Shipping Fee: <strong>+KES {shippingFee.toFixed(2)}</strong></p>
        )}
        <p className="total-pay">
          Total Payable: <strong>KES {finalAmount.toFixed(2)}</strong>
        </p>
      </div>

      <div className="payment-options">
        <label className="option">
          <div className="option-icon">{getPaymentIcon("Pay on Delivery")}</div>
          <input
            type="radio"
            name="paymentMethod"
            value="Pay on Delivery"
            checked={paymentMethod === "Pay on Delivery"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          <span className="option-label">Pay on Delivery</span>
        </label>
        <label className="option">
          <div className="option-icon">{getPaymentIcon("Pesapal")}</div>
          <input
            type="radio"
            name="paymentMethod"
            value="Pesapal"
            checked={paymentMethod === "Pesapal"}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={finalAmount > pesapalMax}
            title={finalAmount > pesapalMax ? `Pesapal disabled for orders above KES ${pesapalMax}` : 'Pay with Pesapal'}
          />
          <span className="option-label">Pesapal</span>
        </label>
      </div>

      {finalAmount > pesapalMax && (
        <div style={{ marginTop: 8, color: '#b71c1c', fontSize: 14 }}>
          ⚠️ Pesapal is not available for orders above KES {pesapalMax.toLocaleString()}. Please choose Pay on Delivery or contact support to increase your Pesapal limit.
        </div>
      )}

      {/* No phone input required for Pesapal - amount is auto-filled on Pesapal site */}

      <button className="pay-btn" onClick={handlePayment} disabled={loading}>
        {loading
          ? "Processing..."
          : paymentMethod === "Pay on Delivery"
          ? "Place Order"
          : "Pay Now"}
      </button>

      {message && <p className="status-message">{message}</p>}

      {/* Loading overlay for Pesapal redirect */}
      {loading && paymentMethod === "Pesapal" && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
            <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: 600 }}>Redirecting to Pesapal...</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Please wait while we process your payment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
