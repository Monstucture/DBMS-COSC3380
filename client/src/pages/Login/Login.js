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
    const inputClassName = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500";
    
    switch(loginType) {
      case 'admin':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                className={inputClassName}
              />
            </div>
          </div>
        );
  
      case 'employee':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleInputChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleInputChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                placeholder="Enter employee ID"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={inputClassName}
              />
            </div>
          </div>
        );
  
      case 'customer':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                pattern="[0-9]{10}"
                placeholder="1234567890"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={inputClassName}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your 10-digit phone number
              </p>
            </div>
          </div>
        );
  
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Ice Cream Shop Login
        </h2>
        
        {/* Login Type Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          {[
            { type: 'customer', label: 'Customer' },
            { type: 'employee', label: 'Employee' },
            { type: 'admin', label: 'Admin' }
          ].map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => setLoginType(type)}
              className={`
                px-4 py-2 rounded-md transition-colors duration-200
                ${loginType === type 
                  ? 'bg-pink-500 text-white ring-2 ring-pink-300'
                  : 'bg-white text-gray-700 hover:bg-pink-50'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {renderLoginForm()}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Sign in
              </button>
            </div>

            {loginType === 'customer' && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Don't have an account?</p>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="mt-2 text-pink-600 hover:text-pink-500 font-medium"
                >
                  Register Now
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;