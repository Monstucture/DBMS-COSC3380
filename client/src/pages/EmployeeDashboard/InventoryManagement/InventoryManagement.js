import { useState, useEffect } from 'react';
import { shopService } from '../../../api';

function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    Item_Name: '',
    Unit_Price: '',
    Quantity: '',
    Calories: '',
    Protein: '',
    Sugar: '',
    Total_Carbs: '',
    Total_Fat: ''
  });
  const [inventoryLogs, setInventoryLogs] = useState([]);

  const fetchItems = async () => {
    try {
      const data = await shopService.getAllFlavors();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error loading items');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryLogs = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const logs = await shopService.getInventoryLogs(startDate, new Date());
      setInventoryLogs(logs);
    } catch (err) {
      console.error('Error fetching inventory logs:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchInventoryLogs();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await shopService.createFlavor(newItem);
      await fetchItems();
      setNewItem({
        Item_Name: '',
        Unit_Price: '',
        Quantity: '',
        Calories: '',
        Protein: '',
        Sugar: '',
        Total_Carbs: '',
        Total_Fat: ''
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Error adding item');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await shopService.updateFlavor(editingItem.Item_ID, editingItem);
      await fetchItems();
      setEditingItem(null);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error updating item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await shopService.deleteFlavor(itemId);
        await fetchItems();
        await fetchInventoryLogs();
        setError(null);
      } catch (err) {
        if (err.status === 404) {
          setError('Item not found. It may have been already deleted.');
          fetchItems();
        } else {
          setError(err.message || 'Error deleting item');
        }
      }
    }
  };

  const handleOrderMore = async (itemId, quantity) => {
    try {
      const userRole = localStorage.getItem('userRole');
      const currentItem = items.find(item => item.Item_ID === itemId);
      const newQuantity = currentItem.Quantity + quantity;
  
      await shopService.updateQuantity(itemId, newQuantity, userRole);
      await fetchItems();
      await fetchInventoryLogs();
      setError(null);
    } catch (err) {
      setError(err.message || 'Error updating quantity');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 mb-6">{error}</div>}

      {/* Add New Item Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Add New Item</h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2">Item Name</label>
            <input
              type="text"
              value={newItem.Item_Name}
              onChange={(e) => setNewItem({...newItem, Item_Name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Price</label>
            <input
              type="number"
              value={newItem.Unit_Price}
              onChange={(e) => setNewItem({...newItem, Unit_Price: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Quantity</label>
            <div className="flex items-center">
              <input
                type="number"
                value={newItem.Quantity}
                onChange={(e) => setNewItem({...newItem, Quantity: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-2">Calories</label>
            <input
              type="number"
              value={newItem.Calories}
              onChange={(e) => setNewItem({...newItem, Calories: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Protein</label>
            <input
              type="number"
              value={newItem.Protein}
              onChange={(e) => setNewItem({...newItem, Protein: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Sugar</label>
            <input
              type="number"
              value={newItem.Sugar}
              onChange={(e) => setNewItem({...newItem, Sugar: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Total Carbs</label>
            <input
              type="number"
              value={newItem.Total_Carbs}
              onChange={(e) => setNewItem({...newItem, Total_Carbs: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Total Fat</label>
            <input
              type="number"
              value={newItem.Total_Fat}
              onChange={(e) => setNewItem({...newItem, Total_Fat: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="col-span-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Item
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Current Inventory</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Item Name</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Quantity</th>
              <th className="text-left p-2">Calories</th>
              <th className="text-left p-2">Protein</th>
              <th className="text-left p-2">Sugar</th>
              <th className="text-left p-2">Total Carbs</th>
              <th className="text-left p-2">Total Fat</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.Item_ID} className="border-b">
                {editingItem?.Item_ID === item.Item_ID ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editingItem.Item_Name}
                        onChange={(e) => setEditingItem({...editingItem, Item_Name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Unit_Price}
                        onChange={(e) => setEditingItem({...editingItem, Unit_Price: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Quantity}
                        onChange={(e) => setEditingItem({...editingItem, Quantity: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Calories}
                        onChange={(e) => setEditingItem({...editingItem, Calories: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Protein}
                        onChange={(e) => setEditingItem({...editingItem, Protein: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Sugar}
                        onChange={(e) => setEditingItem({...editingItem, Sugar: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Total_Carbs}
                        onChange={(e) => setEditingItem({...editingItem, Total_Carbs: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Total_Fat}
                        onChange={(e) => setEditingItem({...editingItem, Total_Fat: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td>
                      <button
                        onClick={handleUpdateItem}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.Item_Name}</td>
                    <td>${item.Unit_Price}</td>
                    <td>{item.Quantity}</td>
                    <td>{item.Calories}</td>
                    <td>{item.Protein}g</td>
                    <td>{item.Sugar}g</td>
                    <td>{item.Total_Carbs}g</td>
                    <td>{item.Total_Fat}g</td>
                    <td>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOrderMore(item.Item_ID, 10)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                      >
                        Order 10 More
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.Item_ID)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inventory Logs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Inventory Logs</h2>
        {inventoryLogs.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Item</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Quantity Changed</th>
                <th className="text-left p-2">New Quantity</th>
                <th className="text-left p-2">Updated by</th>
              </tr>
            </thead>
            <tbody>
              {inventoryLogs.map(log => (
                <tr key={log.Log_ID} className="border-b">
                  <td className="p-2">{new Date(log.Action_Date).toLocaleString()}</td>
                  <td className="p-2">{log.Item_Name}</td>
                  <td className="p-2">{log.Action_Type}</td>
                  <td className="p-2">{log.Quantity_Changed >= 0 ? `+${log.Quantity_Changed}` : log.Quantity_Changed}</td>
                  <td className="p-2">{log.New_Quantity}</td>
                  <td className="p-2">{log.Action_By}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4">
            No inventory changes in the last 30 days
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryManagement;