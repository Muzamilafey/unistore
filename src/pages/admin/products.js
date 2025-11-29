import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import AdminNavbar from './AdminSidebar';
import AddProductForm from '../../components/admin/AddProductForm';
import CategoryModal from '../../components/admin/CategoryModal';
import './AdminDashboard.css';
import './products.css';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  const fetchProducts = async (opts = {}) => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      q.set('page', opts.page || page);
      q.set('limit', opts.limit || limit);
      if ((opts.search || search).trim()) q.set('search', opts.search || search);
      if ((opts.status || statusFilter) && (opts.status || statusFilter) !== 'all') q.set('status', opts.status || statusFilter);
      if ((opts.sort || sort)) q.set('sort', opts.sort || sort);

      // Prefer admin endpoint which supports pagination and filtering
      const url = `/admin/products?${q.toString()}`;
      const res = await api.get(url);

      // Support two shapes: { products: [], total, pages } or []
      const data = res.data;
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else if (data.products || data.docs) {
        const docs = data.products || data.docs;
        setProducts(docs);
        setTotalCount(data.total || data.count || docs.length);
        setTotalPages(data.pages || Math.ceil((data.total || docs.length) / (opts.limit || limit)));
      } else {
        // fallback
        setProducts(data);
        setTotalCount((data && data.length) || 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      // fallback to public endpoint if admin endpoint not available
      if (err?.response?.status === 404) {
        try {
          const { data } = await api.get('/products');
          setProducts(data);
          setTotalCount(data.length || 0);
          setTotalPages(1);
          setError('');
          return;
        } catch (e) {
          console.error(e);
        }
      }
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts({ page, limit });
  }, []);

  // refetch when pagination or filters change
  useEffect(() => {
    const t = setTimeout(() => fetchProducts({ page, limit }), 250);
    return () => clearTimeout(t);
  }, [page, limit, search, statusFilter, sort]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const clearForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: "",
    });
    setEditingProduct(null);
    setError("");
    setSuccess("");
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name || !form.price) {
      setError("Name and Price are required");
      return;
    }
    try {
      setLoading(true);
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        });
        setSuccess("✅ Product updated successfully");
      } else {
        await api.post("/products", {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        });
        setSuccess("✅ Product added successfully");
      }
      clearForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "❌ Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category || "",
      stock: product.stock.toString(),
      image: product.image || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'products.xlsx');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Products List', 14, 16);
    autoTable(doc, {
      head: [['Product ID', 'Name', 'Category', 'Stock', 'Price (KES)']],
    body: products.map(p => [p.productId || p._id, p.name, p.category, p.countInStock, `KES ${(Number(p?.price) || 0).toFixed(2)}`]),
      startY: 22,
    });
    doc.save('products.pdf');
  };

  return (
    <div className="admin-orders-bg">
      <AdminNavbar />
      <main className="admin-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', minHeight: '80vh' }}>
        <section className="products-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h2 className="admin-page-title" style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 8 }}>Products</h2>
            <div  className="order-summary-card-whole" >
              <div className="order-summary-card">
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Products</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0' }}>{products.length}</div>
                <div style={{ color: '#888', fontSize: '0.95rem' }}>Products in stock</div>
              </div>
              <div className="order-summary-card">
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Low Stock</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0' }}>{products.filter(p => p.stock < 10).length}</div>
                <div style={{ color: '#888', fontSize: '0.95rem' }}>Products below threshold</div>
              </div>
              <div className="order-summary-card">
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Categories</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0' }}>{[...new Set(products.map(p => p.category))].length}</div>
                <div style={{ color: '#888', fontSize: '0.95rem' }}>Product categories</div>
              </div>
            </div>
          </div>
            
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="admin-btn-primary" onClick={() => { clearForm(); setShowForm(true); }}>+ Add Product</button>
              <button className="admin-btn-secondary" onClick={() => setShowCategories(true)}>Manage Categories</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="admin-btn-secondary" onClick={handleDownloadExcel}>Download Excel</button>
              <button className="admin-btn-secondary" onClick={handleDownloadPDF}>Download PDF</button>
            </div>
          </div>
        </section>
        {showForm && (
          <div className="modal-overlay" onClick={(e) => { if (e.target.className && e.target.className.includes('modal-overlay')) clearForm(); }}>
            <div className="admin-form">
              <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
              {error && <div className="admin-error">{error}</div>}
              {success && <div className="admin-success">{success}</div>}
              <AddProductForm product={editingProduct} onDone={() => { clearForm(); fetchProducts(); }} />
              <div style={{ marginTop: 12 }}>
                <button type="button" className="admin-btn" onClick={clearForm}>Close</button>
              </div>
            </div>
          </div>
        )}
        {showCategories && (
          <CategoryModal onClose={() => setShowCategories(false)} onCreated={() => { fetchProducts(); /* refresh categories in form next open */ }} />
        )}
        <section className="products-table-section">
          <div className="admin-search-bar">
            <input className="admin-search-input" placeholder="Search by name, Product ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            <select className="admin-filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="draft">Draft</option>
            </select>
            <select className="admin-filter-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table products-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 320 }}>Product Name</th>
                  <th>ID & Create Date</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No products found.</td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={p.image || p.images?.[0]?.url || ''} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div style={{ color: '#6b7280', fontSize: 12 }}>{p.description?.slice(0, 60)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>#{p.productId || p._id?.slice(-6)}</div>
                        <div style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(p.createdAt || p._id?.timestamp * 1000 || Date.now()).toLocaleDateString()}</div>
                      </td>
                      <td>KES {(Number(p?.price) || 0).toLocaleString()}</td>
                      <td>{p.stock || p.countInStock || 0}</td>
                      <td>
                        <span className={`admin-status ${p.stock > 0 ? 'admin-status-Active' : 'admin-status-Out'}`}>{p.stock > 0 ? 'Published' : 'Out Stock'}</span>
                      </td>
                      <td>
                        <button className="admin-btn" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="admin-btn-secondary" onClick={() => handleDelete(p._id)} style={{ marginLeft: 8 }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination controls */}
            <div className="admin-pagination" style={{ paddingTop: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="admin-btn-secondary">Prev</button>
                <div style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e6eef6', borderRadius: 8 }}>Page {page} / {totalPages}</div>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="admin-btn-secondary">Next</button>
                <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} style={{ marginLeft: 12, padding: 8, borderRadius: 8 }}>
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <div style={{ color: '#6b7280', alignSelf: 'center' }}>{totalCount} products</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminProducts;
