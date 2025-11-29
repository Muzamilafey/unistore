import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api from "../utils/api";
import "./Payment.css";

const Payment = ({ shippingAddress, discount = { type: null, value: 0 }, couponCode = null }) => {
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

  const finalAmount = totalPrice - discountAmount;

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
        setMessage(" Redirecting to Pesapal for payment...");
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
            // Redirect to Pesapal checkout (pre-filled by Pesapal) — do not clear cart here
            window.location.href = redirectUrl;
            return;
          } else {
            console.error('Pesapal initiation missing redirect_url:', pesapalResponse);
            setMessage('❌ Pesapal initiation failed. retry or choose another payment option');
            return;
          }
        } catch (initErr) {
          console.error('Pesapal initiation error:', initErr.response || initErr.message || initErr);
          setMessage('❌ Pesapal initiation failed.retry or choose another payment option');
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
          />
          <span className="option-label">Pesapal</span>
        </label>
      </div>

      {/* No phone input required for Pesapal - amount is auto-filled on Pesapal site */}

      <button className="pay-btn" onClick={handlePayment} disabled={loading}>
        {loading
          ? "Processing..."
          : paymentMethod === "Pay on Delivery"
          ? "Place Order"
          : "Pay Now"}
      </button>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default Payment;
