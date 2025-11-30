import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (token && email) {
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Mock user object from query params
      const user = {
        email,
        name: decodeURIComponent(name || email.split('@')[0]),
        id: email, // This will be replaced when user data is fetched
      };

      // Call login context
      login(user, token);

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      // No token, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#28a745',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'pulse 0.6s ease-in-out',
        }}>
          <span style={{ fontSize: '32px', color: '#fff' }}>✓</span>
        </div>
        <h2 style={{ margin: '20px 0 10px 0', color: '#333' }}>Welcome!</h2>
        <p style={{ color: '#666', marginBottom: '10px' }}>Your Google authentication was successful</p>
        <p style={{ color: '#999', fontSize: '14px' }}>Redirecting you home...</p>
      </div>

      <style>{`
        @keyframes pulse {
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

export default AuthSuccess;
