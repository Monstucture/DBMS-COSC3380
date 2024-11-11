import React, { useState, useEffect } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { reportService } from '../../../api';

const SalesReport = () => {
  // Get first day of current month for initial start date
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  
  // Get current date for initial end date
  const [endDate, setEndDate] = useState(new Date());
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    topSellingItems: []
  });

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getSalesReport(startDate, endDate);
      setSalesData(data.salesData);
      setSummaryStats(data.summary);
      setError(null);
    } catch (err) {
      setError('Error fetching sales data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []); 

  if (loading) return <div className="p-4">Loading sales data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Report</h1>
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
            onClick={fetchSalesData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-2xl">${summaryStats.totalRevenue}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Profit</h3>
          <p className="text-2xl">${summaryStats.totalProfit}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <p className="text-2xl">{summaryStats.totalOrders}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Avg Order Value</h3>
          <p className="text-2xl">${summaryStats.averageOrderValue}</p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: '800px', height: '300px' }}>
            <LineChart width={800} height={300} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" strokeWidth={2} />
            </LineChart>
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Top Selling Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Item Name</th>
                <th className="text-left p-2">Quantity Sold</th>
                <th className="text-left p-2">Revenue</th>
                <th className="text-left p-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {summaryStats.topSellingItems.map((item, index) => (
                <tr key={item.itemId} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantitySold}</td>
                  <td className="p-2">${item.revenue}</td>
                  <td className="p-2">${item.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;