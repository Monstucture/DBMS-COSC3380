# TEAM 7 Ice Cream Shop Management System

A web-based management system for ice cream shops with separate interfaces for administrators (employees) and customers.

## Features

### Customer Features

- Phone number-based login system
- View ice cream flavors and details
- Track loyalty points and membership status
- View order history

### Admin Features

- Secure employee login system
- Inventory management
- View and manage products
- Sale Reports & Inventory Reports
- Customer Analytics

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- [MySQL](https://www.mysql.com/) (v8.0 or higher)
- [Git](https://git-scm.com/) (for cloning the repository)

## Project Structure

```text
root/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API configuration
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   ├── App.js        
└── server/                # Node.js backend
    ├── config/            # Database configuration
    ├── routes/           # API routes
    ├── middlewares/      # Auth middle ware 
    ├── models/           # SQL queries
    ├── utils/            # reusable error constances
    ├── controllers/      # Hooks for routes to use services
    ├── services/         # actual funcions GET, POST, PUT
    ├── server.js         
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <root folder>
```

### 2. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Required backend dependencies:

```bash
npm install 
```

Create a `.env` file in the server directory:

```env
MYSQL_HOST=your_host
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
MYSQL_PORT=your_port
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Setup

Navigate to the client directory and install dependencies:

```bash
cd ../client
npm install
```

Required frontend dependencies:

```bash
npm install 
```

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Running the Application

Start the backend server:

```bash
cd server
npm start
# Server will run on http://localhost:5000
```

Start the frontend application:

```bash
cd client
npm start
# Client will run on http://localhost:3000
```

## API Endpoints

### Authentication

- POST `/auth/admin/login` - Employee login
- POST `/auth/customer/login` - Customer login

### Shop

- GET `/shop/all-flavors` - Get all ice cream flavors
- GET `/shop/all-flavors/:id` - Get specific flavor details

### Customer Account

- GET `/acc/customer/account` - Get customer account details
- PUT `/acc/customer/account` - Update customer information
- GET `/acc/customer/orders` - Get customer order history

## Deployment

### Backend (Vercel)

Create vercel.json:

```json
{
  "version": 2,
  "builds": [{"src": "server.js", "use": "@vercel/node"}],
  "routes": [{
    "src": "/(.*)",
    "dest": "server.js",
    "headers": {
      "Access-Control-Allow-Origin": "https://dbms-cosc-3380client.vercel.app/"
    }
  }]
}
```

### Frontend (Vercel)

1. Update environment variables in Vercel dashboard
2. Configure build settings
3. Deploy from GitHub repository

## Common Issues & Troubleshooting

1. CORS Issues
   - Check CORS configuration in server.js
   - Verify frontend URL in backend CORS settings
   - Ensure proper headers in requests

2. Authentication Issues
   - Check token in localStorage
   - Verify token format in API requests
   - Confirm JWT_SECRET matches between environments

3. Database Connection
   - Verify database credentials
   - Check SSL configuration
   - Ensure proper port access

## License

This project is part of the COSC 3380 course at the University of Houston.
