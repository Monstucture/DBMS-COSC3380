import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const Basket = ({ items = [], updateQuantity, removeItem, onClose, isOpen }) => {
  const navigate = useNavigate();

  const calculateTotal = () => {
    return items.reduce((sum, item) => 
      sum + (item.Unit_Price * item.quantity), 0
    );
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed top-16 right-0 h-[calc(100vh-64px)] w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Your Basket</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>Your basket is empty</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/shop');
                  }}
                  className="mt-4 text-blue-500 hover:text-blue-600"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.Item_ID} className="flex items-start justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{item.Item_Name}</p>
                      <p className="text-sm text-gray-600">
                        ${item.Unit_Price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.Item_ID, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.Item_ID, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.Item_ID)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Basket;