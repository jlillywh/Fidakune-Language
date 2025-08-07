/**
 * Fidakune Integration Module
 * Provides shared functionality between lexicon search and conceptual search
 */

class FidakuneIntegration {
    constructor() {
        this.searchHistory = this.loadSearchHistory();
        this.userPreferences = this.loadUserPreferences();
        this.currentApp = this.detectCurrentApp();
        this.crossAppData = new Map();
        
        this.init();
    }
    
    init() {
        this.setupCrossAppNavigation();
        this.setupSharedErrorHandling();
        this.setupSharedAnalytics();
        this.setupSharedAccessibility();
        
        console.log(`Fidakune Integration initialized for ${this.currentApp}`);
    }
    
    detectCurrentApp() {
        if (window.location.pathname.includes('graph-conceptual-search')) {
            return 'conceptual-search';
        } else if (window.location.pathname.includes('lexicon-search')) {
            return 'lexicon-search';
        } else {
            // Try to detect based on page content
            if (document.querySelector('.conceptual-explorer')) {
                return 'conceptual-search';
            } else if (document.querySelector('.lexicon-search')) {
                return 'lexicon-search';
            }
        }
        return 'unknown';
    }
    
    setupCrossAppNavigation() {
        // Add navigation links between apps
        this.addCrossAppLinks();
        
        // Set up shared search functionality
        this.setupSharedSearch();
        
        // Set up context transfer
        this.setupContextTransfer();
    }
    
    addCrossAppLinks() {
        const header = document.querySelector('.header__nav');
        if (!header) return;
        
        // Create navigation links based on current app
        const links = this.createNavigationLinks();
        
        links.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.href;
            linkElement.className = 'header__nav-link';
            linkElement.textContent = link.text;
            linkElement.setAttribute('aria-label', link.ariaLabel);
            
            // Add active state for current app
            if (link.current) {
                linkElement.classList.add('header__nav-link--active');
                linkElement.setAttribute('aria-current', 'page');
            }
            
            header.appendChild(linkElement);
        });
    }
    
    createNavigationLinks() {
        const baseLinks = [
            {
                href: 'lexicon-search.html',
                text: 'Traditional Search',
                ariaLabel: 'Switch to traditional lexicon search',
                current: this.currentApp === 'lexicon-search'
            },
            {
                href: 'graph-conceptual-search.html',
                text: 'Conceptual Explorer',
                ariaLabel: 'Switch to graph-based conceptual search',
                current: this.currentApp === 'conceptual-search'
            }
        ];
        
        return baseLinks;
    }
    
    setupSharedSearch() {
        // Create shared search interface
        this.sharedSearch = {
            transferQuery: (query, targetApp) => {
                this.transferSearchQuery(query, targetApp);
            },
            
            addToHistory: (query, app, results) => {
                this.addToSearchHistory(query, app, results);
            },
            
            getHistory: () => {
                return this.searchHistory;
            },
            
            clearHistory: () => {
                this.clearSearchHistory();
            }
        };
        
        // Make available globally
        window.FidakuneSharedSearch = this.sharedSearch;
    }
    
    setupContextTransfer() {
        // Listen for context transfer requests
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'fidakune-context-transfer') {
                this.handleContextTransfer(event.data);
            }
        });
        
        // Set up URL parameter handling for context transfer
        this.handleURLParameters();
    }
    
    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Handle transferred search query
        const transferredQuery = urlParams.get('q');
        if (transferredQuery) {
            this.handleTransferredQuery(transferredQuery);
        }
        
        // Handle source app context
        const sourceApp = urlParams.get('from');
        if (sourceApp) {
            this.handleSourceAppContext(sourceApp);
        }
        
        // Handle specific concept focus
        const focusConcept = urlParams.get('focus');
        if (focusConcept) {
            this.handleConceptFocus(focusConcept);
        }
    }
    
    transferSearchQuery(query, targetApp) {
        const targetUrls = {
            'lexicon-search': 'lexicon-search.html',
            'conceptual-search': 'graph-conceptual-search.html'
        };
        
        const targetUrl = targetUrls[targetApp];
        if (!targetUrl) return;
        
        // Build URL with context
        const url = new URL(targetUrl, window.location.origin);
        url.searchParams.set('q', query);
        url.searchParams.set('from', this.currentApp);
        
        // Add current context
        const context = this.getCurrentContext();
        if (context) {
            url.searchParams.set('context', JSON.stringify(context));
        }
        
        // Navigate to target app
        window.location.href = url.toString();
    }
    
    getCurrentContext() {
        // Gather current app context
        const context = {
            timestamp: Date.now(),
            app: this.currentApp,
            searchHistory: this.searchHistory.slice(-5), // Last 5 searches
            userPreferences: this.userPreferences
        };
        
        // Add app-specific context
        if (this.currentApp === 'conceptual-search' && window.conceptualExplorer) {
            context.conceptualContext = {
                currentQuery: window.conceptualExplorer.currentQuery,
                searchHistory: window.conceptualExplorer.searchHistory,
                selectedConcept: window.conceptualExplorer.explorationState.selectedConcept
            };
        }
        
        return context;
    }
    
    handleTransferredQuery(query) {
        // Wait for app to be ready
        setTimeout(() => {
            this.executeTransferredQuery(query);
        }, 500);
    }
    
    executeTransferredQuery(query) {
        if (this.currentApp === 'conceptual-search' && window.conceptualExplorer) {
            // Transfer to conceptual search
            const searchInput = document.getElementById('graph-search-input');
            if (searchInput) {
                searchInput.value = query;
                window.conceptualExplorer.performSearch();
                
                // Show transfer notification
                this.showTransferNotification('Search transferred from Traditional Search');
            }
        } else if (this.currentApp === 'lexicon-search') {
            // Transfer to lexicon search
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = query;
                
                // Trigger search if function exists
                if (window.performSearch) {
                    window.performSearch(query);
                }
                
                // Show transfer notification
                this.showTransferNotification('Search transferred from Conceptual Explorer');
            }
        }
    }
    
    showTransferNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'transfer-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    addToSearchHistory(query, app, results = null) {
        const historyEntry = {
            query,
            app,
            timestamp: Date.now(),
            resultCount: results ? this.countResults(results) : 0
        };
        
        // Avoid duplicates
        const existingIndex = this.searchHistory.findIndex(
            entry => entry.query === query && entry.app === app
        );
        
        if (existingIndex !== -1) {
            this.searchHistory.splice(existingIndex, 1);
        }
        
        this.searchHistory.unshift(historyEntry);
        
        // Limit history size
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        this.saveSearchHistory();
    }
    
    countResults(results) {
        if (Array.isArray(results)) {
            return results.length;
        } else if (results && typeof results === 'object') {
            // Handle conceptual search results
            return (results.directlyRelated?.length || 0) +
                   (results.componentRoots?.length || 0) +
                   (results.relatedIdeas?.length || 0);
        }
        return 0;
    }
    
    setupSharedErrorHandling() {
        // Create unified error handler
        this.errorHandler = {
            handleError: (error, context = {}) => {
                this.handleUnifiedError(error, context);
            },
            
            showError: (message, type = 'error') => {
                this.showUnifiedError(message, type);
            },
            
            clearErrors: () => {
                this.clearUnifiedErrors();
            }
        };
        
        // Make available globally
        window.FidakuneErrorHandler = this.errorHandler;
        
        // Set up global error handling
        window.addEventListener('error', (event) => {
            this.handleUnifiedError(event.error, {
                type: 'javascript',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnifiedError(event.reason, {
                type: 'promise',
                promise: event.promise
            });
        });
    }
    
    handleUnifiedError(error, context = {}) {
        const errorInfo = {
            message: error.message || error,
            stack: error.stack,
            timestamp: Date.now(),
            app: this.currentApp,
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Log error
        console.error('Fidakune Error:', errorInfo);
        
        // Show user-friendly error message
        this.showUnifiedError(this.getUserFriendlyErrorMessage(error));
        
        // Report error if analytics is available
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: false,
                custom_map: {
                    app: this.currentApp
                }
            });
        }
    }
    
    getUserFriendlyErrorMessage(error) {
        const message = error.message || error;
        
        // Map technical errors to user-friendly messages
        const errorMappings = {
            'Failed to fetch': 'Network connection error. Please check your internet connection.',
            'NetworkError': 'Unable to connect to the server. Please try again.',
            'TypeError': 'An unexpected error occurred. Please refresh the page.',
            'SyntaxError': 'Data format error. Please try again.',
            'ReferenceError': 'Application error. Please refresh the page.'
        };
        
        for (const [technical, friendly] of Object.entries(errorMappings)) {
            if (message.includes(technical)) {
                return friendly;
            }
        }
        
        return 'An unexpected error occurred. Please try again or refresh the page.';
    }
    
    showUnifiedError(message, type = 'error') {
        // Remove existing error messages
        this.clearUnifiedErrors();
        
        const errorElement = document.createElement('div');
        errorElement.className = `unified-error unified-error--${type}`;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'assertive');
        
        errorElement.innerHTML = `
            <div class="unified-error__content">
                <div class="unified-error__icon">${this.getErrorIcon(type)}</div>
                <div class="unified-error__message">${message}</div>
                <button class="unified-error__close" aria-label="Close error message">×</button>
            </div>
        `;
        
        errorElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            max-width: 500px;
            animation: slideInDown 0.3s ease-out;
        `;
        
        document.body.appendChild(errorElement);
        
        // Add close functionality
        const closeButton = errorElement.querySelector('.unified-error__close');
        closeButton.addEventListener('click', () => {
            this.clearUnifiedErrors();
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            this.clearUnifiedErrors();
        }, 10000);
    }
    
    getErrorIcon(type) {
        const icons = {
            error: '⚠️',
            warning: '⚠️',
            info: 'ℹ️',
            success: '✅'
        };
        return icons[type] || icons.error;
    }
    
    clearUnifiedErrors() {
        const existingErrors = document.querySelectorAll('.unified-error');
        existingErrors.forEach(error => {
            error.style.animation = 'slideOutUp 0.3s ease-in forwards';
            setTimeout(() => error.remove(), 300);
        });
    }
    
    setupSharedAnalytics() {
        // Create shared analytics interface
        this.analytics = {
            trackSearch: (query, app, resultCount) => {
                this.trackSearchEvent(query, app, resultCount);
            },
            
            trackNavigation: (from, to, context) => {
                this.trackNavigationEvent(from, to, context);
            },
            
            trackError: (error, context) => {
                this.trackErrorEvent(error, context);
            }
        };
        
        // Make available globally
        window.FidakuneAnalytics = this.analytics;
    }
    
    trackSearchEvent(query, app, resultCount) {
        if (window.gtag) {
            window.gtag('event', 'search', {
                search_term: query,
                custom_map: {
                    app: app,
                    result_count: resultCount
                }
            });
        }
        
        // Add to search history
        this.addToSearchHistory(query, app, { length: resultCount });
    }
    
    trackNavigationEvent(from, to, context) {
        if (window.gtag) {
            window.gtag('event', 'app_navigation', {
                custom_map: {
                    from_app: from,
                    to_app: to,
                    context: JSON.stringify(context)
                }
            });
        }
    }
    
    setupSharedAccessibility() {
        // Create shared accessibility utilities
        this.accessibility = {
            announceToScreenReader: (message, priority = 'polite') => {
                this.announceToScreenReader(message, priority);
            },
            
            manageFocus: (element) => {
                this.manageFocus(element);
            },
            
            addSkipLinks: () => {
                this.addSkipLinks();
            }
        };
        
        // Make available globally
        window.FidakuneAccessibility = this.accessibility;
        
        // Set up shared accessibility features
        this.addSkipLinks();
    }
    
    announceToScreenReader(message, priority = 'polite') {
        let liveRegion = document.getElementById('shared-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'shared-live-region';
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion.textContent = message;
        }, 100);
    }
    
    addSkipLinks() {
        // Add skip links if they don't exist
        if (document.querySelector('.skip-link')) return;
        
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #2c3e50;
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem('fidakune-search-history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load search history:', error);
            return [];
        }
    }
    
    saveSearchHistory() {
        try {
            localStorage.setItem('fidakune-search-history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }
    
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }
    
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('fidakune-user-preferences');
            return stored ? JSON.parse(stored) : {
                theme: 'light',
                language: 'en',
                accessibility: {
                    highContrast: false,
                    reducedMotion: false,
                    largeText: false
                }
            };
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
            return {};
        }
    }
    
    saveUserPreferences() {
        try {
            localStorage.setItem('fidakune-user-preferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }
}

// Initialize integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.FidakuneIntegration = new FidakuneIntegration();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FidakuneIntegration;
}