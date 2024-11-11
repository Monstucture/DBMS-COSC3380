import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';
import logo from '../../assets/Logo/logo.png';

const Navbar = ({ basketItems = [], toggleBasket, isBasketOpen }) => {
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const basketItemCount = basketItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderBasketButton = () => (
    <button 
      onClick={toggleBasket}
      className="p-2 hover:bg-pink-100 rounded-full transition-colors"
    >
      <div className="relative">
        <ShoppingBasket size={24} />
        {basketItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {basketItemCount}
          </span>
        )}
      </div>
    </button>
  );

  // Guest Navigation (Not Logged In)
  if (!userRole) {
    return (
      <div className="w-full h-16 bg-pink-100 shadow-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-4">
          <div className="flex justify-between items-center h-full">
            <NavLink to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-12 w-auto object-contain"  
              />
            </NavLink>

            {/* Navigation links in the middle */}
            <div className="flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
              <Link to="/shop" className="text-gray-700 hover:text-gray-900">Shop</Link>
              <Link to="/about" className="text-gray-700 hover:text-gray-900">About Us</Link>
              <Link to="/login" className="text-gray-700 hover:text-gray-900">Login</Link>
            </div>

            {/* Shopping cart on the right */}
            <div className="flex items-center">
              {renderBasketButton()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer logged in
  if (userRole === 'customer') {
    return (
      <div className="w-full h-16 bg-pink-100 shadow-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-4">
          <div className="flex justify-between items-center h-full">
          <NavLink to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-12 w-auto object-contain"  
              />
            </NavLink>

            <div className="flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
              <Link to="/shop" className="text-gray-700 hover:text-gray-900">Shop</Link>
              <Link to="/about" className="text-gray-700 hover:text-gray-900">About Us</Link>
              <Link to="/customer/dashboard" className="text-gray-700 hover:text-gray-900">My Account</Link>
            </div>

            <div className="flex items-center gap-4">
              {renderBasketButton()}
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Admin Navigation
  if (userRole === 'admin') {
    return (
      <div className="w-full h-16 bg-pink-100 shadow-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-4">
          <div className="flex justify-between items-center h-full">
            <NavLink to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-12 w-auto object-contain"  
              />
            </NavLink>

            <div className="flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
              <Link to="/admin/dashboard" className="text-gray-700 hover:text-gray-900">Inventory</Link>
              <div className="dropdown text-gray-700 hover:text-gray-900">
                <span className="nav-link text-gray-700 hover:text-gray-900">Reports</span>
                <div className="dropdown-content">
                  <Link to="/admin/reports/sales" className="text-gray-700 hover:text-gray-900">Sales Report</Link>
                  <Link to="/admin/reports/inventory" className="text-gray-700 hover:text-gray-900">Inventory Report</Link>
                </div>
              </div>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Employee Navigation
  if (userRole === 'employee') {
    return (
      <div className="w-full h-16 bg-pink-100 shadow-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-4">
          <div className="flex justify-between items-center h-full">
            <NavLink to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-12 w-auto object-contain"  
              />
            </NavLink>

            <div className="flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
              <Link to="/employee/dashboard" className="text-gray-700 hover:text-gray-900">Inventory</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

          </div>
        </div>
      </div>
    );
  }
};

export default Navbar;