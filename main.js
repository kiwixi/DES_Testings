// Main JavaScript for Delta Electric Systems
// Handles general site functionality, product management, and UI interactions

class DeltaElectricApp {
  constructor() {
    this.products = JSON.parse(localStorage.getItem('products') || '[]');
    this.initializeProducts();
    this.initializeApp();
  }

  initializeProducts() {
    // Add default products if none exist
    if (this.products.length === 0) {
      this.products = [
        {
          id: 1,
          name: "Industrial Circuit Breaker Series",
          brand: "siemens",
          category: "electrical",
          price: 459,
          description: "High-performance molded case circuit breakers designed for industrial applications with advanced protection features and remote monitoring capabilities.",
          inStock: true,
          featured: true,
          specifications: {
            voltage: "600V",
            current: "100A",
            poles: "3",
            interrupting: "65kA"
          }
  }

  toggleFavorite(productId) {
    if (!auth.isCustomer()) {
      alert('Please login to your customer account to save favorites.');
      showLoginModal();
      return;
    }

    const customer = auth.getCurrentUser();
    try {
      if (customer.favorites && customer.favorites.includes(productId)) {
        auth.removeFromFavorites(customer.id, productId);
        alert('Product removed from favorites.');
      } else {
        auth.addToFavorites(customer.id, productId);
        alert('Product added to favorites!');
      }
      
      // Update UI to reflect favorite status
      this.updateFavoriteButtons();
    } catch (error) {
      alert('Error updating favorites: ' + error.message);
    }
  }

  updateFavoriteButtons() {
    if (!auth.isCustomer()) return;
    
    const customer = auth.getCurrentUser();
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(btn => {
      const productCard = btn.closest('.product-card');
      const productId = parseInt(productCard.dataset.id);
      
      if (customer.favorites && customer.favorites.includes(productId)) {
        btn.classList.add('favorited');
        btn.innerHTML = '<i class="fas fa-heart"></i> Favorited';
        btn.style.background = '#e53e3e';
        btn.style.color = 'white';
        btn.style.borderColor = '#e53e3e';
      } else {
        btn.classList.remove('favorited');
        btn.innerHTML = '<i class="far fa-heart"></i> Favorite';
        btn.style.background = 'transparent';
        btn.style.color = '#0496C7';
        btn.style.borderColor = '#0496C7';
      }
    });
  }

  deleteProductConfirm(productId) {
    if (!auth.isAdmin()) {
      alert('Access denied: Administrator privileges required');
      return;
    }

    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`Are you sure you want to remove "${product.name}" from the product catalog?\n\nThis action cannot be undone.`)) {
      try {
        this.deleteProduct(productId);
        this.renderProducts();
        alert('Product successfully removed from catalog.');
      } catch (error) {
        alert('Error removing product: ' + error.message);
      }
    }
  }

  saveProducts() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  // Contact form handler
  handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      inquiryType: formData.get('inquiryType'),
      message: formData.get('message')
    };

    // Simulate form submission
    alert(`Thank you for contacting Delta Electric Systems!\n\nWe have received your ${contactData.inquiryType} inquiry and will respond within 24 hours.\n\nFor urgent technical support, please call our 24/7 hotline at +1 (555) 123-4567.`);
    
    event.target.reset();
  }
}

// Global functions for admin product management
function addProduct() {
  if (!auth.isAdmin()) {
    alert('Access denied: Administrator privileges required');
    return;
  }

  const productData = {
    name: document.getElementById('productName').value,
    brand: document.getElementById('productBrand').value,
    price: document.getElementById('productPrice').value,
    category: document.getElementById('productCategory').value,
    description: document.getElementById('productDescription').value
  };

  try {
    const newProduct = app.addProduct(productData);
    
    // Clear form
    document.getElementById('productName').value = '';
    document.getElementById('productBrand').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productDescription').value = '';
    
    // Re-render products if on products page
    if (document.getElementById('productsGrid')) {
      app.renderProducts();
    }
    
    alert(`Product "${newProduct.name}" successfully added to the catalog!`);
  } catch (error) {
    alert('Error adding product: ' + error.message);
  }
}

function performSearch() {
  app.performSearch();
}

function toggleMobileMenu() {
  app.toggleMobileMenu();
}

// Utility functions for navigation
function setActiveNavItem() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-menu a');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the main app
  window.app = new DeltaElectricApp();
  
  // Set active navigation item
  setActiveNavItem();
  
  // Handle contact form if present
  const contactForm = document.querySelector('#contactPage form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => app.handleContactForm(e));
  }
  
  // Handle URL parameters for search
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  if (searchQuery && document.getElementById('productsGrid')) {
    document.getElementById('searchInput').value = searchQuery;
    app.searchProducts(searchQuery);
  }

  // Update favorite buttons if customer is logged in
  if (auth.isCustomer()) {
    setTimeout(() => app.updateFavoriteButtons(), 500);
  }
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Add loading states to buttons
  document.querySelectorAll('button, .btn-outline, .cta-btn-primary, .cta-btn-secondary').forEach(btn => {
    btn.addEventListener('click', function() {
      // Add click animation
      this.style.transform = 'scale(0.98)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });

  // Handle placeholder links
  document.querySelectorAll('a[href="#placeholder"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      alert('This feature is coming soon! Please check back later for updates.');
    });
  });
});
        },
        {
          id: 2,
          name: "CompactLogix PLC System",
          brand: "rockwell",
          category: "automation",
          price: 3299,
          description: "Scalable programmable logic controller with integrated motion, safety, and information solutions for complex industrial automation applications.",
          inStock: true,
          featured: true,
          specifications: {
            io: "32 Digital I/O",
            memory: "2MB",
            ethernet: "Yes",
            safety: "Integrated"
          }
        },
        {
          id: 3,
          name: "MasterPact Power Distribution Panel",
          brand: "schneider",
          category: "power",
          price: 8750,
          description: "Advanced power distribution solution with digital monitoring, predictive maintenance, and comprehensive protection for critical infrastructure.",
          inStock: true,
          featured: false,
          specifications: {
            voltage: "480V",
            current: "4000A",
            protection: "Digital",
            monitoring: "IoT Ready"
          }
        },
        {
          id: 4,
          name: "ACS880 Industrial Drive",
          brand: "abb",
          category: "industrial",
          price: 2150,
          description: "Ultra-low harmonic drives designed for demanding industrial processes with built-in safety functions and energy optimization features.",
          inStock: true,
          featured: true,
          specifications: {
            power: "75kW",
            voltage: "480V",
            harmonic: "< 3%",
            efficiency: "> 97%"
          }
        },
        {
          id: 5,
          name: "Emergency Safety System",
          brand: "eaton",
          category: "safety",
          price: 875,
          description: "Comprehensive emergency stop and safety monitoring system with redundant circuits and diagnostic capabilities for industrial machinery.",
          inStock: true,
          featured: false,
          specifications: {
            category: "Category 4",
            response: "< 500ms",
            outputs: "8 Safety",
            communication: "EtherNet/IP"
          }
        },
        {
          id: 6,
          name: "Industrial LED Lighting System",
          brand: "ge",
          category: "electrical",
          price: 320,
          description: "Energy-efficient LED lighting solution designed for harsh industrial environments with intelligent controls and maintenance alerts.",
          inStock: true,
          featured: false,
          specifications: {
            lumens: "15000lm",
            efficiency: "150lm/W",
            lifespan: "100,000hr",
            protection: "IP66"
          }
        }
      ];
      this.saveProducts();
    }
  }

  initializeApp() {
    // Initialize UI components
    this.initializeSearch();
    this.initializeMobileMenu();
    this.setupEventListeners();

    // Check URL parameters for category filtering
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category && document.getElementById('categoryFilter')) {
      document.getElementById('categoryFilter').value = category;
      this.filterProducts();
    }
  }

  initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
    }
  }

  initializeMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
      toggle.addEventListener('click', this.toggleMobileMenu);
    }
  }

  setupEventListeners() {
    // Set up product filtering if on products page
    const categoryFilter = document.getElementById('categoryFilter');
    const brandFilter = document.getElementById('brandFilter');
    const priceFilter = document.getElementById('priceFilter');

    if (categoryFilter) categoryFilter.addEventListener('change', () => this.filterProducts());
    if (brandFilter) brandFilter.addEventListener('change', () => this.filterProducts());
    if (priceFilter) priceFilter.addEventListener('change', () => this.filterProducts());

    // Render products if on products page
    if (document.getElementById('productsGrid')) {
      this.renderProducts();
    }
  }

  performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
      // Redirect to products page with search query
      if (window.location.pathname.includes('products.html')) {
        // Already on products page, just filter
        this.searchProducts(query);
      } else {
        // Redirect to products page with search parameter
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    }
  }

  searchProducts(query) {
    const searchTerm = query.toLowerCase();
    const grid = document.getElementById('productsGrid');
    const filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );

    this.renderProductsGrid(filteredProducts);
    
    // Show search results message
    const resultsCount = filteredProducts.length;
    this.showSearchResults(`Found ${resultsCount} products matching "${query}"`);
  }

  showSearchResults(message) {
    // Create or update search results message
    let resultsMessage = document.getElementById('searchResults');
    if (!resultsMessage) {
      resultsMessage = document.createElement('div');
      resultsMessage.id = 'searchResults';
      resultsMessage.className = 'search-results-message';
      resultsMessage.style.cssText = `
        background: #0496C7;
        color: white;
        padding: 1rem 2rem;
        text-align: center;
        font-weight: 600;
        margin-bottom: 2rem;
        border-radius: 8px;
      `;
      
      const productsGrid = document.getElementById('productsGrid');
      productsGrid.parentNode.insertBefore(resultsMessage, productsGrid);
    }
    
    resultsMessage.textContent = message;
  }

  toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (navMenu && toggle) {
      navMenu.classList.toggle('active');
      toggle.classList.toggle('active');
    }
  }

  // Product Management Functions
  addProduct(productData) {
    if (!auth.isAdmin()) {
      throw new Error('Access denied: Administrator privileges required');
    }

    // Validate required fields
    if (!productData.name || !productData.brand || !productData.price || !productData.category || !productData.description) {
      throw new Error('All product fields are required');
    }

    const newProduct = {
      id: Date.now(),
      name: productData.name,
      brand: productData.brand.toLowerCase(),
      category: productData.category,
      price: parseInt(productData.price),
      description: productData.description,
      inStock: true,
      featured: false,
      specifications: {},
      createdAt: new Date().toISOString()
    };

    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  deleteProduct(productId) {
    if (!auth.isAdmin()) {
      throw new Error('Access denied: Administrator privileges required');
    }

    const index = this.products.findIndex(p => p.id === productId);
    if (index === -1) {
      throw new Error('Product not found');
    }

    this.products.splice(index, 1);
    this.saveProducts();
    return true;
  }

  filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const brandFilter = document.getElementById('brandFilter')?.value || 'all';
    const priceFilter = document.getElementById('priceFilter')?.value || 'all';

    let filteredProducts = this.products;

    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
    }

    // Apply brand filter
    if (brandFilter !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.brand === brandFilter);
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number);
      filteredProducts = filteredProducts.filter(p => 
        p.price >= min && p.price <= (max || 999999)
      );
    }

    this.renderProductsGrid(filteredProducts);
    
    // Update results count
    this.updateResultsCount(filteredProducts.length, this.products.length);
  }

  updateResultsCount(filtered, total) {
    let countDiv = document.getElementById('resultsCount');
    if (!countDiv) {
      countDiv = document.createElement('div');
      countDiv.id = 'resultsCount';
      countDiv.style.cssText = `
        text-align: center;
        margin-bottom: 2rem;
        font-size: 1.1rem;
        color: #666;
        font-weight: 500;
      `;
      
      const productsGrid = document.getElementById('productsGrid');
      productsGrid.parentNode.insertBefore(countDiv, productsGrid);
    }
    
    countDiv.textContent = `Showing ${filtered} of ${total} products`;
  }

  renderProducts() {
    this.renderProductsGrid(this.products);
  }

  renderProductsGrid(productsToRender) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = productsToRender.map(product => `
      <div class="product-card" data-id="${product.id}">
        <div class="product-card-header">
          <div class="product-card-icon">
            <i class="${this.getCategoryIcon(product.category)}"></i>
          </div>
          <h3>${product.name}</h3>
        </div>
        <div class="product-card-body">
          <div class="product-meta">
            <div class="product-brand">${this.formatBrand(product.brand)}</div>
            <div class="product-price">$${product.price.toLocaleString()}</div>
          </div>
          <p>${product.description}</p>
          
          ${product.specifications ? this.renderSpecifications(product.specifications) : ''}
          
          <div class="product-actions">
            <button class="btn-outline" onclick="app.viewProductDetails(${product.id})">View Details</button>
            <button class="btn-outline" onclick="app.requestQuote(${product.id})">Request Quote</button>
            ${auth.isCustomer() ? `<button class="btn-outline favorite-btn" onclick="app.toggleFavorite(${product.id})">
              <i class="fas fa-heart"></i> Favorite
            </button>` : ''}
            ${auth.isAdmin() ? `<button class="btn-outline delete-btn" onclick="app.deleteProductConfirm(${product.id})">Remove Product</button>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  renderSpecifications(specs) {
    const specItems = Object.entries(specs).map(([key, value]) => 
      `<span class="spec-item"><strong>${this.formatSpecKey(key)}:</strong> ${value}</span>`
    ).join('');
    
    return `
      <div class="product-specifications">
        <h4>Specifications</h4>
        <div class="spec-grid">
          ${specItems}
        </div>
      </div>
    `;
  }

  formatSpecKey(key) {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  }

  getCategoryIcon(category) {
    const icons = {
      electrical: 'fas fa-bolt',
      automation: 'fas fa-cogs',
      power: 'fas fa-plug',
      industrial: 'fas fa-industry',
      safety: 'fas fa-shield-alt'
    };
    return icons[category] || 'fas fa-box';
  }

  formatBrand(brand) {
    const brandMap = {
      siemens: 'Siemens',
      rockwell: 'Rockwell Automation',
      schneider: 'Schneider Electric',
      abb: 'ABB',
      ge: 'General Electric',
      eaton: 'Eaton'
    };
    return brandMap[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
  }

  viewProductDetails(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Create detailed product modal or redirect to product detail page
    alert(`Product Details: ${product.name}\n\nBrand: ${this.formatBrand(product.brand)}\nPrice: $${product.price.toLocaleString()}\nCategory: ${product.category}\n\nDescription:\n${product.description}\n\nFull product details page coming soon!`);
  }

  requestQuote(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (auth.isCustomer()) {
      alert(`Quote Request Submitted!\n\nProduct: ${product.name}\nPrice: $${product.price.toLocaleString()}\n\nOur sales team will contact you within 24 hours with a detailed quote including volume pricing and delivery options.`);
    } else {
      alert('Please login to your customer account to request quotes.');
      showLoginModal();
    