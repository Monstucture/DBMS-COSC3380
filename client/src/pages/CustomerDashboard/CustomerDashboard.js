import { useState, useEffect } from 'react';
import { customerService } from '../../api';
import { useNavigate } from 'react-router-dom';
import { formatDateMD } from '../../utils/dateUtils';

const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-md p-6">{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="mb-4 border-b pb-4">{children}</div>
);

const CardTitle = ({ children }) => (
  <h2 className="text-xl font-bold">{children}</h2>
);

const CardContent = ({ children }) => <div>{children}</div>;

const Accordion = ({ children }) => (
  <div className="space-y-4">{children}</div>
);

const AccordionItem = ({ children }) => (
  <div className="bg-white shadow-md rounded-md">{children}</div>
);

const AccordionHeader = ({ children, onClick }) => (
  <div
    className="px-6 py-4 cursor-pointer hover:bg-gray-100"
    onClick={onClick}
  >
    {children}
  </div>
);

const AccordionPanel = ({ children }) => (
  <div className="px-6 py-4 border-t">{children}</div>
);

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const data = await customerService.getAccount();
        setCustomerData(data);

        // Fetch customer orders
        const orders = await customerService.getOrders();
        setOrders(orders);
      } catch (err) {
        console.error('Error fetching customer data:', err);
        if (err.status === 401) {
          navigate('/login');
        } else {
          setError(err.message || 'Failed to load customer data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [navigate]);

  const getMembershipStyle = (level) => {
    const levelLower = level?.toLowerCase();
    return `bg-${levelLower}-500 text-white px-2 py-1 rounded-full`;
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 text-lg font-medium mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membership Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Status</CardTitle>
            <span className={getMembershipStyle(customerData.Membership_Level)}>
              {customerData.Membership_Level}
            </span>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-lg font-medium mb-2">Points Balance</h3>
              <div className="text-4xl font-bold mb-2">
                {customerData.Available_Points}
              </div>
              {customerData.Points_To_Next_Level > 0 && (
                <p className="text-gray-500">
                  {customerData.Points_To_Next_Level} points until next level
                </p>
              )}
            </div>
            {customerData.Points_To_Next_Level > 0 && (
              <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4">
                <div
                  className={`h-2.5 rounded-full ${getMembershipStyle(customerData.Membership_Level)}`}
                  style={{
                    width: `${(customerData.Available_Points / (customerData.Available_Points + customerData.Points_To_Next_Level)) * 100}%`,
                  }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {customerData.currentBenefits.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {customerData.nextLevelBenefits && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">
                  Next Level: {customerData.nextLevel}
                </h3>
                <ul className="space-y-2">
                  {customerData.nextLevelBenefits.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="text-gray-400">○</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Phone:</span> {customerData?.Phone_Number}
              </p>
              <p>
                <span className="font-medium">Member Since:</span>{' '}
                {customerData?.Account_Creation_Date &&
                  new Date(customerData.Account_Creation_Date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Total Points Earned:</span>{' '}
                {customerData?.Total_Accrued_Discount_Points}
              </p>
              <p>
                <span className="font-medium">Points Used:</span>{' '}
                {customerData?.Discount_Points_Used}
              </p>
              <p>
                <span className="font-medium">Current Point Rate:</span>{' '}
                {customerData?.currentBenefits.pointsRate}x
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Order History</h2>
        {orders.length > 0 ? (
          <Accordion>
            {orders.map((order) => (
              <AccordionItem key={order.Transaction_ID}>
                <AccordionHeader onClick={() => toggleOrderExpansion(order.Transaction_ID)}>
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <span className="font-medium">Order #{order.Transaction_ID}</span>
                      <span className="text-gray-500 ml-2">
                        {formatDateMD(order.Date)}
                      </span>
                    </div>
                    <div className="font-medium">${order.Total_Price.toFixed(2)}</div>
                  </div>
                </AccordionHeader>
                <AccordionPanel>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-gray-100 p-2 rounded">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{item.Item_Name}</div>
                          <div>
                            <span className="font-medium">Qty:</span> {item.Quantity_Sold}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-gray-500">No orders found.</div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;