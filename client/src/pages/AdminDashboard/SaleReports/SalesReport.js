import React, { useState, useEffect } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { reportService } from '../../../api';
import { formatDateMD } from '../../../utils/dateUtils';

const SalesReport = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  
  const [endDate, setEndDate] = useState(new Date());
  const [salesData, setSalesData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    topSellingItems: []
  });

  const formatChartData = (data) => {
    return data.map(item => ({
      ...item,
      date: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}-${new Date(item.date).getDate()}`
    }));
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getSalesReport(startDate, endDate);
      
      // Format the data for the chart
      const formattedSalesData = formatChartData(data.salesData);
      
      setSalesData(formattedSalesData);
      setSummaryStats(data.summary);
      setDetailedData(data.detailedData);
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
      {/* Date Selector */}
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
              dateFormat="MM/dd/yyyy"
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
              dateFormat="MM/dd/yyyy"
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
          <p className="text-2xl">${Number(summaryStats.totalRevenue).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Profit</h3>
          <p className="text-2xl">${Number(summaryStats.totalProfit).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <p className="text-2xl">{summaryStats.totalOrders}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Avg Order Value</h3>
          <p className="text-2xl">${Number(summaryStats.averageOrderValue).toFixed(2)}</p>
        </div>
      </div>

      {/* Sales Trend Chart - With custom tooltip */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: '800px', height: '300px' }}>
            <LineChart width={800} height={300} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => value}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => date}
                formatter={(value) => ['$' + Number(value).toFixed(2)]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                name="Revenue" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#82ca9d" 
                name="Profit" 
                strokeWidth={2}
              />
            </LineChart>
          </div>
        </div>
      </div>

      {/* Detailed Transactions */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Transaction ID</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Items</th>
                <th className="text-right p-2">Total</th>
                <th className="text-right p-2">Discount</th>
                <th className="text-left p-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {detailedData.map((transaction, index) => (
                <tr key={transaction.Transaction_ID} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">{formatDateMD(transaction.Date)}</td>
                  <td className="p-2">{transaction.Transaction_ID}</td>
                  <td className="p-2">
                    <div>{transaction.First_Name} {transaction.Last_Name}</div>
                    <div className="text-xs text-gray-500">{transaction.Membership_Level}</div>
                  </td>
                  <td className="p-2">
                    {transaction.items?.map((item, i) => (
                      <div key={i} className="text-sm">
                        {item.Item_Name} x{item.Quantity_Sold}
                      </div>
                    ))}
                  </td>
                  <td className="p-2 text-right">${Number(transaction.Total_Price).toFixed(2)}</td>
                  <td className="p-2 text-right">
                    {transaction.Discount_Percentage > 0 ? (
                      <span className="text-red-600">-{transaction.Discount_Percentage}%</span>
                    ) : '-'}
                  </td>
                  <td className="p-2">{transaction.Payment_Type}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <th className="text-right p-2">Revenue</th>
                <th className="text-right p-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {summaryStats.topSellingItems.map((item, index) => (
                <tr key={item.itemId} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantitySold}</td>
                  <td className="p-2 text-right">${Number(item.revenue).toFixed(2)}</td>
                  <td className="p-2 text-right">${Number(item.profit).toFixed(2)}</td>
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