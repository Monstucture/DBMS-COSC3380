import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { shopService } from '../../api';

const Shop = ({ basketItems, addToBasket, updateBasketQuantity, removeFromBasket }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await shopService.getAllFlavors(); 
        setItems(items || []);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error loading items');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleItemClick = async (item) => {
    if (selectedItem?.Item_ID === item.Item_ID) {
      setSelectedItem(null);
      setItemDetails(null);
      return;
    }

    try {
      const details = await shopService.getFlavorById(item.Item_ID);
      setItemDetails(details);
      setSelectedItem(item);
    } catch (err) {
      setError(err.message || 'Error loading item details');
    }
  };

  if (loading) return <div className={loading}>Loading...</div>;
  if (error) return <div className={error}>{error}</div>;

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.Unit_Price * item.quantity), 0);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Our Flavors</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div 
            key={item.Item_ID} 
            className="bg-white rounded shadow-md overflow-hidden"
          >
            <div onClick={() => handleItemClick(item)} className="cursor-pointer">
              <img 
                src={`/api/placeholder/400/200`}
                alt={item.Item_Name}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{item.Item_Name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToBasket(item);
                    }}
                    className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <p className="text-lg font-bold text-blue-600">${item.Unit_Price}</p>
              </div>
            </div>

            {selectedItem?.Item_ID === item.Item_ID && itemDetails && (
              <div className="p-4 bg-gray-50 border-t">
                <h4 className="font-semibold mb-2">Nutrition Facts</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Calories: {itemDetails.Calories}</p>
                    <p className="font-medium">Protein: {itemDetails.Protein}g</p>
                    <p className="font-medium">Sugar: {itemDetails.Sugar}g</p>
                    <p className="font-medium">Total Carbs: {itemDetails.Total_Carbs}g</p>
                    <p className="font-medium">Total Fat: {itemDetails.Total_Fat}g</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;