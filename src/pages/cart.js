import React, { useContext } from 'react';

import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './cart.css';

const CartPage = () => {
  const { cartItems, removeFromCart, addToCart, shippingFee } = useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (a, c) => a + (Number(c.product?.price) || 0) * (c.qty || 0),
    0
  );

  const shipping = cartItems.length ? shippingFee : 0; // use shipping fee from context
  const totalAmount = totalPrice + shipping;

  const handleProceed = () => {
    navigate('/checkout');
  };

  const changeQty = (product, delta) => {
    // addToCart expects (product, qtyDelta)
    addToCart(product, delta);
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        🛒 Your cart is empty.<br />
        <button
          className="back-home"
          onClick={() => navigate('/')}
        >
          ⬅️ Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page-shell">
      <header className="cart-header">
        <button className="back" onClick={() => navigate(-1)}>←</button>
        <h3>My Cart</h3>
        <button className="more">⋯</button>
      </header>

      <main className="cart-container">
        <div className="cart-items">
          {cartItems.map(({ product, qty }) => (
            <div key={product?._id || Math.random()} className="cart-item-card">
              <img src={product.image || product.images?.[0]?.url || ''} alt={product?.name || 'Product'} />
              <div className="card-info">
                <div className="card-top">
                  <h4 className="product-title">{product.name}</h4>
                  <div className="price-pill">{(Number(product?.price) || 0).toLocaleString()}</div>
                </div>
                <div className="card-bottom">
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => changeQty(product, -1)} disabled={qty <= 1}>−</button>
                    <div className="qty-number">{qty}</div>
                    <button className="qty-btn" onClick={() => changeQty(product, 1)} disabled={product.stock && qty >= product.stock}>+</button>
                  </div>
                  <button className="remove-small" onClick={() => removeFromCart(product._id)}>···</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="cart-footer">
        <div className="totals">
          <div className="tot-row"><span>Sub Total</span><span>KES {Number(totalPrice).toLocaleString()}</span></div>
          <div className="tot-row"><span>Shipping</span><span>KES {Number(shipping).toLocaleString()}</span></div>
          <div className="tot-row total-amount"><strong>Total Amount</strong><strong>KES {Number(totalAmount).toLocaleString()}</strong></div>
        </div>
        <button className="checkout-action" onClick={handleProceed}>Checkout</button>
      </footer>
    </div>
  );
};

export default CartPage;
