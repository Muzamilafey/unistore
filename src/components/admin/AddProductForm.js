import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './AddProductForm.css';
import axios from '../../utils/api';

// Props:
// - product: optional product object for editing
// - onDone: callback when operation completes (add or update)
const AddProductForm = ({ product = null, onDone = () => {} }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // new File objects to upload
  const [existingImages, setExistingImages] = useState([]); // existing image URLs (when editing)
  const [previews, setPreviews] = useState([]); // previews for new files: {file, url}
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // populate when editing
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price != null ? String(product.price) : '');
      setDescription(product.description || '');
      setCategory(product.category || '');
      setStock(product.stock != null ? String(product.stock) : '0');
      // product may have images[] or image url
      const urls = [];
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((it) => {
          if (typeof it === 'string') urls.push(it);
          else if (it.url) urls.push(it.url);
        });
      }
      if (product.image && typeof product.image === 'string') urls.push(product.image);
      setExistingImages(urls);
    }

    // fetch admin categories (prefer admin-managed list, fallback to product distinct categories)
    let mounted = true;
    const loadCats = async () => {
      try {
        const { data } = await axios.get('/admin/categories');
        if (mounted) setCategories((data || []).map(c => c.name));
        return;
      } catch (e) {
        // fallback
      }
      try {
        const { data } = await axios.get('/products/categories');
        if (mounted) setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCats();

    return () => { mounted = false; };
  }, [product]);

  const onDrop = useCallback((acceptedFiles) => {
    const files = acceptedFiles.slice(0, 5); // limit to 5 files
    setImages(files);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true,
  });

  // build previews whenever images change; createObjectURL urls are revoked in the cleanup
  useEffect(() => {
    const next = images.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);

    return () => {
      next.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [images]);

  const removeExistingImage = (url) => {
    setExistingImages(existingImages.filter((u) => u !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('stock', stock);

      // include any existing image URLs to keep (backend may ignore if not supported)
      if (existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      images.forEach((file) => {
        formData.append('images', file);
      });

      let res;
      if (product && product._id) {
        // update - send multipart PUT
        res = await axios.put(`/products/${product._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Product updated successfully');
      } else {
        res = await axios.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Product created successfully');
      }

      setShowToast(true);

      // reset local file inputs only (keep existingImages if editing)
      setImages([]);

      // call onDone so parent can close modal and refresh list
      onDone(res?.data || {});

    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
      setTimeout(() => setShowToast(false), 1400);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-add-product-form">
      <div>
        <label className="admin-input-label">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="admin-input-label">Price</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </div>
      <div>
        <label className="admin-input-label">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="admin-input-label">Category</label>
        {categories && categories.length > 0 ? (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
            <option value="">-- Select category --</option>
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        ) : (
          <input value={category} onChange={(e) => setCategory(e.target.value)} />
        )}
      </div>
      <div>
        <label className="admin-input-label">Stock</label>
        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
      </div>
      <div>
        <label className="admin-input-label">Images (up to 5)</label>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag 'n' drop some files here, or click to select files</p>
          }
        </div>

        {/* show existing image URLs when editing */}
        {existingImages.length > 0 && (
          <div className="preview existing-previews" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {existingImages.map((url, idx) => (
              <div key={`e-${idx}`} style={{ position: 'relative' }}>
                <img src={url} alt={`existing-${idx}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                <button type="button" onClick={() => removeExistingImage(url)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 12, width: 24, height: 24, cursor: 'pointer' }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        {previews.length > 0 && (
          <div className="preview" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {previews.map((p, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={p.url} alt={p.file.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                <button type="button" onClick={() => {
                  // remove this image
                  const nextImages = images.filter((f) => f !== p.file);
                  setImages(nextImages);
                }}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 12, width: 24, height: 24, cursor: 'pointer' }}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}</button>
      </div>
      {message && <div className="message">{message}</div>}
      {showToast && (
        <div className="inline-toast" style={{ position: 'fixed', right: 20, top: 20, background: '#22c55e', color: '#fff', padding: '8px 12px', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          {message}
        </div>
      )}
    </form>
  );
};

export default AddProductForm;
