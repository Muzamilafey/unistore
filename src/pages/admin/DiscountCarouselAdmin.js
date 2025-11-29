import React, { useEffect, useState, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import './DiscountCarouselAdmin.css';

const DiscountCarouselAdmin = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [saved, setSaved] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products', { params: { limit: 100 } });
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/discounted-carousel');
        // API returns { products, discountPercent }
        const products = data.products || [];
        setSelected(products.map(p => p._id));
        if (typeof data.discountPercent !== 'undefined') setDiscountPercent(Number(data.discountPercent));
      } catch (err) {
        console.error('Failed to load current carousel:', err);
      }
    };
    load();
  }, []);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id] // no cap (unlimited)
    );
  };

  const save = async () => {
    try {
      await api.post('/admin/discounted-carousel', { productIds: selected, discountPercent: Number(discountPercent) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save carousel:', err);
    }
  };

  if (!user || user.role !== 'admin') {
    return <p>Admin access required.</p>;
  }

  return (
    <div className="dca-page">
      <h2>Manage Discounted Carousel</h2>
      <p className="dca-note">Select products to display on the homepage carousel:</p>

      <div className="dca-grid">
        {products.map(p => (
          <div
            key={p._id}
            className={`dca-item ${selected.includes(p._id) ? 'selected' : ''}`}
            onClick={() => toggle(p._id)}
          >
            <img src={p.image || p.images?.[0]?.url} alt={p.name} />
            <div className="dca-name">{p.name}</div>
            <div className="dca-price">KES {Number(p.price || 0).toFixed(0)}</div>
            <div className="dca-check">{selected.includes(p._id) ? '✓' : ''}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>Discount percent to apply:</label>
        <input
          type="number"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          min="0"
          max="100"
          style={{ width: 100, padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd' }}
        />
        <span style={{ marginLeft: 8, color: '#666' }}>%</span>
      </div>

      <div className="dca-actions">
        <button onClick={save} className="save-btn">Save Carousel ({selected.length})</button>
        {saved && <span className="dca-success">✓ Saved!</span>}
      </div>
    </div>
  );
};

export default DiscountCarouselAdmin;
