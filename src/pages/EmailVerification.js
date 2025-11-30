import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setStatus('error');
          setMessage('No verification token provided');
          return;
        }

        const { data } = await api.post(`/auth/verify-email/${token}`);

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
      }}>
        {status === 'verifying' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#007bff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite',
            }}>
              <span style={{ fontSize: '24px' }}>✉️</span>
            </div>
            <h2 style={{ margin: '20px 0 10px 0', color: '#333' }}>Verifying Email</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'slideIn 0.6s ease-in-out',
            }}>
              <span style={{ fontSize: '32px', color: '#fff' }}>✓</span>
            </div>
            <h2 style={{ margin: '20px 0 10px 0', color: '#28a745' }}>Email Verified!</h2>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#dc3545',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span style={{ fontSize: '32px', color: '#fff' }}>✗</span>
            </div>
            <h2 style={{ margin: '20px 0 10px 0', color: '#dc3545' }}>Verification Failed</h2>
          </>
        )}

        <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
          {message}
        </p>

        {status === 'error' && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: '#999', marginBottom: '15px' }}>
              Your link may have expired. Request a new verification email:
            </p>
            <button
              onClick={() => navigate('/resend-verification')}
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Resend Verification Email
            </button>
          </div>
        )}

        {status === 'success' && (
          <p style={{ fontSize: '14px', color: '#999', marginTop: '15px' }}>
            Redirecting to login...
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailVerification;
