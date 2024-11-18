import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { reportService } from '../../../api';
import { formatDateMD } from '../../../utils/dateUtils';

const CustomerAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    membershipDistribution: [],
    customerRetention: [],
    pointsAnalytics: [],
    topCustomers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getCustomerAnalytics(startDate, endDate);
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      setError('Error fetching analytics data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerTransactions = async (customerId) => {
    try {
      setTransactionsLoading(true);
      const transactions = await reportService.getCustomerTransactionHistory(customerId, startDate, endDate);
      setCustomerTransactions(transactions);
      setTransactionsError(null);
    } catch (err) {
      setTransactionsError('Error fetching customer transactions');
      console.error('Error:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerTransactions(selectedCustomer.id);
    }
  }, [selectedCustomer, startDate, endDate]);

  if (loading) return <div className="p-4">Loading analytics data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="p-6">
      {/* Header with Date Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Analytics</h1>
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
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded ${
            activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('membership')}
          className={`px-4 py-2 rounded ${
            activeTab === 'membership' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Membership Analysis
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={`px-4 py-2 rounded ${
            activeTab === 'points' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Points & Rewards
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
              <p className="text-2xl">{analyticsData.totalCustomers}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
              <p className="text-2xl">${Number(analyticsData.averageOrderValue).toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Active Members</h3>
              <p className="text-2xl">{analyticsData.activeMembers}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Points Redeemed</h3>
              <p className="text-2xl">{analyticsData.totalPointsRedeemed}</p>
            </div>
          </div>

          {/* Membership Distribution */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Membership Distribution</h3>
            <BarChart width={800} height={300} data={analyticsData.membershipDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Number of Customers" />
              <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
            </BarChart>
          </div>

          {/* Top Customers Table */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Top Customers</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Membership</th>
                    <th className="text-left p-2">Total Orders</th>
                    <th className="text-left p-2">Total Spent</th>
                    <th className="text-left p-2">Points Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className={index % 2 === 0 ? 'bg-gray-50' : ''}
                      onClick={() => handleCustomerSelect(customer)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="p-2">{customer.name}</td>
                      <td className="p-2">{customer.membershipLevel}</td>
                      <td className="p-2">{customer.totalOrders}</td>
                      <td className="p-2">${Number(customer.totalSpent).toFixed(2)}</td>
                      <td className="p-2">{customer.pointsBalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Membership Analysis Tab */}
      {activeTab === 'membership' && (
        <div className="space-y-6">
          {/* Membership Level Transitions */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Membership Level Transitions</h3>
            <LineChart width={800} height={300} data={analyticsData.membershipTransitions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="upgrades" stroke="#82ca9d" name="Upgrades" />
              <Line type="monotone" dataKey="downgrades" stroke="#8884d8" name="Downgrades" />
            </LineChart>
          </div>

          {/* Retention Rate by Membership Level */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Customer Retention by Level</h3>
            <BarChart width={800} height={300} data={analyticsData.retentionByLevel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="retentionRate" fill="#8884d8" name="Retention Rate %" />
            </BarChart>
          </div>
        </div>
      )}

      {/* Points & Rewards Tab */}
      {activeTab === 'points' && (
        <div className="space-y-6">
          {/* Points Activity */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Points Activity</h3>
            <LineChart width={800} height={300} data={analyticsData.pointsActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="earned" stroke="#82ca9d" name="Points Earned" />
              <Line type="monotone" dataKey="redeemed" stroke="#8884d8" name="Points Redeemed" />
            </LineChart>
          </div>

          {/* Points Usage by Category */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Points Usage by Category</h3>
            <BarChart width={800} height={300} data={analyticsData.pointsUsageByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pointsUsed" fill="#8884d8" name="Points Used" />
            </BarChart>
          </div>
        </div>
      )}

      {/* Selected Customer Details */}
      {selectedCustomer && (
        <div className="mt-6 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">
            {selectedCustomer.name} - {selectedCustomer.membershipLevel}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Orders</h3>
              {transactionsLoading ? (
                <div className="p-4">Loading customer transactions...</div>
              ) : transactionsError ? (
                <div className="p-4 text-red-500">{transactionsError}</div>
              ) : (
                <div className="space-y-2">
                  {customerTransactions.map((order, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Order #{order.Transaction_ID}</div>
                          <div className="text-sm text-gray-500">
                            {formatDateMD(order.Date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${Number(order.Total_Price).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">
                            {order.pointsEarned} points
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Points</h3>
              <div className="bg-gray-100 p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Total Points</div>
                    <div className="text-4xl font-bold">
                      {selectedCustomer.pointsBalance}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Points Earned</div>
                    <div className="text-4xl font-bold">
                      {selectedCustomer.totalPointsEarned}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAnalytics;