import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import CustomerAnalytics from './CustomerAnalytics';

const Reports = () => {
  const location = useLocation();

  return (
    <div className="p-4">
      <div className="mb-6 flex gap-4">
        <Link
          to="/admin/reports/sales"
          className={`px-4 py-2 rounded ${
            location.pathname.includes('sales') 
              ? 'bg-pink-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          Sales Report
        </Link>
        <Link
          to="/admin/reports/inventory"
          className={`px-4 py-2 rounded ${
            location.pathname.includes('inventory') 
              ? 'bg-pink-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          Inventory Report
        </Link>
        <Link
          to="/admin/reports/analytics"
          className={`px-4 py-2 rounded ${
            location.pathname.includes('inventory') 
              ? 'bg-pink-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          Customer Analytics
        </Link>
      </div>

      <Routes>
        <Route path="sales" element={<SalesReport />} />
        <Route path="inventory" element={<InventoryReport />} />
        <Route path="analytics" element={<CustomerAnalytics />} />
      </Routes>
    </div>
  );
};

export default Reports;