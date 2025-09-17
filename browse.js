class BrowseEngine {
    constructor() {
        this.currentTown = null;
        this.currentShop = null;
        this.townData = {};
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Tab switching
        document.getElementById('search-tab').addEventListener('click', () => this.switchToSearch());
        document.getElementById('browse-tab').addEventListener('click', () => this.switchToBrowse());

        // Browse navigation
        document.getElementById('browse-town-select').addEventListener('change', (e) => this.selectTown(e.target.value));
        document.getElementById('back-to-shops').addEventListener('click', () => this.backToShops());
    }

    switchToSearch() {
        document.getElementById('search-tab').classList.add('active');
        document.getElementById('browse-tab').classList.remove('active');
        document.getElementById('search-mode').style.display = 'block';
        document.getElementById('browse-mode').style.display = 'none';

        // Trigger search refresh
        if (window.searchEngine) {
            window.searchEngine.performSearch();
        }
    }

    switchToBrowse() {
        document.getElementById('search-tab').classList.remove('active');
        document.getElementById('browse-tab').classList.add('active');
        document.getElementById('search-mode').style.display = 'none';
        document.getElementById('browse-mode').style.display = 'block';

        // Initialize browse data if not done yet
        if (Object.keys(this.townData).length === 0) {
            this.initializeBrowseData();
        }
    }

    initializeBrowseData() {
        if (!window.dataLoader || !window.dataLoader.allItems) {
            console.log('Data not loaded yet for browse mode');
            return;
        }

        console.log('Initializing browse data...');
        this.organizeTownData();
        this.populateTownList();
    }

    organizeTownData() {
        const items = window.dataLoader.allItems;
        this.townData = {};

        items.forEach(item => {
            const town = item.town || 'Unknown Town';
            const shop = item.shopName || 'Unknown Shop';
            const room = item.room || 'Main Room';

            // Initialize town
            if (!this.townData[town]) {
                this.townData[town] = {};
            }

            // Initialize shop
            if (!this.townData[town][shop]) {
                this.townData[town][shop] = {};
            }

            // Initialize room
            if (!this.townData[town][shop][room]) {
                this.townData[town][shop][room] = [];
            }

            // Add item to room
            this.townData[town][shop][room].push(item);
        });

        console.log('Organized data for', Object.keys(this.townData).length, 'towns');
    }

    populateTownList() {
        const townSelect = document.getElementById('browse-town-select');
        townSelect.innerHTML = '';

        const towns = Object.keys(this.townData).sort();
        towns.forEach(town => {
            const option = document.createElement('option');
            option.value = town;

            // Count total items in town
            let totalItems = 0;
            Object.values(this.townData[town]).forEach(shop => {
                Object.values(shop).forEach(room => {
                    totalItems += room.length;
                });
            });

            option.textContent = `${town} (${totalItems} items)`;
            townSelect.appendChild(option);
        });
    }

    selectTown(townName) {
        if (!townName || !this.townData[townName]) {
            this.hideShopList();
            this.hideRoomList();
            return;
        }

        this.currentTown = townName;
        this.currentShop = null;
        this.showShopList(townName);
        this.hideRoomList();
    }

    showShopList(townName) {
        const shopListSection = document.getElementById('shop-list-section');
        const selectedTownName = document.getElementById('selected-town-name');
        const shopList = document.getElementById('shop-list');

        selectedTownName.textContent = townName;
        shopList.innerHTML = '';

        const shops = Object.keys(this.townData[townName]).sort();
        shops.forEach(shopName => {
            const shop = this.townData[townName][shopName];

            // Count items in shop
            let itemCount = 0;
            let roomCount = Object.keys(shop).length;
            Object.values(shop).forEach(room => {
                itemCount += room.length;
            });

            const shopDiv = document.createElement('div');
            shopDiv.className = 'shop-item';
            shopDiv.innerHTML = `
                <div class="shop-name">${shopName}</div>
                <div class="shop-stats">${itemCount} items in ${roomCount} room${roomCount !== 1 ? 's' : ''}</div>
            `;

            shopDiv.addEventListener('click', () => this.selectShop(townName, shopName));
            shopList.appendChild(shopDiv);
        });

        shopListSection.style.display = 'block';
    }

    hideShopList() {
        document.getElementById('shop-list-section').style.display = 'none';
    }

    selectShop(townName, shopName) {
        this.currentShop = shopName;
        this.showRoomList(townName, shopName);
        this.showRoomInventory(townName, shopName);
    }

    showRoomList(townName, shopName) {
        const roomListSection = document.getElementById('room-list-section');
        const selectedShopName = document.getElementById('selected-shop-name');
        const roomList = document.getElementById('room-list');

        selectedShopName.textContent = shopName;
        roomList.innerHTML = '';

        const rooms = Object.keys(this.townData[townName][shopName]).sort();
        rooms.forEach(roomName => {
            const room = this.townData[townName][shopName][roomName];

            const roomDiv = document.createElement('div');
            roomDiv.className = 'room-item';
            roomDiv.innerHTML = `
                <div class="room-name">${roomName}</div>
                <div class="room-stats">${room.length} items</div>
            `;

            roomDiv.addEventListener('click', () => this.showRoomInventory(townName, shopName, roomName));
            roomList.appendChild(roomDiv);
        });

        roomListSection.style.display = 'block';
    }

    hideRoomList() {
        document.getElementById('room-list-section').style.display = 'none';
    }

    showRoomInventory(townName, shopName, specificRoom = null) {
        const shop = this.townData[townName][shopName];
        let itemsToShow = [];

        if (specificRoom) {
            // Show items from specific room
            itemsToShow = shop[specificRoom] || [];
            this.updateResultsHeader(`${specificRoom} - ${shopName}, ${townName}`, itemsToShow.length);
        } else {
            // Show all items from all rooms in shop
            Object.values(shop).forEach(room => {
                itemsToShow = itemsToShow.concat(room);
            });
            this.updateResultsHeader(`${shopName}, ${townName}`, itemsToShow.length);
        }

        // Group items by room for display
        const itemsByRoom = {};
        itemsToShow.forEach(item => {
            const room = item.room || 'Main Room';
            if (!itemsByRoom[room]) {
                itemsByRoom[room] = [];
            }
            itemsByRoom[room].push(item);
        });

        this.displayGroupedItems(itemsByRoom);
    }

    displayGroupedItems(itemsByRoom) {
        const tbody = document.getElementById('results-body');
        tbody.innerHTML = '';

        Object.keys(itemsByRoom).sort().forEach(roomName => {
            // Add room header
            const roomHeader = document.createElement('tr');
            roomHeader.className = 'room-header';
            roomHeader.innerHTML = `
                <td colspan="5">
                    <strong>${roomName}</strong> (${itemsByRoom[roomName].length} items)
                </td>
            `;
            tbody.appendChild(roomHeader);

            // Add items in room
            itemsByRoom[roomName].forEach(item => {
                const row = this.createItemRow(item);
                tbody.appendChild(row);
            });
        });
    }

    createItemRow(item) {
        const row = document.createElement('tr');
        row.className = 'item-row';

        const properties = this.formatItemProperties(item);

        row.innerHTML = `
            <td class="item-name">
                <span class="name">${item.name}</span>
                ${item.enchant > 0 ? `<span class="enchant">+${item.enchant}</span>` : ''}
            </td>
            <td class="item-price">${this.formatPrice(item.price)}</td>
            <td class="item-properties">${properties}</td>
            <td class="item-town">${item.town}</td>
            <td class="item-shop">${item.shopName}</td>
        `;

        // Add click handler for item details
        row.addEventListener('click', () => this.showItemDetails(item));

        return row;
    }

    formatItemProperties(item) {
        const props = [];

        if (item.itemType && item.itemType !== 'miscellaneous') {
            props.push(item.itemType);
        }
        if (item.capacity) {
            props.push(`${item.capacityLevel} capacity`);
        }
        if (item.flares && item.flares.length > 0) {
            props.push(`${item.flares.join(', ')} flares`);
        }
        if (item.spell) {
            props.push('spell');
        }
        if (item.isEnhancive) {
            props.push('enhancive');
        }
        if (item.blessing) {
            props.push(item.blessing);
        }

        return props.join(', ');
    }

    formatPrice(price) {
        if (price >= 1000000) {
            return (price / 1000000).toFixed(1) + 'M';
        } else if (price >= 1000) {
            return (price / 1000).toFixed(1) + 'k';
        }
        return price.toString();
    }

    showItemDetails(item) {
        // Use existing modal functionality from search engine
        if (window.searchEngine && window.searchEngine.showItemDetails) {
            window.searchEngine.showItemDetails(item);
        } else {
            // Fallback: simple alert if search engine not available
            alert(`${item.name}\nPrice: ${this.formatPrice(item.price)}\nShop: ${item.shopName}\nTown: ${item.town}`);
        }
    }

    updateResultsHeader(title, count) {
        document.getElementById('results-count').textContent = `${count} items in ${title}`;
        document.getElementById('page-info').textContent = '';
    }

    backToShops() {
        if (this.currentTown) {
            this.showShopList(this.currentTown);
            this.hideRoomList();

            // Show all items in town
            let allTownItems = [];
            Object.values(this.townData[this.currentTown]).forEach(shop => {
                Object.values(shop).forEach(room => {
                    allTownItems = allTownItems.concat(room);
                });
            });

            this.updateResultsHeader(this.currentTown, allTownItems.length);

            // Display shops overview instead of individual items
            const tbody = document.getElementById('results-body');
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">
                        Select a shop from the sidebar to view its inventory
                    </td>
                </tr>
            `;
        }
    }
}

// Initialize browse engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.browseEngine = new BrowseEngine();
});

// Initialize browse data when main data is loaded
window.addEventListener('dataLoaded', () => {
    if (window.browseEngine) {
        window.browseEngine.initializeBrowseData();
    }
});