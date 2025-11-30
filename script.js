const API_BASE_URL = 'https://crud-api-4-cncd.onrender.com';

// State management
let currentEditingId = null;
let products = [];
let suppliers = [];
let orders = [];

// DOM Elements
const sections = {
    products: document.getElementById('products'),
    suppliers: document.getElementById('suppliers'),
    orders: document.getElementById('orders')
};

const navButtons = document.querySelectorAll('.nav-btn');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupModalScrolling();
    loadInitialData();
    showSection('products');
}

function setupEventListeners() {
    // Navigation
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            showSection(section);
        });
    });

    // Product form
    document.getElementById('addProductBtn').addEventListener('click', () => openProductForm());
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('cancelProductBtn').addEventListener('click', () => closeProductForm());

    // Supplier form
    document.getElementById('addSupplierBtn').addEventListener('click', () => openSupplierForm());
    document.getElementById('supplierForm').addEventListener('submit', handleSupplierSubmit);
    document.getElementById('cancelSupplierBtn').addEventListener('click', () => closeSupplierForm());

    // Order form
    document.getElementById('addOrderBtn').addEventListener('click', () => openOrderForm());
    document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
    document.getElementById('cancelOrderBtn').addEventListener('click', () => closeOrderForm());
    document.getElementById('addOrderItemBtn').addEventListener('click', addOrderItem);

    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Confirmation modal
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeConfirmModal());
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    // Order total calculation
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity') || e.target.classList.contains('price')) {
            calculateOrderTotal();
        }
    });

    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('product-select')) {
            calculateOrderTotal();
        }
    });
}

function setupModalScrolling() {
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
        modal.addEventListener('scroll', function() {
            const formActions = this.querySelector('.form-actions');
            if (formActions) {
                const isAtBottom = this.scrollHeight - this.scrollTop === this.clientHeight;
                if (isAtBottom) {
                    formActions.style.background = 'transparent';
                    formActions.style.position = 'relative';
                } else {
                    formActions.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                    formActions.style.position = 'sticky';
                }
            }
        });
    });
}

// Navigation
function showSection(sectionName) {
    // Update navigation buttons
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });

    // Show/hide sections
    Object.keys(sections).forEach(key => {
        sections[key].classList.toggle('active', key === sectionName);
    });

    // Refresh section data
    switch(sectionName) {
        case 'products':
            loadProducts();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

// Data Loading
async function loadInitialData() {
    showLoading();
    try {
        await Promise.all([
            loadProducts(),
            loadSuppliers(),
            loadOrders()
        ]);
    } catch (error) {
        showError('Failed to load initial data: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('Products loaded:', data);
        products = data;
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Error loading products: ' + error.message);
    }
}

async function loadSuppliers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/suppliers`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('Suppliers loaded:', data);
        suppliers = data;
        renderSuppliers();
    } catch (error) {
        console.error('Error loading suppliers:', error);
        showError('Error loading suppliers: ' + error.message);
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('Orders loaded:', data);
        orders = data;
        renderOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Error loading orders: ' + error.message);
    }
}

// Rendering Functions
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center; color: #666; padding: 3rem;">No products found. Click "Add Product" to get started.</td>`;
        tbody.appendChild(row);
        return;
    }

    products.forEach(product => {
        const status = getProductStatus(product.stock);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${product.sku || 'N/A'}</strong></td>
            <td>${product.name || 'N/A'}</td>
            <td>$${(product.price || 0).toFixed(2)}</td>
            <td>${product.stock || 0}</td>
            <td><span class="status-badge ${status.class}">${status.text}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editProduct('${product._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderSuppliers() {
    const tbody = document.getElementById('suppliersTableBody');
    tbody.innerHTML = '';

    if (suppliers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" style="text-align: center; color: #666; padding: 3rem;">No suppliers found. Click "Add Supplier" to get started.</td>`;
        tbody.appendChild(row);
        return;
    }

    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${supplier.name || 'N/A'}</strong></td>
            <td>${supplier.contact || 'N/A'}</td>
            <td><span class="status-badge status-in-stock">Active</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editSupplier('${supplier._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier('${supplier._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center; color: #666; padding: 3rem;">No orders found. Click "Create Order" to get started.</td>`;
        tbody.appendChild(row);
        return;
    }

    orders.forEach(order => {
        console.log('Processing order:', order);
        
        // Find supplier
        const supplier = suppliers.find(s => 
            s._id === order.supplierId || 
            s._id === order.supplier ||
            (order.supplierId && s._id === order.supplierId._id)
        );
        
        // Process order items and calculate total
        let itemsText = 'No items';
        let total = 0;
        
        if (order.items && order.items.length > 0) {
            itemsText = order.items.map(item => {
                const product = products.find(p => 
                    p._id === item.productId || 
                    p._id === item.product ||
                    (item.productId && p._id === item.productId._id)
                );
                
                const productName = product ? product.name : 'Unknown Product';
                const quantity = item.qty || item.quantity || 1;
                const price = item.price || 0;
                const itemTotal = quantity * price;
                total += itemTotal;
                
                return `${productName} (${quantity})`;
            }).join(', ');
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}</strong></td>
            <td>${supplier ? supplier.name : 'Unknown Supplier'}</td>
            <td>${itemsText}</td>
            <td>$${total.toFixed(2)}</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="editOrder('${order._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Product CRUD Operations
function openProductForm(product = null) {
    currentEditingId = product ? product._id : null;
    const form = document.getElementById('productForm');
    const title = document.getElementById('productFormTitle');
    const modal = document.getElementById('productFormModal');
    
    if (product) {
        title.textContent = 'Edit Product';
        document.getElementById('sku').value = product.sku || '';
        document.getElementById('productName').value = product.name || '';
        document.getElementById('price').value = product.price || '';
        document.getElementById('stock').value = product.stock || '';
    } else {
        title.textContent = 'Add New Product';
        form.reset();
    }
    
    clearErrors();
    modal.classList.add('active');
    
    setTimeout(() => {
        modal.scrollTop = 0;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }, 100);
}

function closeProductForm() {
    document.getElementById('productFormModal').classList.remove('active');
    currentEditingId = null;
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    if (!validateProductForm()) return;
    
    const formData = {
        sku: document.getElementById('sku').value,
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value)
    };
    
    showLoading();
    try {
        let response;
        if (currentEditingId) {
            response = await fetch(`${API_BASE_URL}/api/products/${currentEditingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Product saved:', result);
        
        closeProductForm();
        await loadProducts();
        showSuccess('Product saved successfully!');
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Error saving product: ' + error.message);
    } finally {
        hideLoading();
    }
}

function validateProductForm() {
    let isValid = true;
    clearErrors();
    
    const sku = document.getElementById('sku').value;
    const name = document.getElementById('productName').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;
    
    if (!sku.trim()) {
        showFieldError('skuError', 'SKU is required');
        isValid = false;
    }
    
    if (!name.trim()) {
        showFieldError('nameError', 'Name is required');
        isValid = false;
    }
    
    if (!price || parseFloat(price) <= 0) {
        showFieldError('priceError', 'Price must be greater than 0');
        isValid = false;
    }
    
    if (!stock || parseInt(stock) < 0) {
        showFieldError('stockError', 'Stock must be 0 or greater');
        isValid = false;
    }
    
    return isValid;
}

async function editProduct(id) {
    const product = products.find(p => p._id === id);
    if (product) {
        openProductForm(product);
    }
}

async function deleteProduct(id) {
    const product = products.find(p => p._id === id);
    openConfirmModal('product', id, `Are you sure you want to delete "${product?.name}"?`);
}

// Supplier CRUD Operations
function openSupplierForm(supplier = null) {
    currentEditingId = supplier ? supplier._id : null;
    const form = document.getElementById('supplierForm');
    const title = document.getElementById('supplierFormTitle');
    const modal = document.getElementById('supplierFormModal');
    
    if (supplier) {
        title.textContent = 'Edit Supplier';
        document.getElementById('supplierName').value = supplier.name || '';
        document.getElementById('contact').value = supplier.contact || '';
    } else {
        title.textContent = 'Add New Supplier';
        form.reset();
    }
    
    clearErrors();
    modal.classList.add('active');
    
    setTimeout(() => {
        modal.scrollTop = 0;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }, 100);
}

function closeSupplierForm() {
    document.getElementById('supplierFormModal').classList.remove('active');
    currentEditingId = null;
}

async function handleSupplierSubmit(e) {
    e.preventDefault();
    
    if (!validateSupplierForm()) return;
    
    const formData = {
        name: document.getElementById('supplierName').value,
        contact: document.getElementById('contact').value
    };
    
    showLoading();
    try {
        let response;
        if (currentEditingId) {
            response = await fetch(`${API_BASE_URL}/api/suppliers/${currentEditingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/api/suppliers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Supplier saved:', result);
        
        closeSupplierForm();
        await loadSuppliers();
        showSuccess('Supplier saved successfully!');
    } catch (error) {
        console.error('Error saving supplier:', error);
        showError('Error saving supplier: ' + error.message);
    } finally {
        hideLoading();
    }
}

function validateSupplierForm() {
    let isValid = true;
    clearErrors();
    
    const name = document.getElementById('supplierName').value;
    const contact = document.getElementById('contact').value;
    
    if (!name.trim()) {
        showFieldError('supplierNameError', 'Name is required');
        isValid = false;
    }
    
    if (!contact.trim()) {
        showFieldError('contactError', 'Contact information is required');
        isValid = false;
    }
    
    return isValid;
}

async function editSupplier(id) {
    const supplier = suppliers.find(s => s._id === id);
    if (supplier) {
        openSupplierForm(supplier);
    }
}

async function deleteSupplier(id) {
    const supplier = suppliers.find(s => s._id === id);
    openConfirmModal('supplier', id, `Are you sure you want to delete "${supplier?.name}"?`);
}

// Order CRUD Operations
function openOrderForm(order = null) {
    currentEditingId = order ? order._id : null;
    const form = document.getElementById('orderForm');
    const title = document.getElementById('orderFormTitle');
    const modal = document.getElementById('orderFormModal');
    
    // Populate supplier dropdown
    const supplierSelect = document.getElementById('supplierSelect');
    supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier._id;
        option.textContent = supplier.name;
        supplierSelect.appendChild(option);
    });
    
    // Clear order items
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = '';
    
    if (order) {
        title.textContent = 'Edit Order';
        document.getElementById('supplierSelect').value = order.supplierId || '';
        document.getElementById('status').value = order.status || 'pending';
        
        // Add order items
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                addOrderItem(item);
            });
        } else {
            addOrderItem();
        }
    } else {
        title.textContent = 'Create New Order';
        form.reset();
        addOrderItem();
    }
    
    clearErrors();
    modal.classList.add('active');
    
    setTimeout(() => {
        modal.scrollTop = 0;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
        
        calculateOrderTotal();
        
        // Ensure order items container is properly sized
        if (orderItemsContainer.children.length > 3) {
            orderItemsContainer.style.maxHeight = '250px';
        } else {
            orderItemsContainer.style.maxHeight = '300px';
        }
    }, 100);
}

function closeOrderForm() {
    document.getElementById('orderFormModal').classList.remove('active');
    currentEditingId = null;
}

function addOrderItem(item = null) {
    const orderItems = document.getElementById('orderItems');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    
    itemDiv.innerHTML = `
        <select class="product-select" required>
            <option value="">Select Product</option>
            ${products.map(p => `<option value="${p._id}" data-price="${p.price}" ${item && item.productId === p._id ? 'selected' : ''}>${p.name} ($${p.price})</option>`).join('')}
        </select>
        <input type="number" class="quantity" placeholder="Qty" min="1" value="${item ? (item.qty || item.quantity || '') : ''}" required>
        <input type="number" class="price" placeholder="Price" step="0.01" min="0" value="${item ? (item.price || '') : ''}" required>
        <button type="button" class="remove-item-btn" onclick="removeOrderItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add event listeners for auto-fill price
    const productSelect = itemDiv.querySelector('.product-select');
    const priceInput = itemDiv.querySelector('.price');
    
    productSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.price) {
            priceInput.value = selectedOption.dataset.price;
            calculateOrderTotal();
        }
    });
    
    // Auto-fill price if product is pre-selected
    if (item && item.productId) {
        const product = products.find(p => p._id === item.productId);
        if (product && !item.price) {
            priceInput.value = product.price;
        }
    }
    
    // Add input listeners for total calculation
    const quantityInput = itemDiv.querySelector('.quantity');
    quantityInput.addEventListener('input', calculateOrderTotal);
    priceInput.addEventListener('input', calculateOrderTotal);
    
    orderItems.appendChild(itemDiv);
    
    // Adjust container height if needed
    setTimeout(() => {
        if (orderItems.children.length > 3) {
            orderItems.style.maxHeight = '250px';
        }
        // Scroll to the new item
        itemDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        calculateOrderTotal();
    }, 100);
}

function removeOrderItem(button) {
    const itemDiv = button.parentElement;
    itemDiv.remove();
    
    const orderItems = document.getElementById('orderItems');
    // Adjust container height
    if (orderItems.children.length <= 3) {
        orderItems.style.maxHeight = '300px';
    }
    calculateOrderTotal();
}

function calculateOrderTotal() {
    const orderItems = document.querySelectorAll('.order-item');
    let total = 0;
    
    orderItems.forEach(itemDiv => {
        const quantity = itemDiv.querySelector('.quantity').value;
        const price = itemDiv.querySelector('.price').value;
        
        if (quantity && price) {
            total += parseFloat(quantity) * parseFloat(price);
        }
    });
    
    document.getElementById('orderTotal').textContent = total.toFixed(2);
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (!validateOrderForm()) return;
    
    const items = Array.from(document.querySelectorAll('.order-item')).map(itemDiv => {
        const productSelect = itemDiv.querySelector('.product-select');
        const quantity = itemDiv.querySelector('.quantity');
        const price = itemDiv.querySelector('.price');
        
        return {
            productId: productSelect.value,
            qty: parseInt(quantity.value),
            price: parseFloat(price.value)
        };
    });
    
    const formData = {
        supplierId: document.getElementById('supplierSelect').value,
        status: document.getElementById('status').value,
        items: items
    };
    
    console.log('Submitting order:', formData);
    
    showLoading();
    try {
        let response;
        if (currentEditingId) {
            response = await fetch(`${API_BASE_URL}/api/orders/${currentEditingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Order saved:', result);
        
        closeOrderForm();
        await loadOrders();
        showSuccess('Order saved successfully!');
    } catch (error) {
        console.error('Error saving order:', error);
        showError('Error saving order: ' + error.message);
    } finally {
        hideLoading();
    }
}

function validateOrderForm() {
    let isValid = true;
    clearErrors();
    
    const supplierId = document.getElementById('supplierSelect').value;
    const orderItems = document.querySelectorAll('.order-item');
    
    if (!supplierId) {
        showFieldError('supplierSelectError', 'Please select a supplier');
        isValid = false;
    }
    
    if (orderItems.length === 0) {
        showError('Please add at least one item to the order');
        isValid = false;
    }
    
    orderItems.forEach((itemDiv, index) => {
        const productSelect = itemDiv.querySelector('.product-select');
        const quantity = itemDiv.querySelector('.quantity');
        const price = itemDiv.querySelector('.price');
        
        if (!productSelect.value) {
            showError(`Please select a product for item ${index + 1}`);
            isValid = false;
        }
        
        if (!quantity.value || parseInt(quantity.value) <= 0) {
            showError(`Please enter a valid quantity for item ${index + 1}`);
            isValid = false;
        }
        
        if (!price.value || parseFloat(price.value) <= 0) {
            showError(`Please enter a valid price for item ${index + 1}`);
            isValid = false;
        }
    });
    
    return isValid;
}

async function editOrder(id) {
    const order = orders.find(o => o._id === id);
    if (order) {
        openOrderForm(order);
    }
}

async function deleteOrder(id) {
    const order = orders.find(o => o._id === id);
    openConfirmModal('order', id, `Are you sure you want to delete order #${order?._id.slice(-8).toUpperCase()}?`);
}

// Confirmation Modal
let pendingDelete = { type: null, id: null };

function openConfirmModal(type, id, message) {
    pendingDelete = { type, id };
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    pendingDelete = { type: null, id: null };
}

async function confirmDelete() {
    const { type, id } = pendingDelete;
    
    showLoading();
    try {
        let response;
        switch (type) {
            case 'product':
                response = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
                break;
            case 'supplier':
                response = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, { method: 'DELETE' });
                break;
            case 'order':
                response = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: 'DELETE' });
                break;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        closeConfirmModal();
        
        // Reload the appropriate data
        switch (type) {
            case 'product':
                await loadProducts();
                break;
            case 'supplier':
                await loadSuppliers();
                break;
            case 'order':
                await loadOrders();
                break;
        }
        
        showSuccess('Item deleted successfully!');
    } catch (error) {
        console.error('Error deleting item:', error);
        showError('Error deleting item: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Utility Functions
function showLoading() {
    loadingSpinner.classList.add('active');
}

function hideLoading() {
    loadingSpinner.classList.remove('active');
}

function showError(message) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> ${message}
    `;
    
    // Add to page
    document.querySelector('.main-content').insertBefore(alert, document.querySelector('.content-section.active .section-header'));
    
    // Remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showSuccess(message) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `
        <i class="fas fa-check-circle"></i> ${message}
    `;
    
    // Add to page
    document.querySelector('.main-content').insertBefore(alert, document.querySelector('.content-section.active .section-header'));
    
    // Remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    
    // Remove any existing alerts
    document.querySelectorAll('.alert').forEach(alert => {
        alert.remove();
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    currentEditingId = null;
    
    // Reset any dynamic styles
    const orderItems = document.getElementById('orderItems');
    if (orderItems) {
        orderItems.style.maxHeight = '300px';
    }
}

function getProductStatus(stock) {
    if (stock === 0) {
        return { class: 'status-out-of-stock', text: 'Out of Stock' };
    } else if (stock < 10) {
        return { class: 'status-low-stock', text: 'Low Stock' };
    } else {
        return { class: 'status-in-stock', text: 'In Stock' };
    }
}

// Debug function to check data
function debugData() {
    console.log('=== DEBUG DATA ===');
    console.log('Products:', products);
    console.log('Suppliers:', suppliers);
    console.log('Orders:', orders);
    
    // Check specific order data
    orders.forEach((order, index) => {
        console.log(`Order ${index}:`, order);
        console.log(`- Supplier ID: ${order.supplierId}`);
        console.log(`- Items:`, order.items);
        
        // Find supplier for this order
        const supplier = suppliers.find(s => s._id === order.supplierId);
        console.log(`- Found Supplier:`, supplier);
        
        // Find products for items
        if (order.items) {
            order.items.forEach((item, itemIndex) => {
                const product = products.find(p => p._id === item.productId);
                console.log(`- Item ${itemIndex} Product:`, product);
            });
        }
    });
}

// Add debug button for testing
setTimeout(() => {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Debug Data';
    debugBtn.className = 'btn btn-secondary';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.zIndex = '1000';
    debugBtn.style.fontSize = '12px';
    debugBtn.style.padding = '5px 10px';
    debugBtn.onclick = debugData;
    document.body.appendChild(debugBtn);
}, 2000);