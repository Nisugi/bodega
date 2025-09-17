// Search and Filter System
class SearchEngine {
    constructor() {
        this.filteredItems = [];
        this.currentPage = 1;
        this.itemsPerPage = 100;
        this.currentSort = { field: 'name', direction: 'asc' };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', this.debounce(() => {
            this.performSearch();
        }, 300));

        // Search and clear buttons
        document.getElementById('search-btn').addEventListener('click', () => {
            this.performSearch();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearSearch();
        });

        // Filter controls
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.performSearch();
        });

        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Sort control
        document.getElementById('sort-filter').addEventListener('change', (e) => {
            this.setSortOrder(e.target.value);
            this.performSearch();
        });

        // Table header sorting
        document.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                this.toggleSort(field);
            });
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.nextPage();
        });

        // Modal
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (event) => {
            const modal = document.getElementById('item-modal');
            if (event.target === modal) {
                this.closeModal();
            }
        });

        // Enter key in search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    performSearch() {
        if (!window.dataLoader || !window.dataLoader.allItems) {
            console.log('Data not loaded yet');
            return;
        }

        const allItems = window.dataLoader.allItems;
        const filters = this.getFilters();

        console.log('Performing search with filters:', filters);

        this.filteredItems = allItems.filter(item => {
            return this.matchesAllFilters(item, filters);
        });

        this.sortItems();
        this.currentPage = 1;
        this.displayResults();
        this.updatePagination();
    }

    getFilters() {
        return {
            search: document.getElementById('search-input').value.toLowerCase().trim(),
            towns: Array.from(document.getElementById('town-filter').selectedOptions).map(opt => opt.value).filter(v => v),
            priceRange: DataLoader.getPriceRange(document.getElementById('price-filter').value),
            minEnchant: parseInt(document.getElementById('enchant-filter').value) || 0,

            // New advanced filters
            itemType: document.getElementById('item-type-filter').value,
            capacityLevel: document.getElementById('capacity-filter').value,
            armorType: document.getElementById('armor-type-filter').value,
            shieldType: document.getElementById('shield-type-filter').value,
            wearLocation: document.getElementById('wear-location-filter').value,
            skill: document.getElementById('skill-filter').value,

            // Special properties
            enhancive: document.getElementById('enhancive-filter').checked,
            maxLight: document.getElementById('max-light-filter').checked,
            maxDeep: document.getElementById('max-deep-filter').checked,
            persists: document.getElementById('persists-filter').checked,
            crumbly: document.getElementById('crumbly-filter').checked,
            hasFlares: document.getElementById('flares-filter').checked,
            hasSpell: document.getElementById('spell-filter').checked,
            blessed: document.getElementById('blessed-filter').checked
        };
    }

    matchesAllFilters(item, filters) {
        // Search text filter
        if (filters.search && !item.searchText.includes(filters.search)) {
            return false;
        }

        // Town filter
        if (filters.towns.length > 0 && !filters.towns.includes(item.town)) {
            return false;
        }

        // Price filter
        if (item.price !== null) {
            if (item.price < filters.priceRange.min || item.price > filters.priceRange.max) {
                return false;
            }
        }

        // Enchant filter
        if (filters.minEnchant > 0) {
            if (!item.enchant || item.enchant < filters.minEnchant) {
                return false;
            }
        }

        // Item type filter
        if (filters.itemType && item.itemType !== filters.itemType) {
            return false;
        }

        // Capacity filter
        if (filters.capacityLevel && item.capacityLevel !== filters.capacityLevel) {
            return false;
        }

        // Armor type filter
        if (filters.armorType && item.armorType !== filters.armorType) {
            return false;
        }

        // Shield type filter
        if (filters.shieldType && (!item.shieldType || !item.shieldType.includes(filters.shieldType))) {
            return false;
        }

        // Wear location filter
        if (filters.wearLocation && (!item.wearLocation || !item.wearLocation.toLowerCase().includes(filters.wearLocation.toLowerCase()))) {
            return false;
        }

        // Skill filter
        if (filters.skill && (!item.skill || !item.skill.toLowerCase().includes(filters.skill.toLowerCase()))) {
            return false;
        }

        // Special properties filters
        if (filters.enhancive && (!item.enhancives || item.enhancives.length === 0)) {
            return false;
        }

        if (filters.maxLight && (!item.tags || !item.tags.includes('max_light'))) {
            return false;
        }

        if (filters.maxDeep && (!item.tags || !item.tags.includes('max_deep'))) {
            return false;
        }

        if (filters.persists && (!item.tags || !item.tags.includes('persists'))) {
            return false;
        }

        if (filters.crumbly && (!item.tags || !item.tags.includes('crumbly'))) {
            return false;
        }

        if (filters.hasFlares && (!item.flares || item.flares.length === 0)) {
            return false;
        }

        if (filters.hasSpell && !item.spell) {
            return false;
        }

        if (filters.blessed && !item.blessing) {
            return false;
        }

        return true;
    }

    setSortOrder(sortValue) {
        const sortMap = {
            'name': { field: 'name', direction: 'asc' },
            'price-asc': { field: 'price', direction: 'asc' },
            'price-desc': { field: 'price', direction: 'desc' },
            'enchant-desc': { field: 'enchant', direction: 'desc' },
            'town': { field: 'town', direction: 'asc' },
            'type': { field: 'itemType', direction: 'asc' },
            'capacity': { field: 'capacityLevel', direction: 'asc' }
        };

        this.currentSort = sortMap[sortValue] || { field: 'name', direction: 'asc' };
        this.updateSortHeaders();
    }

    toggleSort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }

        this.updateSortHeaders();
        this.performSearch();
    }

    updateSortHeaders() {
        document.querySelectorAll('th.sortable').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.sort === this.currentSort.field) {
                th.classList.add(`sorted-${this.currentSort.direction}`);
            }
        });
    }

    sortItems() {
        this.filteredItems.sort((a, b) => {
            let aVal = a[this.currentSort.field];
            let bVal = b[this.currentSort.field];

            // Handle null/undefined values
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            // Convert to comparable types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            let result = 0;
            if (aVal < bVal) result = -1;
            else if (aVal > bVal) result = 1;

            return this.currentSort.direction === 'desc' ? -result : result;
        });
    }

    displayResults() {
        const tbody = document.getElementById('results-body');
        tbody.innerHTML = '';

        if (this.filteredItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-results">No items found matching your criteria.</td></tr>';
            this.updateResultsCount();
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredItems.length);
        const pageItems = this.filteredItems.slice(startIndex, endIndex);

        pageItems.forEach(item => {
            const row = this.createItemRow(item);
            tbody.appendChild(row);
        });

        this.updateResultsCount();
    }

    createItemRow(item) {
        const row = document.createElement('tr');

        // Item name (clickable)
        const nameCell = document.createElement('td');
        const nameLink = document.createElement('span');
        nameLink.className = 'item-name';
        nameLink.textContent = item.name;
        nameLink.addEventListener('click', () => this.showItemDetails(item));
        nameCell.appendChild(nameLink);

        // Price
        const priceCell = document.createElement('td');
        priceCell.className = 'price';
        priceCell.textContent = DataLoader.formatPrice(item.price);

        // Properties
        const propsCell = document.createElement('td');
        propsCell.className = 'properties';
        propsCell.appendChild(this.createPropertiesElement(item));

        // Town
        const townCell = document.createElement('td');
        townCell.textContent = item.town;

        // Shop
        const shopCell = document.createElement('td');
        const shopDiv = document.createElement('div');
        shopDiv.innerHTML = `
            <strong>${item.shopName}</strong><br>
            <span class="shop-location">${item.room}</span>
        `;
        shopCell.appendChild(shopDiv);

        row.appendChild(nameCell);
        row.appendChild(priceCell);
        row.appendChild(propsCell);
        row.appendChild(townCell);
        row.appendChild(shopCell);

        return row;
    }

    createPropertiesElement(item) {
        const container = document.createElement('div');

        // Item type
        if (item.itemType && item.itemType !== 'miscellaneous') {
            const tag = document.createElement('span');
            tag.className = 'property-tag';
            tag.textContent = item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1);
            container.appendChild(tag);
        }

        // Enchant
        if (item.enchant) {
            const tag = document.createElement('span');
            tag.className = 'property-tag';
            tag.textContent = `+${item.enchant}`;
            container.appendChild(tag);
        }

        // Capacity
        if (item.capacityLevel) {
            const tag = document.createElement('span');
            tag.className = 'property-tag special';
            tag.textContent = item.capacityLevel.charAt(0).toUpperCase() + item.capacityLevel.slice(1);
            container.appendChild(tag);
        }

        // Armor/Weapon type
        if (item.armorType) {
            const tag = document.createElement('span');
            tag.className = 'property-tag';
            tag.textContent = item.armorType.charAt(0).toUpperCase() + item.armorType.slice(1);
            container.appendChild(tag);
        }

        if (item.weaponType) {
            const tag = document.createElement('span');
            tag.className = 'property-tag';
            tag.textContent = item.weaponType.charAt(0).toUpperCase() + item.weaponType.slice(1);
            container.appendChild(tag);
        }

        if (item.shieldType) {
            const tag = document.createElement('span');
            tag.className = 'property-tag';
            tag.textContent = item.shieldType.charAt(0).toUpperCase() + item.shieldType.slice(1);
            container.appendChild(tag);
        }

        // Skill required
        if (item.skill) {
            const tag = document.createElement('span');
            tag.className = 'property-tag';
            tag.textContent = item.skill.charAt(0).toUpperCase() + item.skill.slice(1);
            container.appendChild(tag);
        }

        // Enhancives
        if (item.enhancives && item.enhancives.length > 0) {
            item.enhancives.forEach(enh => {
                const tag = document.createElement('span');
                tag.className = 'property-tag enhancive';
                tag.textContent = `+${enh.boost} ${enh.ability}`;
                container.appendChild(tag);
            });
        }

        // Flares
        if (item.flares && item.flares.length > 0) {
            const tag = document.createElement('span');
            tag.className = 'property-tag special';
            tag.textContent = 'Flares';
            container.appendChild(tag);
        }

        // Spell
        if (item.spell) {
            const tag = document.createElement('span');
            tag.className = 'property-tag special';
            tag.textContent = 'Spell';
            container.appendChild(tag);
        }

        // Blessing
        if (item.blessing) {
            const tag = document.createElement('span');
            tag.className = 'property-tag special';
            tag.textContent = 'Holy';
            container.appendChild(tag);
        }

        // Special tags
        if (item.tags && item.tags.length > 0) {
            const specialTags = ['max_light', 'max_deep', 'persists', 'crumbly', 'holy'];
            item.tags.forEach(tag => {
                if (specialTags.includes(tag)) {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'property-tag special';
                    tagEl.textContent = tag.replace('_', ' ');
                    container.appendChild(tagEl);
                }
            });
        }

        return container;
    }

    showItemDetails(item) {
        const modal = document.getElementById('item-modal');
        const nameEl = document.getElementById('modal-item-name');
        const bodyEl = document.getElementById('modal-content-body');

        nameEl.textContent = item.name;

        bodyEl.innerHTML = `
            <div class="modal-section">
                <h4>Basic Information</h4>
                <p><strong>Price:</strong> ${DataLoader.formatPrice(item.price)}</p>
                <p><strong>Town:</strong> ${item.town}</p>
                <p><strong>Shop:</strong> ${item.shopName}</p>
                <p><strong>Room:</strong> ${item.room}</p>
                <p><strong>Item ID:</strong> ${item.id}</p>
                ${item.weight ? `<p><strong>Weight:</strong> ${item.weight} pounds</p>` : ''}
                ${item.material ? `<p><strong>Material:</strong> ${item.material}</p>` : ''}
            </div>

            ${item.enchant ? `
            <div class="modal-section">
                <h4>Enchantment</h4>
                <p>+${item.enchant} enchant bonus</p>
            </div>
            ` : ''}

            ${item.enhancives && item.enhancives.length > 0 ? `
            <div class="modal-section">
                <h4>Enhancive Properties</h4>
                <div class="enhancive-list">
                    ${item.enhancives.map(enh => `
                        <p>+${enh.boost} to ${enh.ability}${enh.level ? ` (requires ${enh.level} training)` : ''}</p>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${item.tags && item.tags.length > 0 ? `
            <div class="modal-section">
                <h4>Special Properties</h4>
                <p>${item.tags.map(tag => tag.replace('_', ' ')).join(', ')}</p>
            </div>
            ` : ''}

            <div class="modal-section">
                <h4>Shop Location</h4>
                <p>${item.shopLocation}</p>
            </div>

            ${item.raw && item.raw.length > 0 ? `
            <div class="modal-section">
                <h4>Raw Item Data</h4>
                <div class="raw-data">${item.raw.join('\n')}</div>
            </div>
            ` : ''}
        `;

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('item-modal').style.display = 'none';
    }

    updateResultsCount() {
        const count = this.filteredItems.length;
        const countEl = document.getElementById('results-count');
        countEl.textContent = `${count.toLocaleString()} items found`;

        const pageInfo = document.getElementById('page-info');
        if (count > 0) {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.itemsPerPage, count);
            pageInfo.textContent = `Showing ${startIndex}-${endIndex} of ${count.toLocaleString()}`;
        } else {
            pageInfo.textContent = '';
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);

        document.getElementById('prev-page').disabled = this.currentPage <= 1;
        document.getElementById('next-page').disabled = this.currentPage >= totalPages;

        const pageNumbers = document.getElementById('page-numbers');
        pageNumbers.innerHTML = '';

        if (totalPages <= 1) return;

        // Generate page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('span');
            pageBtn.className = 'page-number';
            pageBtn.textContent = i;

            if (i === this.currentPage) {
                pageBtn.classList.add('current');
            } else {
                pageBtn.addEventListener('click', () => {
                    this.currentPage = i;
                    this.displayResults();
                    this.updatePagination();
                });
            }

            pageNumbers.appendChild(pageBtn);
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayResults();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayResults();
            this.updatePagination();
        }
    }

    clearSearch() {
        document.getElementById('search-input').value = '';
        this.performSearch();
    }

    resetFilters() {
        document.getElementById('search-input').value = '';
        document.getElementById('town-filter').selectedIndex = 0;
        document.getElementById('price-filter').selectedIndex = 0;
        document.getElementById('enchant-filter').selectedIndex = 0;

        // New filters
        document.getElementById('item-type-filter').selectedIndex = 0;
        document.getElementById('capacity-filter').selectedIndex = 0;
        document.getElementById('armor-type-filter').selectedIndex = 0;
        document.getElementById('shield-type-filter').selectedIndex = 0;
        document.getElementById('wear-location-filter').selectedIndex = 0;
        document.getElementById('skill-filter').selectedIndex = 0;

        // Checkboxes
        document.getElementById('enhancive-filter').checked = false;
        document.getElementById('max-light-filter').checked = false;
        document.getElementById('max-deep-filter').checked = false;
        document.getElementById('persists-filter').checked = false;
        document.getElementById('crumbly-filter').checked = false;
        document.getElementById('flares-filter').checked = false;
        document.getElementById('spell-filter').checked = false;
        document.getElementById('blessed-filter').checked = false;

        document.getElementById('sort-filter').selectedIndex = 0;

        this.currentSort = { field: 'name', direction: 'asc' };
        this.updateSortHeaders();
        this.performSearch();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize search engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.searchEngine = new SearchEngine();

    // Wait for data to load, then perform initial search
    const checkDataLoaded = () => {
        if (window.dataLoader && window.dataLoader.allItems && window.dataLoader.allItems.length > 0) {
            window.searchEngine.performSearch();
        } else {
            setTimeout(checkDataLoaded, 100);
        }
    };

    // Also listen for the custom dataLoaded event
    window.addEventListener('dataLoaded', () => {
        console.log('Received dataLoaded event, starting search...');
        window.searchEngine.performSearch();
    });

    setTimeout(checkDataLoaded, 100);
});