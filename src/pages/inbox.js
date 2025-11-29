import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Inbox = () => {
  const { user, token } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'paid'
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchReminders();
  }, [user, token]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/reminders/all');
      setReminders(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch reminders';
      setError(msg);
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (reminder) => {
    if (reminder.read) return; // Already read

    try {
      await api.put('/orders/reminders/mark-read', {
        orderId: reminder.orderId,
        reminderId: reminder._id,
      });

      // Update local state
      setReminders((prev) => prev.map((r) => (r._id === reminder._id ? { ...r, read: true } : r)));
    } catch (err) {
      console.error('Error marking reminder as read:', err);
    }
  };

  const handlePayNow = (reminder) => {
    markAsRead(reminder);
    window.location.href = `/pay?orderId=${reminder.orderId}`;
  };

  // Filter reminders
  const filteredReminders = reminders.filter((r) => {
    if (filter === 'unread') return !r.read;
    if (filter === 'paid') return r.paymentStatus === 'Paid';
    return true;
  });

  const unreadCount = reminders.filter((r) => !r.read).length;

  return (
    <div className="inbox-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>📬 Your Inbox</h1>

      {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'all' ? '#333' : '#f0f0f0',
            color: filter === 'all' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          All ({reminders.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'unread' ? '#d9534f' : '#f0f0f0',
            color: filter === 'unread' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'paid' ? '#5cb85c' : '#f0f0f0',
            color: filter === 'paid' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Paid ({reminders.filter((r) => r.paymentStatus === 'Paid').length})
        </button>
      </div>

      {loading ? (
        <p>Loading your inbox...</p>
      ) : filteredReminders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#666' }}>
            {filter === 'unread' && "You're all caught up! No unread messages."}
            {filter === 'paid' && "No paid orders yet."}
            {filter === 'all' && "Your inbox is empty. No payment reminders at this time."}
          </p>
        </div>
      ) : (
        <div className="reminders-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredReminders.map((reminder) => (
            <div
              key={reminder._id}
              className={`reminder-item ${reminder.read ? 'read' : 'unread'}`}
              style={{
                padding: '16px',
                backgroundColor: reminder.read ? '#fff' : '#f0f8ff',
                border: reminder.read ? '1px solid #ddd' : '2px solid #2196F3',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px' }}>
                    {!reminder.read && <span style={{ color: 'red', fontSize: '18px' }}>●</span>} Order{' '}
                    {reminder.orderId}
                  </h3>
                  <span
                    style={{
                      padding: '4px 8px',
                      backgroundColor:
                        reminder.paymentStatus === 'Paid'
                          ? '#5cb85c'
                          : '#f0ad4e',
                      color: '#fff',
                      fontSize: '12px',
                      borderRadius: '3px',
                    }}
                  >
                    {reminder.paymentStatus}
                  </span>
                </div>
                <p style={{ margin: '4px 0', color: '#555', fontSize: '14px' }}>
                  {reminder.message}
                </p>
                <p
                  style={{
                    margin: '4px 0',
                    color: '#999',
                    fontSize: '12px',
                  }}
                >
                  {new Date(reminder.sentAt).toLocaleString()}
                </p>
              </div>

              {reminder.paymentStatus === 'Unpaid' && (
                <button
                  onClick={() => handlePayNow(reminder)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#d9534f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: '16px',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Pay Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;
