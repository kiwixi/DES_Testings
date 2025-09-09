// Authentication System for Delta Electric
// Handles both customer and admin authentication

class AuthSystem {
  constructor() {
    this.customers = demoCustomers;
    this.saveCustomers();
  }

  // Customer Registration
  registerCustomer(customerData) {
    // Validate required fields
    if (!customerData.firstName || !customerData.lastName || !customerData.email || !customerData.password) {
      throw new Error('All required fields must be filled');
    }

    // Check if email already exists
    const existingCustomer = this.customers.find(c => c.email === customerData.email);
    if (existingCustomer) {
      throw new Error('An account with this email already exists');
    }

    // Validate password confirmation
    if (customerData.password !== customerData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Create new customer
    const newCustomer = {
      id: Date.now(),
      email: customerData.email,
      password: customerData.password, // In production, hash this!
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone || '',
      company: customerData.company || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      orders: [],
      favorites: []
    };

    this.customers.push(newCustomer);
    this.saveCustomers();
    return newCustomer;
  }

  // Customer Login
  loginCustomer(email, password) {
    const customer = this.customers.find(c => c.email === email && c.password === password);
    if (!customer) {
      throw new Error('Invalid email or password');
    }

    if (customer.status !== 'active') {
      throw new Error('Account is inactive. Please contact support.');
    }

    this.currentUser = customer;
    this.userType = 'customer';
    this.saveAuthState();
    this.updateUIForLoggedInUser();
    return customer;
  }

  // Admin Login
  loginAdmin(username, password) {
    const admin = this.admins.find(a => a.username === username && a.password === password);
    if (!admin) {
      throw new Error('Invalid administrator credentials');
    }

    this.currentUser = admin;
    this.userType = 'admin';
    this.saveAuthState();
    this.updateUIForLoggedInUser();
    return admin;
  }

  // Logout
  logout() {
    this.currentUser = null;
    this.userType = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    this.updateUIForLoggedOutUser();
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Check if current user is admin
  isAdmin() {
    return this.userType === 'admin';
  }

  // Check if current user is customer
  isCustomer() {
    return this.userType === 'customer';
  }

  // Get current user info
  getCurrentUser() {
    return this.currentUser;
  }

  // Save customers to localStorage
  saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(this.customers));
  }

  // Save auth state
  saveAuthState() {
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    localStorage.setItem('userType', this.userType);
  }

  // Update UI for logged in user
  updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn') || document.querySelector('.login-btn');
    const adminBtn = document.getElementById('adminBtn');
    const customerBtn = document.getElementById('customerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');

    if (this.isAdmin()) {
      if (adminBtn) adminBtn.classList.remove('hidden');
      if (customerBtn) customerBtn.classList.add('hidden');
    } else if (this.isCustomer()) {
      if (customerBtn) customerBtn.classList.remove('hidden');
      if (adminBtn) adminBtn.classList.add('hidden');
      
      // Show customer-only sections
      document.querySelectorAll('.customer-only').forEach(el => {
        el.classList.add('show');
      });
    }
  }

  // Update UI for logged out user
  updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn') || document.querySelector('.login-btn');
    const adminBtn = document.getElementById('adminBtn');
    const customerBtn = document.getElementById('customerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (adminBtn) adminBtn.classList.add('hidden');
    if (customerBtn) customerBtn.classList.add('hidden');

    // Hide customer-only sections
    document.querySelectorAll('.customer-only').forEach(el => {
      el.classList.remove('show');
    });

    // Hide admin controls
    const adminControls = document.getElementById('adminControls');
    if (adminControls) adminControls.classList.remove('active');
  }

  // Admin: Get all customers
  getAllCustomers() {
    if (!this.isAdmin()) {
      throw new Error('Access denied: Admin privileges required');
    }
    return this.customers;
  }

  // Admin: Update customer status
  updateCustomerStatus(customerId, status) {
    if (!this.isAdmin()) {
      throw new Error('Access denied: Admin privileges required');
    }

    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    customer.status = status;
    this.saveCustomers();
    return customer;
  }

  // Admin: Delete customer
  deleteCustomer(customerId) {
    if (!this.isAdmin()) {
      throw new Error('Access denied: Admin privileges required');
    }

    const index = this.customers.findIndex(c => c.id === customerId);
    if (index === -1) {
      throw new Error('Customer not found');
    }

    this.customers.splice(index, 1);
    this.saveCustomers();
    return true;
  }

  // Customer: Add to favorites
  addToFavorites(customerId, productId) {
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (!customer.favorites.includes(productId)) {
      customer.favorites.push(productId);
      this.saveCustomers();
    }
    return customer.favorites;
  }

  // Customer: Remove from favorites
  removeFromFavorites(customerId, productId) {
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const index = customer.favorites.indexOf(productId);
    if (index > -1) {
      customer.favorites.splice(index, 1);
      this.saveCustomers();
    }
    return customer.favorites;
  }
}

// Initialize authentication system
const auth = new AuthSystem();

// Global authentication functions for the UI
function showLoginModal() {
  document.getElementById('loginModal').classList.add('active');
  switchLoginType('customer'); // Default to customer login
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
  document.getElementById('loginError').textContent = '';
  
  // Reset forms
  document.querySelectorAll('#loginModal form').forEach(form => form.reset());
}

function switchLoginType(type) {
  const customerForm = document.getElementById('customerLoginForm');
  const adminForm = document.getElementById('adminLoginForm');
  const registerForm = document.getElementById('registerForm');
  const buttons = document.querySelectorAll('.login-type-btn');

  // Hide all forms
  customerForm.classList.add('hidden');
  adminForm.classList.add('hidden');
  registerForm.classList.add('hidden');

  // Remove active class from buttons
  buttons.forEach(btn => btn.classList.remove('active'));

  // Show selected form and activate button
  if (type === 'customer') {
    customerForm.classList.remove('hidden');
    buttons[0].classList.add('active');
  } else if (type === 'admin') {
    adminForm.classList.remove('hidden');
    buttons[1].classList.add('active');
  }
}

function showRegisterForm() {
  const customerForm = document.getElementById('customerLoginForm');
  const registerForm = document.getElementById('registerForm');
  
  customerForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
}

function showLoginForm() {
  const customerForm = document.getElementById('customerLoginForm');
  const registerForm = document.getElementById('registerForm');
  
  registerForm.classList.add('hidden');
  customerForm.classList.remove('hidden');
}

function handleCustomerLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('customerEmail').value;
  const password = document.getElementById('customerPassword').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const customer = auth.loginCustomer(email, password);
    closeLoginModal();
    
    // Show success message
    alert(`Welcome back, ${customer.firstName}!\n\nYou now have access to your customer account features including order tracking, favorites, and account management.`);
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const admin = auth.loginAdmin(username, password);
    closeLoginModal();
    
    // Show success message
    alert(`Administrator access granted!\n\nWelcome ${admin.name}. You now have access to the admin panel for product and account management.`);
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

function handleRegistration(event) {
  event.preventDefault();
  
  const formData = {
    firstName: document.getElementById('regFirstName').value,
    lastName: document.getElementById('regLastName').value,
    email: document.getElementById('regEmail').value,
    phone: document.getElementById('regPhone').value,
    company: document.getElementById('regCompany').value,
    password: document.getElementById('regPassword').value,
    confirmPassword: document.getElementById('regConfirmPassword').value
  };
  
  const errorDiv = document.getElementById('loginError');

  try {
    const customer = auth.registerCustomer(formData);
    
    // Automatically log in the new customer
    auth.loginCustomer(customer.email, customer.password);
    closeLoginModal();
    
    // Show success message
    alert(`Account created successfully!\n\nWelcome to Delta Electric Systems, ${customer.firstName}! Your account is now active and you can start browsing products, tracking orders, and managing your favorites.`);
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    const wasAdmin = auth.isAdmin();
    auth.logout();
    
    if (wasAdmin) {
      alert('Administrator logout successful.');
    } else {
      alert('Logout successful. Thank you for using Delta Electric Systems!');
    }
    
    // Redirect to home page if on admin-only pages
    if (window.location.pathname.includes('admin')) {
      window.location.href = 'index.html';
    }
  }
}

function showCustomerDashboard() {
  if (!auth.isCustomer()) {
    alert('Please login to access your customer account.');
    showLoginModal();
    return;
  }
  
  // Redirect to customer dashboard or show customer features
  alert('Customer dashboard features:\n\n• Order Tracking\n• Account Management\n• Favorites\n• Purchase History\n\nFull dashboard coming soon!');
}

function toggleAdmin() {
  if (!auth.isAdmin()) {
    alert('Access denied: Administrator privileges required.');
    return;
  }
  
  const adminControls = document.getElementById('adminControls');
  if (adminControls) {
    adminControls.classList.toggle('active');
    
    // Load accounts when admin panel is opened
    if (adminControls.classList.contains('active')) {
      loadCustomerAccounts();
    }
  }
}

function switchAdminTab(tabName) {
  // Remove active class from all tabs and content
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
  
  // Add active class to selected tab and content
  event.target.classList.add('active');
  document.getElementById(tabName + 'Tab').classList.add('active');
  
  // Load specific content for the tab
  if (tabName === 'accounts') {
    loadCustomerAccounts();
  }
}

function loadCustomerAccounts() {
  if (!auth.isAdmin()) return;
  
  const accountsList = document.getElementById('accountsList');
  const customers = auth.getAllCustomers();
  
  accountsList.innerHTML = customers.map(customer => `
    <div class="account-item">
      <div class="account-info">
        <h4>${customer.firstName} ${customer.lastName}</h4>
        <p>${customer.email} | ${customer.company || 'No company'}</p>
        <p>Joined: ${new Date(customer.createdAt).toLocaleDateString()}</p>
      </div>
      <div class="account-status ${customer.status}">
        ${customer.status}
      </div>
      <div class="account-actions">
        <button class="edit-account-btn" onclick="toggleCustomerStatus(${customer.id})">
          ${customer.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
        <button class="delete-account-btn" onclick="deleteCustomerAccount(${customer.id})">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

function toggleCustomerStatus(customerId) {
  if (!auth.isAdmin()) return;
  
  const customer = auth.customers.find(c => c.id === customerId);
  const newStatus = customer.status === 'active' ? 'inactive' : 'active';
  
  if (confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this customer account?`)) {
    try {
      auth.updateCustomerStatus(customerId, newStatus);
      loadCustomerAccounts(); // Reload the accounts list
      alert(`Customer account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      alert('Error updating customer status: ' + error.message);
    }
  }
}

function deleteCustomerAccount(customerId) {
  if (!auth.isAdmin()) return;
  
  const customer = auth.customers.find(c => c.id === customerId);
  
  if (confirm(`Are you sure you want to permanently delete the account for ${customer.firstName} ${customer.lastName}? This action cannot be undone.`)) {
    try {
      auth.deleteCustomer(customerId);
      loadCustomerAccounts(); // Reload the accounts list
      alert('Customer account deleted successfully.');
    } catch (error) {
      alert('Error deleting customer account: ' + error.message);
    }
  }
}

// Initialize auth system when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    const modal = document.getElementById('loginModal');
    if (e.target === modal) {
      closeLoginModal();
    }
  });
});.currentUser = null;
    this.userType = null; // 'customer', 'admin', or null
    this.customers = JSON.parse(localStorage.getItem('customers') || '[]');
    this.admins = [
      { username: 'admin', password: 'deltaelectric2025', name: 'System Administrator' },
      { username: 'superadmin', password: 'delta2025super', name: 'Super Administrator' }
    ];
    this.initializeAuth();
  }

  initializeAuth() {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('currentUser');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedUser && savedUserType) {
      this.currentUser = JSON.parse(savedUser);
      this.userType = savedUserType;
      this.updateUIForLoggedInUser();
    }

    // Add some demo customers if none exist
    if (this.customers.length === 0) {
      this.addDemoCustomers();
    }
  }

  addDemoCustomers() {
    const demoCustomers = [
      {
        id: 1,
        email: 'demo@company.com',
        password: 'demo123',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1-555-0123',
        company: 'ABC Manufacturing',
        status: 'active',
        createdAt: new Date().toISOString(),
        orders: [],
        favorites: []
      },
      {
        id: 2,
        email: 'engineer@industrial.com',
        password: 'eng123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1-555-0124',
        company: 'Industrial Solutions LLC',
        status: 'active',
        createdAt: new Date().toISOString(),
        orders: [],
        favorites: []
      }
    ];
    
    this