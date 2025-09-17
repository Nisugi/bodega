// Data Loading and Caching System
class DataLoader {
    constructor() {
        this.allItems = [];
        this.towns = [];
        this.totalShops = 0;
        this.lastUpdated = null;
        this.isLoading = false;

        // List of JSON files to load
        this.dataFiles = [
            'icemule_trace.json',
            'mist_harbor.json',
            'rivers_rest.json',
            'solhaven.json',
            'ta_illistim.json',
            'ta_vaalor.json',
            'teras_isle.json',
            'wehnimers_landing.json',
            'zul_logoth.json'
        ];
    }

    async loadAllData() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading(true);

        try {
            console.log('Starting data load...');

            const loadPromises = this.dataFiles.map(file => this.loadTownData(file));
            const townDataArray = await Promise.all(loadPromises);

            this.processAllData(townDataArray);
            this.updateStats();
            this.populateTownFilter();

            console.log(`Loaded ${this.allItems.length} items from ${this.towns.length} towns`);

        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load shop data. Please try refreshing the page.');
        } finally {
            this.showLoading(false);
            this.isLoading = false;
        }
    }

    async loadTownData(filename) {
        try {
            console.log(`Loading ${filename}...`);
            const response = await fetch(filename);

            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return null;
        }
    }

    processAllData(townDataArray) {
        this.allItems = [];
        this.towns = [];
        this.totalShops = 0;
        let oldestUpdate = null;

        townDataArray.forEach(townData => {
            if (!townData) return;

            this.towns.push(townData.town);
            this.totalShops += townData.shops.length;

            // Track oldest update time
            if (townData.created_at) {
                const updateTime = new Date(townData.created_at);
                if (!oldestUpdate || updateTime < oldestUpdate) {
                    oldestUpdate = updateTime;
                }
            }

            // Process each shop
            townData.shops.forEach(shop => {
                shop.inv.forEach(room => {
                    room.items.forEach(item => {
                        const processedItem = this.processItem(item, shop, room, townData);
                        if (processedItem) {
                            this.allItems.push(processedItem);
                        }
                    });
                });
            });
        });

        this.lastUpdated = oldestUpdate;
    }

    processItem(item, shop, room, townData) {
        try {
            // Extract price from multiple possible sources
            let price = null;
            if (item.details?.cost) {
                price = parseInt(item.details.cost);
            } else if (item.details?.raw) {
                const priceLine = item.details.raw.find(line =>
                    line.includes('will cost') && line.includes('coins')
                );
                if (priceLine) {
                    const match = priceLine.match(/will cost ([\d,]+) coins/);
                    if (match) {
                        price = parseInt(match[1].replace(/,/g, ''));
                    }
                }
            }

            // Parse advanced properties from raw text
            const advancedProps = this.parseAdvancedProperties(item);

            // Build enhanced item object
            return {
                id: item.id,
                name: item.name,
                town: townData.town,
                shopId: shop.id,
                shopName: this.extractShopName(shop.preamble),
                shopLocation: shop.preamble,
                room: room.room_title,
                branch: room.branch,

                // Price and enchant
                price: price,
                enchant: item.details?.enchant || null,

                // Materials and properties
                material: item.details?.material || null,
                weight: item.details?.weight || null,

                // Enhancives
                enhancives: item.details?.enhancives || [],

                // Tags and properties
                tags: item.details?.tags || [],

                // Raw text for searching
                raw: item.details?.raw || [],

                // Advanced parsed properties
                ...advancedProps,

                // Search text (for fast filtering)
                searchText: this.buildSearchText(item, shop, room, townData)
            };

        } catch (error) {
            console.warn('Error processing item:', item.name, error);
            return null;
        }
    }

    parseAdvancedProperties(item) {
        const properties = {
            capacity: null,
            capacityLevel: null,
            armorType: null,
            weaponType: null,
            shieldType: null,
            itemType: null,
            wearLocation: null,
            flares: [],
            isWeapon: false,
            isArmor: false,
            isShield: false,
            isContainer: false,
            isJewelry: false,
            charges: null,
            spell: null,
            blessing: null
        };

        (item.details?.raw || []).forEach(line => {
            // Capacity parsing
            const capacityMatch = line.match(/can store a (.*?) amount/i);
            if (capacityMatch) {
                properties.capacity = line.trim();
                properties.capacityLevel = capacityMatch[1].toLowerCase();
                properties.isContainer = true;
            }

            // Armor type parsing
            const armorMatch = line.match(/is (.*?) armor that/i) ||
                             line.match(/The .* is (.*?) armor/i);
            if (armorMatch) {
                properties.armorType = armorMatch[1].toLowerCase();
                properties.isArmor = true;
            }

            // No need to parse skill from raw - it's already in the data

            // Shield specific parsing
            if (line.match(/shield that protects/i) || line.match(/is a.*shield/i)) {
                properties.isShield = true;
                const shieldMatch = line.match(/is a (.*?) shield/i);
                if (shieldMatch) {
                    properties.shieldType = shieldMatch[1].toLowerCase();
                }
            }

            // Wear location parsing based on GemStone messaging patterns
            const wearPatterns = [
                // Armor coverage
                { pattern: /covers the (.*?)[\.,]/i, location: '$1' },
                { pattern: /worn (.*?)[\.,]/i, location: '$1' },
                { pattern: /around the (.*?)[\.,]/i, location: '$1' },
                { pattern: /over the (.*?)[\.,]/i, location: '$1' },

                // Specific GS messaging patterns
                { pattern: /put on.*as a (helm|hat|cap|crown)/i, location: 'head' },
                { pattern: /put on.*as (boots|shoes|sandals)/i, location: 'feet' },
                { pattern: /put on.*as (gloves|gauntlets)/i, location: 'hands' },
                { pattern: /put on.*as a (belt)/i, location: 'waist' },
                { pattern: /hung around.*as (necklace|pendant)/i, location: 'neck' },
                { pattern: /slid onto.*as a (ring)/i, location: 'finger' },
                { pattern: /attached to.*as a (bracelet)/i, location: 'wrist' },
                { pattern: /attached to.*as an (anklet)/i, location: 'ankle' },
                { pattern: /hung from.*as.*earring/i, location: 'earlobe' },
                { pattern: /draped from.*as a (cloak|cape)/i, location: 'shoulders' },
                { pattern: /slung over.*as a (shield)/i, location: 'shoulder' },
                { pattern: /worked into.*as (armor)/i, location: 'torso' },
                { pattern: /put over.*as an (apron)/i, location: 'front' },
                { pattern: /put in.*as.*barrette/i, location: 'hair' },
                { pattern: /attached to.*as.*pouch/i, location: 'belt' }
            ];

            for (const wp of wearPatterns) {
                const match = line.match(wp.pattern);
                if (match) {
                    properties.wearLocation = wp.location.replace('$1', match[1]?.trim());
                    break;
                }
            }

            // Flare parsing
            if (line.match(/infused.*power/i) ||
                line.match(/flare/i) ||
                line.match(/holy.*fire/i) ||
                line.match(/blessed.*undead/i)) {
                properties.flares.push(line.trim());
            }

            // Spell parsing
            const spellMatch = line.match(/imbedded with the (.*?) spell/i);
            if (spellMatch) {
                properties.spell = spellMatch[1];
            }

            // Charges parsing
            const chargesMatch = line.match(/(\d+) charges? remaining/i) ||
                               line.match(/looks to have (.*?) charges/i);
            if (chargesMatch) {
                properties.charges = chargesMatch[1];
            }

            // Item type detection - be more specific
            if (line.match(/is.*jewelry/i) ||
                line.match(/\b(ring|necklace|bracelet|earring|pendant|amulet|brooch|pin)\b/i)) {
                properties.isJewelry = true;
                properties.itemType = 'jewelry';
            }

            // Container detection - only if it has storage capacity
            if (line.match(/can store.*amount/i) ||
                line.match(/container.*capacity/i) ||
                line.match(/\b(bag|sack|backpack|pouch|satchel|chest|box|case|trunk|basket)\b/i)) {
                properties.isContainer = true;
                properties.itemType = 'container';
            }

            // Blessing detection
            if (line.match(/blessed/i) || line.match(/holy/i)) {
                properties.blessing = 'holy';
            }
        });

        // Use existing skill field to determine weapons
        if (item.details?.skill) {
            properties.skill = item.details.skill.toLowerCase();
            // Only items with weapon skills are weapons (expanded list)
            const weaponSkills = [
                'edged weapons', 'blunt weapons', 'two handed weapons', 'twohanded weapons',
                'polearms', 'ranged weapons', 'thrown weapons', 'brawling'
            ];
            if (weaponSkills.includes(properties.skill)) {
                properties.isWeapon = true;
                properties.weaponType = properties.skill;
            }
        }

        // Also check for shield use and armor use skills
        if (item.details?.skill) {
            const skill = item.details.skill.toLowerCase();
            if (skill === 'shield use') {
                properties.isShield = true;
                properties.shieldType = 'shield';
            }
            if (skill === 'armor use') {
                properties.isArmor = true;
                properties.armorType = 'armor';
            }
        }

        // Determine primary item type with proper priority
        if (!properties.itemType) {
            // Priority order: Container > Armor > Shield > Weapon > Jewelry > Misc
            if (properties.isContainer) properties.itemType = 'container';
            else if (properties.isArmor) properties.itemType = 'armor';
            else if (properties.isShield) properties.itemType = 'shield';
            else if (properties.isWeapon) properties.itemType = 'weapon';
            else if (properties.isJewelry) properties.itemType = 'jewelry';
            else properties.itemType = 'miscellaneous';
        }

        return properties;
    }

    extractShopName(preamble) {
        if (!preamble) return 'Unknown Shop';

        // Extract shop name from preamble text
        const match = preamble.match(/^(.*?)'s? Shop/i) ||
                     preamble.match(/^(.*?) is located/i) ||
                     preamble.match(/^(.*?),/);

        return match ? match[1].trim() : 'Unknown Shop';
    }

    buildSearchText(item, shop, room, townData) {
        const parts = [
            item.name,
            townData.town,
            shop.preamble || '',
            room.room_title || '',
            ...(item.details?.raw || []),
            ...(item.details?.tags || []),
            item.details?.material || '',
            ...(item.details?.enhancives || []).map(e => `${e.ability} ${e.boost}`)
        ];

        return parts.join(' ').toLowerCase();
    }

    updateStats() {
        document.getElementById('item-count').textContent = this.allItems.length.toLocaleString();
        document.getElementById('shop-count').textContent = this.totalShops.toLocaleString();
        document.getElementById('town-count').textContent = this.towns.length;

        if (this.lastUpdated) {
            document.getElementById('last-updated').textContent = this.lastUpdated.toLocaleDateString();
        }
    }

    populateTownFilter() {
        const townFilter = document.getElementById('town-filter');
        const uniqueTowns = [...new Set(this.towns)].sort();

        // Clear existing options except "All Towns"
        while (townFilter.children.length > 1) {
            townFilter.removeChild(townFilter.lastChild);
        }

        uniqueTowns.forEach(town => {
            const option = document.createElement('option');
            option.value = town;
            option.textContent = town;
            townFilter.appendChild(option);
        });
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        const content = document.getElementById('content');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        content.insertBefore(errorDiv, content.firstChild);
    }

    // Utility methods for other components
    getAllItems() {
        return this.allItems;
    }

    getTowns() {
        return [...new Set(this.towns)].sort();
    }

    getItemById(id) {
        return this.allItems.find(item => item.id === id);
    }

    // Price formatting utility
    static formatPrice(price) {
        if (!price || price === 0) return 'Free';

        if (price >= 1000000) {
            return (price / 1000000).toFixed(1) + 'M';
        } else if (price >= 1000) {
            return (price / 1000).toFixed(0) + 'k';
        }
        return price.toLocaleString();
    }

    // Get price range for filtering
    static getPriceRange(rangeString) {
        if (!rangeString) return { min: 0, max: Infinity };

        const [min, max] = rangeString.split('-').map(Number);
        return { min: min || 0, max: max || Infinity };
    }
}

// Global data loader instance
window.dataLoader = new DataLoader();

// Add backward compatibility method
window.dataLoader.getAllItems = function() {
    return this.allData;
};

// Auto-load data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Starting data load...');
    await window.dataLoader.loadAllData();
    console.log('Data loading complete, dispatching dataLoaded event');
    console.log('Total items loaded:', window.dataLoader.allData.length);
    // Notify search.js that data is loaded
    window.dispatchEvent(new CustomEvent('dataLoaded'));
});