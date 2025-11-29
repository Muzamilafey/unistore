import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import './CategoryModal.css';

const CategoryModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load admin categories', err);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return setError('Name required');
    setLoading(true);
    try {
      const { data } = await api.post('/admin/categories', { name: name.trim() });
      setName('');
      setError('');
      setCategories(c => [data, ...c]);
      onCreated && onCreated(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(c => c.filter(x => x._id !== id));
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target.className && e.target.className.includes('modal-overlay')) onClose(); }}>
      <div className="category-modal">
        <h3>Manage Categories</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="New category" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={handleCreate} disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
        </div>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <div className="category-list">
          {categories.map(c => (
            <div key={c._id} className="category-row">
              <div>{c.name}</div>
              <div>
                <button className="small" onClick={() => handleDelete(c._id)}>Delete</button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <div style={{ color: '#666' }}>No categories yet.</div>}
        </div>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
