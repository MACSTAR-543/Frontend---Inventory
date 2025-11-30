# Inventory Management System - Deliverables

## 🔗 Live Links

**Frontend URL:** https://inventory-management-system-frontend-eta.vercel.app

**Backend API URL:** https://crud-api-4-cncd.onrender.com/api

## 📚 API Documentation

### Products Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Suppliers Endpoints
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Orders Endpoints
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

## 📸 Code Evidence - Frontend Using Deployed Backend

### 1. API Configuration (script.js)
```javascript
const API_BASE_URL = 'https://crud-api-4-cncd.onrender.com';
```
**Evidence:** The frontend is configured to use the deployed backend at `https://crud-api-4-cncd.onrender.com`

### 2. Products CRUD Operations

#### GET All Products
```javascript
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        products = data;
        renderProducts();
    } catch (error) {
        showError('Error loading products: ' + error.message);
    }
}
```

#### POST Create Product
```javascript
async function handleProductSubmit(e) {
    e.preventDefault();
    const formData = {
        sku: document.getElementById('sku').value,
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value)
    };
    
    const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
}
```

#### PUT Update Product
```javascript
response = await fetch(`${API_BASE_URL}/api/products/${currentEditingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

#### DELETE Product
```javascript
response = await fetch(`${API_BASE_URL}/api/products/${id}`, { 
    method: 'DELETE' 
});
```

### 3. Suppliers CRUD Operations

#### GET All Suppliers
```javascript
async function loadSuppliers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/suppliers`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        suppliers = data;
        renderSuppliers();
    } catch (error) {
        showError('Error loading suppliers: ' + error.message);
    }
}
```

#### POST Create Supplier
```javascript
response = await fetch(`${API_BASE_URL}/api/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

### 4. Orders CRUD Operations

#### GET All Orders
```javascript
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        orders = data;
        renderOrders();
    } catch (error) {
        showError('Error loading orders: ' + error.message);
    }
}
```

#### POST Create Order
```javascript
response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

## 🚀 Features Implemented

### Frontend Features:
- ✅ Responsive design with modern UI
- ✅ Complete CRUD for Products
- ✅ Complete CRUD for Suppliers  
- ✅ Complete CRUD for Orders
- ✅ Real-time data fetching from deployed backend
- ✅ Form validation and error handling
- ✅ Loading states and user feedback
- ✅ Confirmation modals for deletions

### Backend Features:
- ✅ MongoDB database
- ✅ RESTful API endpoints
- ✅ CORS enabled for frontend
- ✅ Error handling and validation
- ✅ Deployed on Render

## 🛠 Technical Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Responsive CSS Grid/Flexbox
- Fetch API for HTTP requests
- Font Awesome icons

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- CORS middleware

## 📱 Application Screens

### Products Management
- View all products with SKU, name, price, stock
- Add new products with validation
- Edit existing products
- Delete products with confirmation
- Stock status indicators (In Stock, Low Stock, Out of Stock)

### Suppliers Management  
- View all suppliers with contact information
- Add new suppliers
- Edit supplier details
- Delete suppliers

### Orders Management
- View all orders with supplier, items, total, and status
- Create new orders with multiple items
- Select products and suppliers from dropdowns
- Auto-calculate order totals
- Update order status
- Delete orders

## 🔒 Error Handling

The application includes comprehensive error handling:
- Network error detection
- HTTP status code checking
- Form validation with error messages
- User-friendly error displays
- Loading states during API calls

## 📋 Usage Instructions

1. **Access the application:** Visit the frontend URL
2. **Navigate between sections:** Use the top navigation (Products, Suppliers, Orders)
3. **View data:** Each section displays the current data from the backend
4. **Add new items:** Click "Add Product", "Add Supplier", or "Create Order"
5. **Edit items:** Click the "Edit" button on any item
6. **Delete items:** Click the "Delete" button (requires confirmation)

The application successfully demonstrates a full-stack CRUD workflow with a deployed frontend communicating with a deployed backend API, featuring complete inventory management operations for products, suppliers, and orders.
