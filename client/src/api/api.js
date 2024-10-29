import axios from 'axios';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://dbms-cosc-3380.vercel.app'
  : 'http://localhost:5000';

console.log('Using backend URL:', BACKEND_URL);

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API endpoints
const authAPI = {
  customerLogin: (phoneNumber) => 
    api.post('/auth/customer/login', { phoneNumber }),
  
  adminLogin: (credentials) => 
    api.post('/auth/admin/login', credentials),
    
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }
};

// Shop API endpoints
const shopAPI = {
  getAllFlavors: () => api.get('/shop/all-flavors'),
  getFlavorById: (id) => api.get(`/shop/all-flavors/${id}`)
};

// Employee API endpoints (for admin)
// TBD
// const employeeAPI = {
//   getAllEmployees: () => 
//     api.get('/employee'),
  
//   getEmployeeById: (id) => 
//     api.get(`/employee/${id}`),
  
//   createEmployee: (employeeData) => 
//     api.post('/employee', employeeData),
  
//   updateEmployee: (id, employeeData) => 
//     api.put(`/employee/${id}`, employeeData),
  
//   deleteEmployee: (id) => 
//     api.delete(`/employee/${id}`)
// };

export {
  api as default,
  authAPI,
  shopAPI
};