import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { reportService } from '../../../api';

const InventoryReport = () => {
  // Get first day of current month for initial start date
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  
  // Get current date for initial end date
  const [endDate, setEndDate] = useState(new Date());
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getInventoryReport(startDate, endDate);
      setAllItems(data);
      
      // Filter data based on selected items
      const filteredData = selectedItems.length > 0
        ? data.filter(item => selectedItems.includes(item.Item_ID))
        : data;
        
      setInventoryData(filteredData);
      setError(null);
    } catch (err) {
      setError('Error fetching inventory data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []); // Only fetch on mount

  if (loading) return <div className="p-4">Loading inventory data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Report</h1>
        <div className="flex gap-4 items-center">
          <div>
            <label className="mr-2">Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label className="mr-2">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={fetchInventoryData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Item Selection */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Select Items</h2>
        <div className="flex flex-wrap gap-2">
          {allItems.map(item => (
            <label key={item.Item_ID} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.Item_ID)}
                onChange={(e) => {
                  setSelectedItems(prev => 
                    e.target.checked
                      ? [...prev, item.Item_ID]
                      : prev.filter(id => id !== item.Item_ID)
                  );
                }}
                className="form-checkbox"
              />
              <span>{item.Item_Name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Inventory Movement Chart */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Inventory Movement</h2>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: '800px', height: '300px' }}>
            <BarChart width={800} height={300} data={inventoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Item_Name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_added" fill="#82ca9d" name="Added" />
              <Bar dataKey="total_removed" fill="#8884d8" name="Removed" />
              <Bar dataKey="revenue" fill="#ffc658" name="Revenue ($)" />
            </BarChart>
          </div>
        </div>
      </div>

      {/* Detailed Inventory Table */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Detailed Inventory</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Item Name</th>
                <th className="text-left p-2">Current Stock</th>
                <th className="text-left p-2">Total Added</th>
                <th className="text-left p-2">Total Removed</th>
                <th className="text-left p-2">Revenue</th>
                <th className="text-left p-2">Changes Count</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item, index) => (
                <tr key={item.Item_ID} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">{item.Item_Name}</td>
                  <td className="p-2">{item.Quantity}</td>
                  <td className="p-2 text-green-600">+{item.total_added || 0}</td>
                  <td className="p-2 text-red-600">-{item.total_removed || 0}</td>
                  <td className="p-2">${item.revenue || '0.00'}</td>
                  <td className="p-2">{item.changes_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;