import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const ApiDebug = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get('/orders/reminders/all');
        setResult(data);
      } catch (err) {
        setError(err.response?.data || err.message || String(err));
      }
    };
    run();
  }, []);

  return (
    <div style={{ padding: 12, background: '#fff5f5', border: '1px solid #ffd1d1', borderRadius: 6, margin: '12px 0' }}>
      <strong>API Debug</strong>
      <div style={{ marginTop: 8, fontSize: 13, color: '#333' }}>
        <div><strong>Endpoint:</strong> <code>/api/orders/reminders/all</code></div>
        {error && (
          <pre style={{ whiteSpace: 'pre-wrap', color: '#a33', marginTop: 8 }}>{JSON.stringify(error, null, 2)}</pre>
        )}
        {result && (
          <pre style={{ whiteSpace: 'pre-wrap', color: '#060', marginTop: 8 }}>{JSON.stringify(result, null, 2)}</pre>
        )}
        {!result && !error && <div style={{ marginTop: 8, color: '#666' }}>loading...</div>}
      </div>
    </div>
  );
};

export default ApiDebug;
