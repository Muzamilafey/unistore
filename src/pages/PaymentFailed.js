import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./pages.css";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const [orderId] = useState(searchParams.get("orderId"));
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "#f44336", fontSize: "2.5rem" }}>✕</h1>
        <h2>Payment Failed</h2>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", border: "1px solid #f44336", padding: "1.5rem", borderRadius: "8px", backgroundColor: "#ffebee" }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          Your payment could not be processed. Your order has been cancelled.
        </p>

        {orderId && (
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Order ID: <code>{orderId}</code>
          </p>
        )}

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
          <button
            onClick={() => navigate("/cart")}
            className="form-button"
            style={{ flex: 1 }}
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate("/")}
            className="form-button"
            style={{ flex: 1 }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
