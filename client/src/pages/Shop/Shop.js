import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { shopService } from '../../api';

// Image mapping object for ice cream flavors
const flavorImages = {
  // Standard flavors
  'Vanilla': '/images/vanilla.png',
  'Chocolate': '/images/chocolate.png',
  'Strawberry': '/images/strawberry.png',
  'Mint Chocolate Chip': '/images/mint-chocolate.png',
  'Cookies and Cream': '/images/cookies-cream.png',
  'Pistachio': '/images/pistachio.png',
  'Rocky Road': '/images/rocky-road.png',
  'Butter Pecan': '/images/butter-pecan.png',
  'Coffee': '/images/coffee.png',
  'Salted Caramel': '/images/salted-caramel.png',
  'Cookie Dough': '/images/cookie-dough.png',
  // Special flavors
  'Mango Sorbet': '/images/mango-sorbet.png',
  'Lavender Honey': '/images/lavender-honey.png',
  'Maple Walnut': '/images/maple-walnut.png',
  'Dark Chocolate Orange': '/images/dark-chocolate-orange.png',
  'Birthday Cake': '/images/birthday-cake.png'
};

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

  const getItemImage = (itemName) => {
    // If no image mapping found, use a default image
    return flavorImages[itemName] || '/images/default-ice-cream.png';
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 text-red-500 text-center">
      {error}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Our Flavors</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item.Item_ID} 
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 
                ${selectedItem?.Item_ID === item.Item_ID ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative w-full h-48">
                  <img 
                    src={getItemImage(item.Item_Name)}
                    alt={item.Item_Name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-ice-cream.png';
                    }}
                  />
                  {item.LowStock && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      Low Stock
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{item.Item_Name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToBasket(item);
                      }}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-blue-600">${Number(item.Unit_Price).toFixed(2)}</p>
                </div>
              </div>

              {selectedItem?.Item_ID === item.Item_ID && itemDetails && (
                <div className="p-4 bg-gray-50 border-t">
                  <h4 className="font-semibold mb-2">Nutrition Facts</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-medium">Calories:</p>
                      <p>{itemDetails.Calories}</p>
                    </div>
                    <div>
                      <p className="font-medium">Protein:</p>
                      <p>{itemDetails.Protein}g</p>
                    </div>
                    <div>
                      <p className="font-medium">Sugar:</p>
                      <p>{itemDetails.Sugar}g</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Carbs:</p>
                      <p>{itemDetails.Total_Carbs}g</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Fat:</p>
                      <p>{itemDetails.Total_Fat}g</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Shop;