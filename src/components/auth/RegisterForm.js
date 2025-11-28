import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './auth-form.css';

const bgSvg = (
  <div className="auth-form-bg">
    <svg width="180" height="180" style={{ top: '10%', left: '5%' }}>
      <circle cx="90" cy="90" r="80" fill="#007bff" />
    </svg>
    <svg width="120" height="120" style={{ bottom: '10%', right: '8%' }}>
      <rect x="20" y="20" width="80" height="80" rx="30" fill="#4CAF50" />
    </svg>
  </div>
);

const RegisterForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    // clear email-specific error when user edits the email field
    if (e.target.name === 'email') setEmailError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Known/allowed email domains -- update this list as needed
  const allowedEmailDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
  ];

  const isValidEmailFormat = (email) => {
    // Reasonably permissive RFC-like regex for client-side validation
    // eslint-disable-next-line no-useless-escape
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const isAllowedEmail = (email) => {
    if (!isValidEmailFormat(email)) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return allowedEmailDomains.includes(domain);
  };

  const handleEmailBlur = () => {
    if (!form.email) {
      setEmailError('Email is required');
      return;
    }
    if (!isValidEmailFormat(form.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!isAllowedEmail(form.email)) {
      setEmailError(
        `Email provider not allowed. Use one of: ${allowedEmailDomains.join(', ')}`
      );
      return;
    }
    setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required');
      return;
    }

    // Final client-side email validation before sending to API
    if (!isAllowedEmail(form.email)) {
      setError(
        `Registration requires an email from a known provider: ${allowedEmailDomains.join(', ')}`
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ✅ Use correct backend route: /api/users/register
      const { data } = await api.post('/users/register', form);

      if (data) {
        setSuccess('Account registered successfully! Redirecting to login...');
        setForm({ name: '', email: '', password: '', phone: '', address: '' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {bgSvg}
      <div className="auth-form-container">
        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="auth-form-input-group">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <span className="auth-form-icon" role="img" aria-label="user">
              
            </span>
          </div>

          <div className="auth-form-input-group">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              required
            />
            <span className="auth-form-icon" role="img" aria-label="email">
              
            </span>
            {emailError && <p className="error" style={{ marginTop: 6 }}>{emailError}</p>}
          </div>

          <div className="auth-form-input-group">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span className="auth-form-icon" role="img" aria-label="lock">
              
            </span>
          </div>

          <div className="auth-form-input-group">
            <input
              name="phone"
              placeholder="Phone (e.g. +2547XXXXXXXX)"
              value={form.phone}
              onChange={handleChange}
            />
            <span className="auth-form-icon" role="img" aria-label="phone">
              
            </span>
          </div>

          <div className="auth-form-input-group">
            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
            />
            <span className="auth-form-icon" role="img" aria-label="address">
              
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner"
                  style={{
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'inline-block',
                    marginRight: '8px',
                    animation: 'spin 0.8s linear infinite',
                  }}
                ></span>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>

      {/* Spinner animation keyframes */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default RegisterForm;
