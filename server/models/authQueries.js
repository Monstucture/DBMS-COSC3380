const authQueries = {
    getEmployeeByCredentials: `
        SELECT * FROM Employee 
        WHERE Employee_ID = ? 
        AND First_Name = ? 
        AND Last_Name = ?
    `,

    getAdminByCredentials: `
        SELECT * FROM Admin
        WHERE Username = ?
        AND Password = ?
    `,
    
    getCustomerByPhone: `
        SELECT * FROM Customer 
        WHERE Phone_Number = ?
    `
};

module.exports = {
    authQueries
};