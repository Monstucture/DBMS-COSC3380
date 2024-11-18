// Format date to show only Month and Day (e.g., "Nov 18")
export const formatDateMD = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format date to show only Month (e.g., "November")
  export const formatMonth = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long' });
  };
  
  // Get month-to-date comparison
  export const getMonthToDateComparison = (currentData, previousData) => {
    const currentTotal = currentData?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
    const previousTotal = previousData?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
    const percentChange = previousTotal !== 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;
    
    return {
      currentTotal,
      previousTotal,
      percentChange
    };
  };
  
  // Generate detail string for data point
  export const generateDetailString = (data, type) => {
    if (!data) return '';
    
    let details = [];
    switch (type) {
      case 'sales':
        details = [
          `Transaction ID: ${data.Transaction_ID}`,
          `Customer: ${data.Customer_Name}`,
          `Items: ${data.Items.join(', ')}`,
          `Payment Type: ${data.Payment_Type}`,
          `Total: $${data.Total_Price}`
        ];
        break;
      case 'inventory':
        details = [
          `Action Type: ${data.Action_Type}`,
          `Changed By: ${data.Action_By}`,
          `Previous Quantity: ${data.Previous_Quantity}`,
          `New Quantity: ${data.New_Quantity}`,
          `Date: ${formatDateMD(data.Action_Date)}`
        ];
        break;
      case 'customer':
        details = [
          `Join Date: ${formatDateMD(data.Account_Creation_Date)}`,
          `Total Orders: ${data.Total_Orders}`,
          `Total Points: ${data.Total_Points}`,
          `Membership Level: ${data.Membership_Level}`,
          `Latest Transaction: ${data.Latest_Transaction_Date ? formatDateMD(data.Latest_Transaction_Date) : 'N/A'}`
        ];
        break;
      default:
        break;
    }
    return details.join('\n');
  };