// Products Page Specific JavaScript
// Handles advanced filtering, sorting, and product management

class ProductsPageManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.totalItems = 0;
    this.currentFilters = {
      category: 'all',
      brand: 'all',
      price: 'all',
      stock: 'all'
    };
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.searchQuery = '';
    
    this.initializeProductsPage();
  }

  initializeProductsPage() {
    // Set up advanced filtering
    this.setupAdvancedFilters();
    
    // Check for URL parameters
    this.handleURLParameters();
    
    // Initialize sorting
    this.initializeSorting();
    
    // Set up category filter functions
    this.setupCategoryFilters();
    
    // Update results display
    this.updateResultsDisplay();
  }

  setupAdvancedFilters() {
    const filterSelects = ['categoryFilter', 'brandFilter', 'priceFilter', 'stockFilter'];
    
    filterSelects.forEach(filterId => {
      const filterElement = document.getElementById(filterId);
      if (filterElement) {
        filterElement.addEventListener('change', (e) => {
          this.currentFilters[filterId.replace('Filter', '')] = e.target.value;
          this.currentPage = 1; // Reset to first page
          this.filterAndDisplayProducts();
        });
      }
    });
  }

  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle category filter from URL
    const category = urlParams.get('category');
    if (category) {
      this.currentFilters.category = category;
      const categoryFilter = document.getElementById('categoryFilter');
      if (categoryFilter) {
        categoryFilter.value = category;
      }
    }
    
    // Handle search query from URL
    const search = urlParams.get('search');
    if (search) {
      this.searchQuery = search;
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = search;
      }
    }
    
    // Apply filters and display products
    this.filterAndDisplayProducts();
  }

  initializeSorting() {
    // Create sorting dropdown if it doesn't exist
    const resultsInfo = document.getElementById('resultsInfo') || this.createResultsInfo();
    
    if (!document.getElementById('sortSelect')) {
      const sortContainer = document.createElement('div');
      sortContainer.className = 'results-sort';
      sortContainer.innerHTML = `
        <label for="sortSelect">Sort by:</label>
        <select id="sortSelect">
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
          <option value="brand-asc">Brand (A-Z)</option>
          <option value="category-asc">Category</option>
        </select>
      `;
      
      resultsInfo.appendChild(sortContainer);
      
      document.getElementById('sortSelect').addEventListener('change', (e) => {
        const [sortBy, sortOrder] = e.target.value.split('-');
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.filterAndDisplayProducts();
      });
    }
  }

  createResultsInfo() {
    const resultsInfo = document.createElement('div');
    resultsInfo.id = 'resultsInfo';
    resultsInfo.className = 'results-info';
    
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.parentNode.insertBefore(resultsInfo, productsGrid);
    
    return resultsInfo;
  }

  setupCategoryFilters() {
    // Add click handlers for category cards
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const categoryName = e.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
        this.filterByCategory(categoryName);
      });
    });
  }

  filterByCategory(category) {
    this.currentFilters.category = category;
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.value = category;
    }
    this.currentPage = 1;
    this.filterAndDisplayProducts();
    
    // Scroll to products grid
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
      productsGrid.scrollIntoView({ behavior: 'smooth' });
    }
  }

  filterAndDisplayProducts() {
    if (!window.app || !window.app.products) {
      console.error('Products data not available');
      return;
    }

    let filteredProducts = [...window.app.products];

    // Apply search filter
    if (this.searchQuery) {
      const searchTerm = this.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (this.currentFilters.category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === this.currentFilters.category);
    }

    // Apply brand filter
    if (this.currentFilters.brand !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.brand === this.currentFilters.brand);
    }

    // Apply price filter
    if (this.currentFilters.price !== 'all') {
      const [min, max] = this.currentFilters.price.split('-').map(Number);
      filteredProducts = filteredProducts.filter(p => 
        p.price >= min && p.price <= (max || 999999)
      );
    }

    // Apply stock filter
    if (this.currentFilters.stock !== 'all') {
      if (this.currentFilters.stock === 'instock') {
        filteredProducts = filteredProducts.filter(p => p.inStock);
      } else if (this.currentFilters.stock === 'featured') {
        filteredProducts = filteredProducts.filter(p => p.featured);
      }
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue, bValue;
      
      switch (this.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'brand':
          aValue = a.brand.toLowerCase();
          bValue = b.brand.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (this.sortOrder === 'desc') {
        return aValue > bValue ? -1 : (aValue < bValue ? 1 : 0);
      } else {
        return aValue < bValue ? -1 : (aValue > bValue ? 1 : 0);
      }
    });

    this.totalItems = filteredProducts.length;

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Display products
    if (window.app && window.app.renderProductsGrid) {
      window.app.renderProductsGrid(paginatedProducts);
    }

    // Update results display
    this.updateResultsDisplay();

    // Show search results message if searching
    if (this.searchQuery) {
      this.showSearchResults(`Found ${this.totalItems} products matching "${this.searchQuery}"`);
    } else {
      this.hideSearchResults();
    }

    // Update load more button
    this.updateLoadMoreButton();
  }

  updateResultsDisplay() {
    const resultsInfo = document.getElementById('resultsInfo') || this.createResultsInfo();
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    
    let resultsCount = resultsInfo.querySelector('.results-count');
    if (!resultsCount) {
      resultsCount = document.createElement('div');
      resultsCount.className = 'results-count';
      resultsInfo.insertBefore(resultsCount, resultsInfo.firstChild);
    }
    
    if (this.totalItems === 0) {
      resultsCount.textContent = 'No products found matching your criteria';
    } else {
      resultsCount.textContent = `Showing ${startItem}-${endItem} of ${this.totalItems} products`;
    }
  }

  updateLoadMoreButton() {
    const loadMoreContainer = document.querySelector('.load-more-container');
    if (!loadMoreContainer) return;

    const loadMoreBtn = loadMoreContainer.querySelector('button');
    const loadMoreText = loadMoreContainer.querySelector('p');

    const hasMoreItems = this.currentPage * this.itemsPerPage < this.totalItems;

    if (hasMoreItems) {
      loadMoreBtn.style.display = 'inline-block';
      loadMoreBtn.textContent = 'Load More Products';
    } else {
      loadMoreBtn.style.display = 'none';
    }

    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    loadMoreText.textContent = `Showing ${startItem}-${endItem} of ${this.totalItems} products`;
  }

  showSearchResults(message) {
    let searchMessage = document.querySelector('.search-results-message');
    if (!searchMessage) {
      searchMessage = document.createElement('div');
      searchMessage.className = 'search-results-message';
      const productsGrid = document.getElementById('productsGrid');
      productsGrid.parentNode.insertBefore(searchMessage, productsGrid);
    }
    searchMessage.textContent = message;
    searchMessage.style.display = 'block';
  }

  hideSearchResults() {
    const searchMessage = document.querySelector('.search-results-message');
    if (searchMessage) {
      searchMessage.style.display = 'none';
    }
  }

  loadNextPage() {
    this.currentPage++;
    this.filterAndDisplayProducts();
  }

  clearAllFilters() {
    this.currentFilters = {
      category: 'all',
      brand: 'all',
      price: 'all',
      stock: 'all'
    };
    this.searchQuery = '';
    this.currentPage = 1;

    // Reset filter controls
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('brandFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('stockFilter').value = 'all';
    document.getElementById('searchInput').value = '';

    this.filterAndDisplayProducts();
  }

  exportResults() {
    if (!window.app || !window.app.products) {
      alert('No products data available to export');
      return;
    }

    // Apply current filters to get filtered products
    let filteredProducts = [...window.app.products];

    // Apply all current filters (same logic as filterAndDisplayProducts)
    if (this.searchQuery) {
      const searchTerm = this.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    if (this.currentFilters.category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === this.currentFilters.category);
    }

    if (this.currentFilters.brand !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.brand === this.currentFilters.brand);
    }

    if (this.currentFilters.price !== 'all') {
      const [min, max] = this.currentFilters.price.split('-').map(Number);
      filteredProducts = filteredProducts.filter(p => 
        p.price >= min && p.price <= (max || 999999)
      );
    }

    if (this.currentFilters.stock !== 'all') {
      if (this.currentFilters.stock === 'instock') {
        filteredProducts = filteredProducts.filter(p => p.inStock);
      } else if (this.currentFilters.stock === 'featured') {
        filteredProducts = filteredProducts.filter(p => p.featured);
      }
    }

    // Create CSV content
    const csvHeader = 'Name,Brand,Category,Price,Description,In Stock\n';
    const csvContent = filteredProducts.map(product => {
      const brand = window.app.formatBrand ? window.app.formatBrand(product.brand) : product.brand;
      const category = product.category.charAt(0).toUpperCase() + product.category.slice(1);
      const description = product.description.replace(/,/g, ';').replace(/\n/g, ' ');
      return `"${product.name}","${brand}","${category}","$${product.price}","${description}","${product.inStock ? 'Yes' : 'No'}"`;
    }).join('\n');

    // Download CSV file
    const csv = csvHeader + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `delta-electric-products-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Exported ${filteredProducts.length} products to CSV file`);
  }
}

// Global functions for the products page
function clearFilters() {
  if (window.productsManager) {
    window.productsManager.clearAllFilters();
  }
}

function exportResults() {
  if (window.productsManager) {
    window.productsManager.exportResults();
  }
}

function loadMoreProducts() {
  if (window.productsManager) {
    window.productsManager.loadNextPage();
  }
}

function filterByCategory(category) {
  if (window.productsManager) {
    window.productsManager.filterByCategory(category);
  }
}

// Initialize products page manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if we're on the products page
  if (document.getElementById('productsGrid')) {
    window.productsManager = new ProductsPageManager();
  }
});