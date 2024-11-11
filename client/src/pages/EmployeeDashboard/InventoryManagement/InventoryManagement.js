import { useState, useEffect } from 'react';
import { shopService } from '../../../api';
import styles from './InventoryManagement.css';

function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmQuantity, setConfirmQuantity] = useState(null);
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
      // Initialize items with temporary quantity field
      const itemsWithTemp = data.map(item => ({
        ...item,
        tempQuantity: item.Quantity
      }));
      setItems(itemsWithTemp);
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

  const handleQuantityChange = async (itemId, quantityToAdd) => {
    try {
      const userRole = localStorage.getItem('userRole');
      const item = items.find(i => i.Item_ID === itemId);
      const newTotalQuantity = item.Quantity + parseInt(quantityToAdd);
      
      await shopService.updateQuantity(itemId, newTotalQuantity, userRole);
      
      // Update local state immediately
      setItems(prevItems => prevItems.map(item => 
        item.Item_ID === itemId 
          ? { ...item, Quantity: newTotalQuantity, tempQuantity: 0 } // Reset tempQuantity after addition
          : item
      ));
      
      // Refresh inventory logs immediately after successful update
      await fetchInventoryLogs();
      setError(null);
    } catch (err) {
      setError(err.message || 'Error updating quantity');
      // Revert changes on error
      await fetchItems();
      await fetchInventoryLogs();
    }
  };

  const handleQuantityInputChange = (itemId, newValue) => {
    setItems(prevItems => prevItems.map(item => 
      item.Item_ID === itemId 
        ? { ...item, tempQuantity: newValue }
        : item
    ));
  };

  const handleApplyQuantity = (itemId, quantityToAdd, currentQuantity) => {
    const addQty = parseInt(quantityToAdd) || 0;
      handleQuantityChange(itemId, addQty);
  };

  const QuantityConfirmationModal = ({ onConfirm, onCancel, data }) => {
    if (!data) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h3>Confirm Quantity Addition</h3>
          <p>Current quantity: {data.currentQuantity}</p>
          <p>Quantity to add: {data.quantity}</p>
          <p>New total will be: {data.currentQuantity + data.quantity}</p>
          <div className={styles.modalButtons}>
            <button 
              onClick={() => {
                onConfirm(data.itemId, data.quantity);
                onCancel();
              }}
              className={styles.confirmButton}
            >
              Confirm
            </button>
            <button 
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuantityCell = (item) => (
    <td className={styles.quantityCell}>
      <div className={styles.quantityControl}>
        <input
          type="number"
          min="0"
          value={item.tempQuantity || ''}
          onChange={(e) => handleQuantityInputChange(item.Item_ID, e.target.value)}
          placeholder="Add quantity"
          className={`${styles.quantityInput} ${item.LowStock ? styles.lowStock : ''}`}
        />
        <button 
          onClick={() => handleApplyQuantity(
            item.Item_ID, 
            item.tempQuantity,
            item.Quantity
          )}
          className={styles.applyButton}
        >
          Add
        </button>
      </div>
      <div className={styles.currentStock}>
        Current Stock: {item.Quantity}
      </div>
      {item.LowStock && (
        <span className={styles.lowStockWarning}>
          Low Stock!
        </span>
      )}
    </td>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1>Inventory Management</h1>
      
      {error && <div className={styles.errorAlert} role="alert">{error}</div>}

      {/* Add New Item Form */}
      <div className={styles.formSection}>
        <h2>Add New Item</h2>
        <form onSubmit={handleAddItem} className={styles.form}>
          <div className={styles.formGrid}>
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.Item_Name}
              onChange={(e) => setNewItem({...newItem, Item_Name: e.target.value})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.Unit_Price}
              onChange={(e) => setNewItem({...newItem, Unit_Price: e.target.value})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Initial Quantity"
              value={newItem.Quantity}
              onChange={(e) => setNewItem({...newItem, Quantity: e.target.value})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Calories"
              value={newItem.Calories}
              onChange={(e) => setNewItem({...newItem, Calories: e.target.value})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={newItem.Protein}
              onChange={(e) => setNewItem({...newItem, Protein: e.target.value})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Sugar (g)"
              value={newItem.Sugar}
              onChange={(e) => setNewItem({...newItem, Sugar: e.target.value})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Total Carbs (g)"
              value={newItem.Total_Carbs}
              onChange={(e) => setNewItem({...newItem, Total_Carbs: e.target.value})}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Total Fat (g)"
              value={newItem.Total_Fat}
              onChange={(e) => setNewItem({...newItem, Total_Fat: e.target.value})}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.submitButton}>Add Item</button>
        </form>
      </div>

      {/* Items List */}
      <div className={styles.tableSection}>
        <h2>Current Inventory</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Calories</th>
              <th>Protein</th>
              <th>Sugar</th>
              <th>Total Carbs</th>
              <th>Total Fat</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.Item_ID} className={item.LowStock ? styles.lowStock : ''}>
                {editingItem?.Item_ID === item.Item_ID ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editingItem.Item_Name}
                        onChange={(e) => setEditingItem({...editingItem, Item_Name: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Unit_Price}
                        onChange={(e) => setEditingItem({...editingItem, Unit_Price: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    {renderQuantityCell(item)}
                    <td>
                      <input
                        type="number"
                        value={editingItem.Calories}
                        onChange={(e) => setEditingItem({...editingItem, Calories: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Protein}
                        onChange={(e) => setEditingItem({...editingItem, Protein: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Sugar}
                        onChange={(e) => setEditingItem({...editingItem, Sugar: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Total_Carbs}
                        onChange={(e) => setEditingItem({...editingItem, Total_Carbs: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingItem.Total_Fat}
                        onChange={(e) => setEditingItem({...editingItem, Total_Fat: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <button onClick={handleUpdateItem} className={styles.saveButton}>Save</button>
                      <button onClick={() => setEditingItem(null)} className={styles.cancelButton}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.Item_Name}</td>
                    <td>${item.Unit_Price}</td>
                    {renderQuantityCell(item)}
                    <td>{item.Calories}</td>
                    <td>{item.Protein}g</td>
                    <td>{item.Sugar}g</td>
                    <td>{item.Total_Carbs}g</td>
                    <td>{item.Total_Fat}g</td>
                    <td>
                      <button onClick={() => setEditingItem(item)} className={styles.editButton}>Edit</button>
                      <button onClick={() => handleDeleteItem(item.Item_ID)} className={styles.deleteButton}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inventory Logs */}
      <div className={styles.logsSection}>
        <h2>Inventory Logs</h2>
        {inventoryLogs.length > 0 ? (
          <table className={styles.logsTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Action</th>
                <th>Quantity Changed</th>
                <th>New Quantity</th>
                <th>Updated by</th>
              </tr>
            </thead>
            <tbody>
              {inventoryLogs.map(log => (
                <tr key={log.Log_ID}>
                  <td>{new Date(log.Action_Date).toLocaleString()}</td>
                  <td>{log.Item_Name}</td>
                  <td>{log.Action_Type}</td>
                  <td>{log.Quantity_Changed >= 0 ? `+${log.Quantity_Changed}` : log.Quantity_Changed}</td>
                  <td>{log.New_Quantity}</td>
                  <td>{log.Action_By}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.noLogs}>
            No inventory changes in the last 30 days
          </div>
        )}
      </div>

      <QuantityConfirmationModal 
        data={confirmQuantity}
        onConfirm={handleQuantityChange}
        onCancel={() => setConfirmQuantity(null)}
      />
    </div>
  );
}

export default InventoryManagement;