import axios from 'axios';

// Default to relative `/api` so deployed frontend proxies API requests to same origin.
// If you need to override (e.g. development or external backend), set `REACT_APP_API_URL`.
const baseURL = process.env.REACT_APP_API_URL || '/api';
console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(config => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  // Use agentToken only for /delivery-agents/orders and /delivery/orders (agent endpoints)
  const isAgentOrders = config.url && (
    config.url.includes('/delivery-agents/orders') ||
    (config.url.includes('/delivery/orders') && config.method !== 'get') // PATCH/PUT for agent
  );
  // Use admin token for /delivery/orders and /delivery/agents (admin endpoints)
  const isAdminDelivery = config.url && (
    config.url.includes('/delivery/orders') || config.url.includes('/delivery/agents')
  );
  let token;
  if (isAgentOrders) {
    token = localStorage.getItem('agentToken');
  } else if (isAdminDelivery) {
    token = localStorage.getItem('token'); // admin token
  } else {
    token = localStorage.getItem('token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add getDashboardData method
api.getDashboardData = async () => {
  const res = await api.get('/admin/dashboard-data');
  return res.data;
};

// Pesapal payment
api.pesapalPayment = async ({ amount, description, email, orderId }) => {
  const paymentRes = await api.post('/pesapal/initiate-payment', {
    amount,
    description,
    email,
    orderId,
  });
  return paymentRes.data;
};

export default api;