// ============================================
// Telegram Web App - Channel Finder
// Advanced search functionality for Telegram channels and groups
// ============================================

const tg = window.Telegram.WebApp;

// Initialize app state
const state = {
    searchQuery: '',
    selectedType: 'all',
    selectedCategory: '',
    selectedLanguage: '',
    results: [],
    isLoading: false
};

// DOM elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    clearBtn: document.getElementById('clearBtn'),
    searchBtn: document.getElementById('searchBtn'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    categorySelect: document.getElementById('categorySelect'),
    languageSelect: document.getElementById('languageSelect'),
    loadingState: document.getElementById('loadingState'),
    resultsSection: document.getElementById('resultsSection'),
    resultsContainer: document.getElementById('resultsContainer'),
    resultsCount: document.getElementById('resultsCount'),
    emptyState: document.getElementById('emptyState'),
    noResultsState: document.getElementById('noResultsState')
};

// ============================================
// Initialize Telegram Web App
// ============================================
function initTelegramWebApp() {
    // Expand the web app to full height
    tg.expand();
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    // Apply theme colors
    applyTheme();
    
    // Set up back button
    tg.BackButton.onClick(() => {
        tg.close();
    });
    
    // Notify that the app is ready
    tg.ready();
    
    console.log('Telegram Web App initialized');
    console.log('User:', tg.initDataUnsafe.user);
    console.log('Theme:', tg.themeParams);
}

// ============================================
// Apply Telegram Theme
// ============================================
function applyTheme() {
    const root = document.documentElement;
    const theme = tg.themeParams;
    
    if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
    if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
    if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
    if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
    if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
    if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
    if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
    if (theme.header_bg_color) root.style.setProperty('--tg-theme-header-bg-color', theme.header_bg_color);
    if (theme.section_bg_color) root.style.setProperty('--tg-theme-section-bg-color', theme.section_bg_color);
    if (theme.accent_text_color) root.style.setProperty('--tg-theme-accent-text-color', theme.accent_text_color);
    
    // Update theme on change
    tg.onEvent('themeChanged', applyTheme);
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Search input
    elements.searchInput.addEventListener('input', handleSearchInput);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Clear button
    elements.clearBtn.addEventListener('click', clearSearch);
    
    // Search button
    elements.searchBtn.addEventListener('click', performSearch);
    
    // Filter buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilterClick(btn));
    });
    
    // Category and language selects
    elements.categorySelect.addEventListener('change', () => {
        state.selectedCategory = elements.categorySelect.value;
    });
    
    elements.languageSelect.addEventListener('change', () => {
        state.selectedLanguage = elements.languageSelect.value;
    });
}

// ============================================
// Search Input Handler
// ============================================
function handleSearchInput(e) {
    const value = e.target.value.trim();
    state.searchQuery = value;
    
    // Show/hide clear button
    elements.clearBtn.style.display = value ? 'flex' : 'none';
}

// ============================================
// Clear Search
// ============================================
function clearSearch() {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearBtn.style.display = 'none';
    elements.searchInput.focus();
}

// ============================================
// Filter Click Handler
// ============================================
function handleFilterClick(btn) {
    // Remove active class from all buttons
    elements.filterBtns.forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Update state
    state.selectedType = btn.dataset.type;
    
    // Haptic feedback
    tg.HapticFeedback.impactOccurred('light');
}

// ============================================
// Perform Search
// ============================================
async function performSearch() {
    if (!state.searchQuery) {
        tg.showAlert('Please enter a search query');
        return;
    }
    
    // Haptic feedback
    tg.HapticFeedback.impactOccurred('medium');
    
    // Show loading state
    showLoading();
    
    try {
        // Prepare search parameters
        const searchParams = {
            query: state.searchQuery,
            type: state.selectedType,
            category: state.selectedCategory,
            language: state.selectedLanguage,
            user_id: tg.initDataUnsafe.user?.id
        };
        
        // Send data to bot backend
        const results = await searchChannels(searchParams);
        
        // Update state
        state.results = results;
        
        // Display results
        displayResults(results);
        
    } catch (error) {
        console.error('Search error:', error);
        tg.showAlert('Search failed. Please try again.');
        hideLoading();
    }
}

// ============================================
// Search Channels (API Call)
// ============================================
async function searchChannels(params) {
    try {
        // Show main button while searching
        tg.MainButton.setText('Searching...');
        tg.MainButton.show();
        tg.MainButton.showProgress();
        
        // Build API URL
        const apiUrl = new URL('/api/search', window.location.origin);
        apiUrl.searchParams.set('q', params.query);
        if (params.type && params.type !== 'all') {
            apiUrl.searchParams.set('type', params.type);
        }
        if (params.category && params.category !== 'all') {
            apiUrl.searchParams.set('category', params.category);
        }
        if (params.language && params.language !== 'all') {
            apiUrl.searchParams.set('lang', params.language);
        }
        
        // Call backend API
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        tg.MainButton.hideProgress();
        tg.MainButton.hide();
        
        if (!data.success) {
            throw new Error(data.error || 'Search failed');
        }
        
        return data.results || [];
        
    } catch (error) {
        tg.MainButton.hideProgress();
        tg.MainButton.hide();
        console.error('Search error:', error);
        
        // Show error to user
        tg.showAlert(`Search failed: ${error.message}`);
        
        return [];
    }
}

// ============================================
// Generate Mock Results (Replace with real API)
// ============================================
async function generateMockResults(params) {
    const { query, type, category, language } = params;
    
    // This is mock data - in production, this would come from your bot's backend
    // which scrapes and indexes Telegram channels
    const mockData = [
        {
            id: 1,
            name: 'Tech News Daily',
            username: '@technewsdaily',
            type: 'channel',
            description: 'Latest technology news, updates, and insights from around the world. Stay informed about AI, gadgets, and innovations.',
            members: 125000,
            category: 'technology',
            language: 'en',
            verified: true,
            tags: ['Technology', 'News', 'AI', 'Gadgets']
        },
        {
            id: 2,
            name: 'Crypto Traders Hub',
            username: '@cryptotradershub',
            type: 'group',
            description: 'Professional crypto trading community. Share signals, strategies, and market analysis with fellow traders.',
            members: 45000,
            category: 'crypto',
            language: 'en',
            verified: false,
            tags: ['Crypto', 'Trading', 'Bitcoin', 'Finance']
        },
        {
            id: 3,
            name: 'Python Developers',
            username: '@pythondevs',
            type: 'group',
            description: 'Community for Python developers. Share code, ask questions, and learn together. All skill levels welcome!',
            members: 89000,
            category: 'technology',
            language: 'en',
            verified: true,
            tags: ['Python', 'Programming', 'Development', 'Coding']
        },
        {
            id: 4,
            name: 'Motivation Station',
            username: '@motivationstation',
            type: 'channel',
            description: 'Daily motivation, inspirational quotes, and success stories to keep you motivated and focused on your goals.',
            members: 200000,
            category: 'lifestyle',
            language: 'en',
            verified: true,
            tags: ['Motivation', 'Inspiration', 'Success', 'Mindset']
        },
        {
            id: 5,
            name: 'Gaming News & Reviews',
            username: '@gamingnewsreviews',
            type: 'channel',
            description: 'Latest gaming news, reviews, and gameplay. Coverage of PC, console, and mobile games.',
            members: 156000,
            category: 'gaming',
            language: 'en',
            verified: false,
            tags: ['Gaming', 'Reviews', 'PC Gaming', 'Console']
        },
        {
            id: 6,
            name: 'Business Insights',
            username: '@businessinsights',
            type: 'channel',
            description: 'Business strategies, entrepreneurship tips, and market insights for growing your business successfully.',
            members: 78000,
            category: 'business',
            language: 'en',
            verified: true,
            tags: ['Business', 'Entrepreneurship', 'Startup', 'Marketing']
        }
    ];
    
    // Filter results based on parameters
    let results = mockData.filter(item => {
        // Filter by type
        if (type !== 'all' && item.type !== type) return false;
        
        // Filter by category
        if (category && item.category !== category) return false;
        
        // Filter by language
        if (language && item.language !== language) return false;
        
        // Filter by search query (search in name, username, description, tags)
        if (query) {
            const searchLower = query.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(searchLower);
            const matchesUsername = item.username.toLowerCase().includes(searchLower);
            const matchesDescription = item.description.toLowerCase().includes(searchLower);
            const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(searchLower));
            
            if (!matchesName && !matchesUsername && !matchesDescription && !matchesTags) {
                return false;
            }
        }
        
        return true;
    });
    
    return results;
}

// ============================================
// Display Results
// ============================================
function displayResults(results) {
    hideLoading();
    
    // Hide empty state
    elements.emptyState.style.display = 'none';
    
    if (results.length === 0) {
        // Show no results state
        elements.resultsSection.style.display = 'none';
        elements.noResultsState.style.display = 'block';
        return;
    }
    
    // Hide no results state
    elements.noResultsState.style.display = 'none';
    
    // Show results section
    elements.resultsSection.style.display = 'block';
    
    // Update results count
    elements.resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
    
    // Clear previous results
    elements.resultsContainer.innerHTML = '';
    
    // Render each result
    results.forEach((result, index) => {
        const card = createResultCard(result, index);
        elements.resultsContainer.appendChild(card);
    });
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// Create Result Card
// ============================================
function createResultCard(result, index) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${index * 50}ms`;
    
    // Get first letter for avatar
    const firstLetter = result.name.charAt(0).toUpperCase();
    
    // Format members count
    const membersFormatted = formatNumber(result.members);
    
    // Verified badge SVG
    const verifiedBadge = result.verified ? `
        <svg class="verified-badge" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    ` : '';
    
    card.innerHTML = `
        <div class="result-header">
            <div class="result-avatar">${firstLetter}</div>
            <div class="result-info">
                <div class="result-name">
                    ${result.name}
                    ${verifiedBadge}
                </div>
                <div class="result-username">${result.username}</div>
            </div>
        </div>
        
        <p class="result-description">${result.description}</p>
        
        <div class="result-meta">
            <div class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                ${membersFormatted}
            </div>
            <div class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    ${result.type === 'channel' 
                        ? '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>'
                        : '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>'
                    }
                </svg>
                ${result.type.charAt(0).toUpperCase() + result.type.slice(1)}
            </div>
        </div>
        
        <div class="result-tags">
            ${result.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        
        <div class="result-actions">
            <button class="action-btn action-btn-primary" onclick="openChannel('${result.username}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Open
            </button>
            <button class="action-btn action-btn-secondary" onclick="shareChannel('${result.username}', '${result.name}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
            </button>
        </div>
    `;
    
    return card;
}

// ============================================
// Open Channel
// ============================================
window.openChannel = function(username) {
    // Haptic feedback
    tg.HapticFeedback.impactOccurred('medium');
    
    // Remove @ if present
    const cleanUsername = username.replace('@', '');
    
    // Open Telegram link
    const link = `https://t.me/${cleanUsername}`;
    tg.openTelegramLink(link);
};

// ============================================
// Share Channel
// ============================================
window.shareChannel = function(username, name) {
    // Haptic feedback
    tg.HapticFeedback.impactOccurred('light');
    
    // Create share text
    const shareText = `Check out ${name} on Telegram: https://t.me/${username.replace('@', '')}`;
    
    // Use Telegram's share functionality
    tg.switchInlineQuery(shareText, ['users', 'groups', 'channels']);
};

// ============================================
// Utility Functions
// ============================================
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showLoading() {
    state.isLoading = true;
    elements.loadingState.style.display = 'block';
    elements.resultsSection.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.noResultsState.style.display = 'none';
    elements.searchBtn.disabled = true;
}

function hideLoading() {
    state.isLoading = false;
    elements.loadingState.style.display = 'none';
    elements.searchBtn.disabled = false;
}

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTelegramWebApp();
    setupEventListeners();
    console.log('App initialized successfully');
});

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    tg.showAlert('An error occurred. Please try again.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    tg.showAlert('An error occurred. Please try again.');
});
