import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../api';

const Login = () => {
  const location = useLocation();
  const [loginType, setLoginType] = useState('customer');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      
      switch(loginType) {
        case 'admin':
          response = await authService.adminLogin({
            username: formData.username,
            password: formData.password
          });
          break;
        
        case 'employee':
          response = await authService.employeeLogin({
            firstName: formData.firstName,
            lastName: formData.lastName,
            employeeId: formData.employeeId
          });
          break;
        
        case 'customer':
          response = await authService.customerLogin(formData.phoneNumber);
          break;

        default:
          setError('Invalid login type');
          return;
      }
      
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        
        if (location.state?.returnTo === '/checkout-flow') {
          navigate('/checkout', { state: { fromLogin: true } });
        } else {
          switch(response.data.user.role) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'employee':
              navigate('/employee/dashboard');
              break;
            case 'customer':
              navigate('/customer/dashboard');
              break;
            default:
              setError('Invalid user role');
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please try again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const renderLoginForm = () => {
    switch(loginType) {
      case 'admin':
        return (
          <div>
            <div>
              <input
                name="username"
                type="text"
                required
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 'employee':
        return (
          <div>
            <div>
              <input
                name="firstName"
                type="text"
                required
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                name="lastName"
                type="text"
                required
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                name="employeeId"
                type="text"
                required
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 'customer':
        return (
          <div>
            <input
              name="phoneNumber"
              type="tel"
              required
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div>
        <h2>Ice Cream Shop Login</h2>
        <div>
          <button
            type="button"
            onClick={() => setLoginType('customer')}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setLoginType('employee')}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
          >
            Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div>
            <div>{error}</div>
          </div>
        )}

        {renderLoginForm()}

        <div>
          <button type="submit">
            Sign in
          </button>
        </div>
        <div>
          <p>Don't have an account?</p>
          <button type="button" onClick={() => navigate('/register')}>
            Register Now
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;