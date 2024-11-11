import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../api';

const Checkout = ({ basketItems, clearBasket }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    membership: '',
    birthDate: null
  });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchCustomerData();
      fetchAvailableCoupons();
    }
  }, []);

  const fetchCustomerData = async () => {
    try {
      const data = await customerService.getAccount();
      setCustomerData({
        name: `${data.First_Name} ${data.Last_Name}`,
        phoneNumber: data.Phone_Number || '',
        address: data.Address || '',
        membership: data.Membership_Level,
        birthDate: data.Birth_Date ? new Date(data.Birth_Date) : null
      });
    } catch (err) {
      alert('Error fetching customer data: ' + err.message);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const coupons = await customerService.getAvailableCoupons();
      setAvailableCoupons(coupons);
    } catch (err) {
      alert('Error fetching coupons: ' + err.message);
    }
  };

  // Calculate basket
  const calculateTotal = () => {
    // First calculate base total
    const baseTotal = basketItems.reduce((sum, item) => 
      sum + (item.Unit_Price * item.quantity), 0
    );
  
    let discount = 0;
    let discountDescription = '';
  
    // Check if eligible for membership discount (4 or more total quantity)
    const totalQuantity = basketItems.reduce((sum, item) => sum + item.quantity, 0);
    const isMembershipDiscountEligible = !selectedCoupon && 
      ['Silver', 'Gold', 'Diamond'].includes(customerData.membership) && 
      totalQuantity >= 4;
  
    if (selectedCoupon) {
      // Handle free ice cream coupon
      if (selectedCoupon.Description.includes('Free Ice Cream') || 
          selectedCoupon.Promotion_Type === 'Birthday') {
        // Get the price of one unit of the cheapest item
        const cheapestItem = basketItems.reduce((min, item) => 
          item.Unit_Price < min.Unit_Price ? item : min, basketItems[0]
        );
        discount = cheapestItem.Unit_Price;
        discountDescription = 'Free Ice Cream (Cheapest Item)';
      }
      // Handle other coupon types
      else if (selectedCoupon.Promotion_Type === 'Buy 1 Get 1 Free' && totalQuantity >= 2) {
        const cheapestItem = basketItems.reduce((min, item) => 
          item.Unit_Price < min.Unit_Price ? item : min, basketItems[0]
        );
        discount = cheapestItem.Unit_Price;
        discountDescription = 'Buy 1 Get 1 Free';
      } else if (selectedCoupon.Discount_Percentage) {
        discount = baseTotal * (selectedCoupon.Discount_Percentage / 100);
        discountDescription = `${selectedCoupon.Discount_Percentage}% Off`;
      } else if (selectedCoupon.Discount_Amount) {
        discount = selectedCoupon.Discount_Amount;
        discountDescription = `$${selectedCoupon.Discount_Amount} Off`;
      }
    } else if (isMembershipDiscountEligible) {
      discount = baseTotal * 0.05;
      discountDescription = '5% Membership Discount';
    }
  
    return {
      baseTotal,
      discount,
      discountDescription,
      finalTotal: Math.max(baseTotal - discount, 0)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      if (isLoggedIn) {
        const totalCalculation = calculateTotal();
        await customerService.placeOrder({
          items: basketItems.map(item => ({
            Item_ID: item.Item_ID,
            quantity: item.quantity,
            Unit_Price: item.Unit_Price
          })),
          total: totalCalculation.finalTotal,
          selectedCoupon: selectedCoupon,
          promotionId: selectedCoupon?.Promotion_ID,
          discountAmount: totalCalculation.discount,
          discountPercentage: selectedCoupon?.Discount_Percentage || 0
        });
      } else {
        await customerService.placeGuestOrder({
          items: basketItems.map(item => ({
            Item_ID: item.Item_ID,
            quantity: item.quantity,
            Unit_Price: item.Unit_Price
          })),
          total: calculateTotal(),
          customerInfo: {
            name: customerData.name,
            phoneNumber: customerData.phoneNumber,
            address: customerData.address
          }
        });
      }

      clearBasket();
      navigate('/order-confirmation', {
        state: {
          orderDetails: {
            total: calculateTotal().finalTotal,
            couponUsed: selectedCoupon?.Description,
            items: basketItems.length
          }
        }
      });
    } catch (err) {
      alert(err.message || 'Error placing order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!basketItems?.length) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Your basket is empty</h2>
        <button
          onClick={() => navigate('/shop')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Delivery Information</h3>
          <div className="space-y-1">
            <p>Name: {customerData.name}</p>
            <p>Phone: {customerData.phoneNumber}</p>
            <p>Address: {customerData.address}</p>
          </div>
        </div>

        {/* Available Coupons */}
        {isLoggedIn && availableCoupons.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold mb-2">Available Coupons</h3>
            <div className="space-y-2">
              {availableCoupons.map(coupon => (
                <label key={coupon.Promotion_ID} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="coupon"
                    checked={selectedCoupon?.Promotion_ID === coupon.Promotion_ID}
                    onChange={() => setSelectedCoupon(coupon)}
                    className="form-radio"
                  />
                  <span>
                    {coupon.Description} 
                    {coupon.Promotion_Type === 'Buy 1 Get 1 Free' ? ' (Buy One Get One Free!)' :
                      coupon.Discount_Percentage ? ` (${coupon.Discount_Percentage}% off)` :
                      coupon.Discount_Amount ? ` ($${coupon.Discount_Amount} off)` : ''}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Membership Discount Notice */}
        {isLoggedIn && !selectedCoupon && ['Silver', 'Gold', 'Diamond'].includes(customerData.membership) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            {basketItems.reduce((sum, item) => sum + item.quantity, 0) >= 4 ? (
              <p>5% Membership discount applied for 4+ items!</p>
            ) : (
              <p>Add {4 - basketItems.reduce((sum, item) => sum + item.quantity, 0)} more item(s) to get your 5% membership discount!</p>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Order Summary</h3>
          <div className="space-y-2">
            {basketItems.map(item => (
              <div key={item.Item_ID} className="flex justify-between">
                <span>{item.quantity}x {item.Item_Name}</span>
                <span>${(item.Unit_Price * item.quantity)}</span>
              </div>
            ))}
            
            {/* Subtotal */}
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateTotal().baseTotal}</span>
              </div>
            </div>

            {/* Show discount if any */}
            {calculateTotal().discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{calculateTotal().discountDescription}:</span>
                <span>-${calculateTotal().discount}</span>
              </div>
            )}

            {/* Final Total */}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${calculateTotal().finalTotal}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;