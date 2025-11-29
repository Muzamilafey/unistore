import React, { useState, useEffect } from 'react';
import './DealForm.css';
import api from '../../utils/api';

const DealForm = ({ deal, onSave }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    discountType: 'percent',
    discountValue: '',
    productIds: [],
    category: '',
    startDate: '',
    endDate: '',
    active: true,
    bannerImage: ''
  });
  const [products, setProducts] = useState([]);
  const [productQuery, setProductQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get('/products')
      .then(({ data }) => mounted && setProducts(data))
      .catch(err => console.error('Failed to load products', err));
    if (deal) setForm(f => ({ ...f, ...deal }));
    return () => (mounted = false);
    // eslint-disable-next-line
  }, [deal]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleProduct = id => {
    setForm(f => {
      const has = f.productIds.includes(id);
      return { ...f, productIds: has ? f.productIds.filter(x => x !== id) : [...f.productIds, id] };
    });
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    // For demo: convert to base64
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, bannerImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (deal) {
        res = await api.put(`/deals/${deal._id}`, form);
      } else {
        res = await api.post('/deals', form);
      }
      onSave && onSave(res.data);
    } catch (err) {
      console.error('Failed to save deal', err);
      // optionally surface error to UI
    }
  };

  return (
    <form className="deal-form" onSubmit={handleSubmit}>
      <h2>{deal ? 'Edit Deal' : 'Add Deal'}</h2>
      <label>Title<input name="title" value={form.title} onChange={handleChange} required /></label>
      <label>Description<textarea name="description" value={form.description} onChange={handleChange} /></label>
      <label>Discount Type
        <select name="discountType" value={form.discountType} onChange={handleChange}>
          <option value="percent">Percent</option>
          <option value="flat">Flat</option>
        </select>
      </label>
      <label>Discount Value<input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} required /></label>
      <label>Products
        <div className="product-multiselect">
          <div className="chips" onClick={() => setShowDropdown(s => !s)}>
            {form.productIds && form.productIds.length ? (
              form.productIds.map(pid => {
                const p = products.find(x => x._id === pid) || { name: pid };
                return (
                  <span key={pid} className="chip">
                    {p.name}
                    <button type="button" className="chip-remove" onClick={(e) => { e.stopPropagation(); toggleProduct(pid); }}>×</button>
                  </span>
                );
              })
            ) : (
              <span className="placeholder">Select products...</span>
            )}
          </div>

          <div className="multi-controls">
            <input
              className="product-search"
              type="text"
              placeholder="Search products..."
              value={productQuery}
              onChange={e => setProductQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
            />
          </div>

          {showDropdown && (
            <div className="product-list" role="listbox">
              {products.filter(p => p.name.toLowerCase().includes(productQuery.toLowerCase())).slice(0, 50).map(p => {
                const imgUrl = p.image || (p.images && (Array.isArray(p.images) && (p.images[0]?.url || p.images[0])));
                return (
                <label key={p._id} className="product-item">
                  <input type="checkbox" checked={form.productIds.includes(p._id)} onChange={() => toggleProduct(p._id)} />
                  {imgUrl ? (
                    <img src={imgUrl} alt={p.name} />
                  ) : (
                    <div className="thumb-placeholder">📦</div>
                  )}
                  <div className="product-meta">
                    <div className="product-name">{p.name}</div>
                    <div className="product-sub">Ksh {Number(p.price || 0).toLocaleString()}</div>
                  </div>
                </label>
              )})}
              {products.filter(p => p.name.toLowerCase().includes(productQuery.toLowerCase())).length === 0 && (
                <div className="no-results">No products match.</div>
              )}
            </div>
          )}
        </div>
      </label>
      <label>Category<input name="category" value={form.category} onChange={handleChange} /></label>
      <label>Start Date<input name="startDate" type="date" value={form.startDate?.slice(0,10) || ''} onChange={handleChange} required /></label>
      <label>End Date<input name="endDate" type="date" value={form.endDate?.slice(0,10) || ''} onChange={handleChange} required /></label>
      <label>Active<input name="active" type="checkbox" checked={form.active} onChange={handleChange} /></label>
      <label>Banner Image<input name="bannerImage" type="file" accept="image/*" onChange={handleImageUpload} /></label>
      {form.bannerImage && <img src={form.bannerImage} alt="Banner preview" style={{ maxWidth: 200, margin: '10px 0' }} />}
      <button type="submit">{deal ? 'Update' : 'Create'} Deal</button>
    </form>
  );
};

export default DealForm;
