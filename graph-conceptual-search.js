/**
 * Fidakune Conceptual Explorer - Main Interface Controller
 * Handles user interactions, search functionality, and UI state management
 */

class ConceptualExplorer {
    constructor() {
        this.searchEngine = null;
        this.currentQuery = '';
        this.searchHistory = [];
        this.currentResults = null;
        this.navigationState = {
            isNavigating: false,
            animationDuration: 300,
            currentFocus: null,
            keyboardNavigationEnabled: true,
            focusHistory: [],
            currentFocusIndex: -1,
            keyboardShortcutsEnabled: true,
            tabTrapActive: false
        };
        this.explorationState = {
            expandedConcepts: new Set(),
            selectedConcept: null,
            detailsHistory: []
        };
        this.mobileState = {
            touchStartX: 0,
            touchStartY: 0,
            touchEndX: 0,
            touchEndY: 0,
            isSwipeGesture: false,
            currentCategory: 0,
            categories: ['directly-related', 'component-roots', 'related-ideas'],
            pullRefreshThreshold: 80,
            isPullRefreshing: false
        };
        
        // DOM elements
        this.elements = {
            searchInput: document.getElementById('graph-search-input'),
            searchForm: document.querySelector('.search-form'),
            loadingIndicator: document.getElementById('loading-indicator'),
            breadcrumbs: document.getElementById('breadcrumbs'),
            breadcrumbsList: document.getElementById('breadcrumbs-list'),
            backButton: document.getElementById('back-button'),
            resultsContainer: document.getElementById('results-container'),
            noResults: document.getElementById('no-results'),
            conceptDetails: document.getElementById('concept-details'),
            conceptDetailsContent: document.getElementById('concept-details-content'),
            closeDetails: document.getElementById('close-details'),
            
            // Category sections
            directlyRelated: {
                section: document.getElementById('directly-related'),
                list: document.getElementById('directly-related-list'),
                empty: document.getElementById('directly-related-empty')
            },
            componentRoots: {
                section: document.getElementById('component-roots'),
                list: document.getElementById('component-roots-list'),
                empty: document.getElementById('component-roots-empty')
            },
            relatedIdeas: {
                section: document.getElementById('related-ideas'),
                list: document.getElementById('related-ideas-list'),
                empty: document.getElementById('related-ideas-empty')
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize search engine
            this.searchEngine = new GraphSearchEngine();
            await this.searchEngine.loadGraph();
            
            // Start performance monitoring
            this.searchEngine.startPerformanceMonitoring();
            
            // Optimize graph structures for better performance
            this.searchEngine.optimizeGraphStructures();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI state
            this.updateUIState();
            
            // Set up responsive card layout
            this.addResponsiveCardLayout();
            
            // Initialize keyboard navigation
            this.initializeKeyboardNavigation();
            
            // Initialize performance optimizations
            this.initializePerformanceOptimizations();
            
            // Initialize mobile optimizations
            this.initializeMobileOptimizations();
            
            // Initialize integration features
            this.initializeIntegration();
            
            console.log('Conceptual Explorer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Conceptual Explorer:', error);
            this.showError('Failed to load the conceptual graph. Please refresh the page.');
        }
    }
    
    setupEventListeners() {
        // Search form submission
        this.elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });
        
        // Real-time search suggestions (debounced)
        let searchTimeout;
        this.elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.showSearchSuggestions(e.target.value);
                this.updateTransferButton(e.target.value);
            }, 300);
        });
        
        // Back button
        this.elements.backButton.addEventListener('click', () => {
            this.goBack();
        });
        
        // Close concept details
        this.elements.closeDetails.addEventListener('click', () => {
            this.hideConceptDetails();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // Suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const concept = e.target.dataset.concept;
                if (concept) {
                    this.searchForConcept(concept);
                }
            }
        });
        
        // Cross-app transfer button
        const transferButton = document.getElementById('transfer-to-lexicon');
        if (transferButton) {
            transferButton.addEventListener('click', () => {
                this.transferToLexiconSearch();
            });
        }
        
        // Enhanced concept item interactions
        document.addEventListener('click', (e) => {
            const conceptItem = e.target.closest('.concept-item');
            if (conceptItem) {
                const concept = conceptItem.dataset.concept;
                if (concept) {
                    this.exploreConceptRelationships(concept, conceptItem);
                }
                return;
            }
            
            // Concept details related items
            if (e.target.classList.contains('concept-details__related-item')) {
                const concept = e.target.dataset.concept;
                if (concept) {
                    this.exploreConceptRelationships(concept);
                    this.hideConceptDetails();
                }
                return;
            }
            
            // Concept details explore button
            if (e.target.classList.contains('concept-details__explore-btn')) {
                const concept = e.target.dataset.concept;
                if (concept) {
                    this.exploreConceptRelationships(concept);
                    this.hideConceptDetails();
                }
                return;
            }
        });
        
        // Double-click for concept details
        document.addEventListener('dblclick', (e) => {
            const conceptItem = e.target.closest('.concept-item');
            if (conceptItem) {
                e.preventDefault();
                const conceptLabel = conceptItem.dataset.concept;
                const conceptId = conceptItem.dataset.conceptId;
                
                if (conceptLabel && this.searchEngine) {
                    const node = this.searchEngine.getNode(conceptId) || 
                                 this.findNodeByLabel(conceptLabel);
                    if (node) {
                        this.showConceptDetails(node, conceptItem);
                    }
                }
            }
        });
        
        // Right-click context menu (future enhancement)
        document.addEventListener('contextmenu', (e) => {
            const conceptItem = e.target.closest('.concept-item');
            if (conceptItem) {
                e.preventDefault();
                // Could show context menu with options like "Show details", "Copy label", etc.
                this.showConceptContextMenu(e, conceptItem);
            }
        });
    }
    
    async performSearch() {
        const query = this.elements.searchInput.value.trim();
        if (!query) return;
        
        const searchStartTime = performance.now();
        
        // Announce search start to screen readers
        this.announceToScreenReader(`Searching for "${query}"`, 'search-status');
        
        // Use mobile-optimized loading on mobile devices
        if (this.isMobile) {
            this.showMobileLoadingSkeletons();
            
            // Show mobile category navigation
            const categoryNav = document.querySelector('.mobile-category-nav');
            if (categoryNav) {
                categoryNav.classList.add('active');
            }
        } else {
            this.showLoading(true);
        }
        
        this.currentQuery = query;
        
        try {
            const results = await this.searchEngine.search(query);
            const searchEndTime = performance.now();
            const searchTime = searchEndTime - searchStartTime;
            
            // Use lazy loading for large result sets
            if (this.lazyLoadingConfig.enabled) {
                await this.displayResultsWithLazyLoading(results);
            } else {
                this.displayResults(results);
            }
            
            this.addToHistory(query);
            this.updateBreadcrumbs();
            
            // Add to shared search history
            if (window.FidakuneSharedSearch) {
                const resultCount = this.searchEngine.countTotalResults(results);
                window.FidakuneSharedSearch.addToHistory(query, 'conceptual-search', results);
                
                // Track analytics
                if (window.FidakuneAnalytics) {
                    window.FidakuneAnalytics.trackSearch(query, 'conceptual-search', resultCount);
                }
            }
            
            // Mobile-specific optimizations
            if (this.isMobile) {
                this.optimizeResultsForMobile();
                
                // Set up intersection observer for visible items
                if (this.mobileIntersectionObserver) {
                    const conceptItems = document.querySelectorAll('.concept-item');
                    conceptItems.forEach(item => {
                        this.mobileIntersectionObserver.observe(item);
                    });
                }
            }
            
            // Update performance indicator
            const resultCount = this.searchEngine.countTotalResults(results);
            const fromCache = results.fromCache || false;
            this.updatePerformanceIndicator(searchTime, resultCount, fromCache);
            
            // Announce search completion
            this.announceSearchResults(results, query);
            
        } catch (error) {
            console.error('Search failed:', error);
            
            // Use unified error handling
            if (window.FidakuneErrorHandler) {
                window.FidakuneErrorHandler.handleError(error, {
                    context: 'search',
                    query: query,
                    app: 'conceptual-search'
                });
            } else {
                this.showError('Search failed. Please try again.');
            }
            
            this.announceToScreenReader('Search failed. Please try again.', 'search-status');
        } finally {
            if (!this.isMobile) {
                this.showLoading(false);
            }
        }
    }
    
    optimizeResultsForMobile() {
        // Add timestamps to concept items for cleanup
        const conceptItems = document.querySelectorAll('.concept-item');
        const timestamp = Date.now();
        
        conceptItems.forEach(item => {
            item.dataset.timestamp = timestamp;
        });
        
        // Show only first category on mobile initially
        if (this.isMobile) {
            this.switchMobileCategory('directly-related');
        }
        
        // Optimize images and heavy content for mobile
        this.optimizeContentForMobile();
    }
    
    optimizeContentForMobile() {
        // Reduce animation complexity on mobile
        const conceptItems = document.querySelectorAll('.concept-item');
        
        conceptItems.forEach(item => {
            // Add mobile-optimized class
            item.classList.add('mobile-optimized');
            
            // Simplify hover effects on touch devices
            if (this.isMobile) {
                item.addEventListener('touchstart', () => {
                    item.classList.add('mobile-touched');
                }, { passive: true });
                
                item.addEventListener('touchend', () => {
                    setTimeout(() => {
                        item.classList.remove('mobile-touched');
                    }, 150);
                }, { passive: true });
            }
        });
    }
    
    initializeIntegration() {
        // Wait for integration module to be ready
        if (window.FidakuneIntegration) {
            this.setupIntegratedErrorHandling();
            this.setupSharedAccessibility();
            this.addSearchHistoryIntegration();
            
            console.log('Integration features initialized');
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeIntegration();
            }, 100);
        }
    }
    
    async searchForConcept(concept) {
        this.elements.searchInput.value = concept;
        await this.performSearch();
    }
    
    async exploreConceptRelationships(concept, sourceElement = null) {
        // Prevent multiple simultaneous navigations
        if (this.navigationState.isNavigating) return;
        
        this.navigationState.isNavigating = true;
        
        // Announce exploration start
        this.announceConceptExploration(concept);
        
        try {
            // Add smooth transition effect
            if (sourceElement) {
                this.addNavigationTransition(sourceElement);
            }
            
            // Update search input with smooth animation
            await this.animateSearchInputChange(concept);
            
            // Perform search with enhanced loading state
            await this.performSearchWithTransition();
            
            // Update exploration state
            this.explorationState.selectedConcept = concept;
            
            // Scroll to results smoothly
            this.scrollToResults();
            
        } finally {
            this.navigationState.isNavigating = false;
        }
    }
    
    async animateSearchInputChange(newValue) {
        const input = this.elements.searchInput;
        const currentValue = input.value;
        
        if (currentValue === newValue) return;
        
        // Fade out current value
        input.style.transition = 'opacity 0.2s ease';
        input.style.opacity = '0.5';
        
        await this.delay(200);
        
        // Update value and fade in
        input.value = newValue;
        input.style.opacity = '1';
        
        await this.delay(100);
        input.style.transition = '';
    }
    
    addNavigationTransition(sourceElement) {
        // Add visual feedback to source element
        sourceElement.style.transform = 'scale(0.95)';
        sourceElement.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            sourceElement.style.transform = '';
        }, 200);
        
        // Add ripple effect
        this.createRippleEffect(sourceElement);
    }
    
    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'concept-ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(102, 126, 234, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width - size) / 2 + 'px';
        ripple.style.top = (rect.height - size) / 2 + 'px';
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    async performSearchWithTransition() {
        // Show enhanced loading state
        this.showEnhancedLoading(true);
        
        try {
            await this.performSearch();
            
            // Add staggered animation to results
            this.animateResultsAppearance();
            
        } finally {
            this.showEnhancedLoading(false);
        }
    }
    
    animateResultsAppearance() {
        const categories = document.querySelectorAll('.relationship-category');
        
        categories.forEach((category, index) => {
            if (category.style.display !== 'none') {
                category.style.opacity = '0';
                category.style.transform = 'translateY(20px)';
                category.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                
                setTimeout(() => {
                    category.style.opacity = '1';
                    category.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
        
        // Animate concept items within each category
        setTimeout(() => {
            this.animateConceptItems();
        }, 200);
    }
    
    animateConceptItems() {
        const conceptItems = document.querySelectorAll('.concept-item');
        
        conceptItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }
    
    scrollToResults() {
        const resultsContainer = this.elements.resultsContainer;
        if (resultsContainer && resultsContainer.style.display !== 'none') {
            resultsContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    displayResults(results) {
        this.currentResults = results;
        
        // Clear previous results
        this.clearResults();
        
        if (!results || this.isEmptyResults(results)) {
            this.showNoResults();
            return;
        }
        
        // Display each category
        this.displayCategory('directlyRelated', results.directlyRelated, 'is_a');
        this.displayCategory('componentRoots', results.componentRoots, 'has_root');
        this.displayCategory('relatedIdeas', results.relatedIdeas, 'is_related_to');
        
        // Show results container
        this.elements.resultsContainer.style.display = 'block';
        this.elements.noResults.hidden = true;
    }
    
    displayCategory(categoryKey, concepts, relationshipType) {
        const category = this.elements[categoryKey];
        
        if (!concepts || concepts.length === 0) {
            category.list.innerHTML = '';
            category.empty.hidden = false;
            category.section.style.display = 'none';
            return;
        }
        
        category.empty.hidden = true;
        category.section.style.display = 'block';
        
        // Sort concepts by strength and relevance
        const sortedConcepts = this.sortConceptsByRelevance(concepts, relationshipType);
        
        // Add category statistics
        this.addCategoryStats(categoryKey, sortedConcepts);
        
        category.list.innerHTML = sortedConcepts.map(concept => 
            this.createConceptItemHTML(concept, relationshipType)
        ).join('');
        
        // Update category header with count
        this.updateCategoryHeader(categoryKey, sortedConcepts.length);
        
        // Add visual enhancements
        this.addCategoryVisualEnhancements(categoryKey, relationshipType);
    }
    
    sortConceptsByRelevance(concepts, relationshipType) {
        return concepts.sort((a, b) => {
            // Primary sort: strength (descending)
            if (a.strength !== b.strength) {
                return (b.strength || 0) - (a.strength || 0);
            }
            
            // Secondary sort: path length (ascending - shorter paths first)
            const aPathLength = a.path ? a.path.length : 1;
            const bPathLength = b.path ? b.path.length : 1;
            if (aPathLength !== bPathLength) {
                return aPathLength - bPathLength;
            }
            
            // Tertiary sort: alphabetical by label
            return a.label.localeCompare(b.label);
        });
    }
    
    updateCategoryHeader(categoryKey, count) {
        const categoryMap = {
            'directlyRelated': 'directly-related-heading',
            'componentRoots': 'component-roots-heading',
            'relatedIdeas': 'related-ideas-heading'
        };
        
        const headingId = categoryMap[categoryKey];
        if (headingId) {
            const heading = document.getElementById(headingId);
            const originalText = heading.textContent.split(' (')[0]; // Remove existing count
            heading.textContent = `${originalText} (${count})`;
        }
    }
    
    addCategoryStats(categoryKey, concepts) {
        const category = this.elements[categoryKey];
        const statsContainer = category.section.querySelector('.relationship-category__stats');
        
        if (statsContainer) {
            statsContainer.remove();
        }
        
        if (!concepts || concepts.length === 0) return;
        
        // Calculate strength distribution
        const strengthCounts = {
            strong: concepts.filter(c => (c.strength || 0) >= 0.8).length,
            medium: concepts.filter(c => (c.strength || 0) >= 0.6 && (c.strength || 0) < 0.8).length,
            weak: concepts.filter(c => (c.strength || 0) >= 0.4 && (c.strength || 0) < 0.6).length,
            minimal: concepts.filter(c => (c.strength || 0) < 0.4).length
        };
        
        const statsHTML = `
            <div class="relationship-category__stats">
                <div class="relationship-category__count">
                    ${concepts.length} connection${concepts.length !== 1 ? 's' : ''}
                </div>
                <div class="relationship-category__strength-legend">
                    ${strengthCounts.strong > 0 ? `
                        <div class="strength-legend-item">
                            <div class="strength-legend-dot strength-legend-dot--strong"></div>
                            <span>${strengthCounts.strong} strong</span>
                        </div>
                    ` : ''}
                    ${strengthCounts.medium > 0 ? `
                        <div class="strength-legend-item">
                            <div class="strength-legend-dot strength-legend-dot--medium"></div>
                            <span>${strengthCounts.medium} medium</span>
                        </div>
                    ` : ''}
                    ${strengthCounts.weak > 0 ? `
                        <div class="strength-legend-item">
                            <div class="strength-legend-dot strength-legend-dot--weak"></div>
                            <span>${strengthCounts.weak} weak</span>
                        </div>
                    ` : ''}
                    ${strengthCounts.minimal > 0 ? `
                        <div class="strength-legend-item">
                            <div class="strength-legend-dot strength-legend-dot--minimal"></div>
                            <span>${strengthCounts.minimal} minimal</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Insert stats after the description
        const description = category.section.querySelector('.relationship-category__description');
        if (description) {
            description.insertAdjacentHTML('afterend', statsHTML);
        }
    }
    
    createConceptItemHTML(concept, relationshipType) {
        const strengthLabel = this.getStrengthLabel(concept.strength || 1);
        const strengthClass = this.getStrengthClass(concept.strength || 1);
        const pathDisplay = this.formatConnectionPath(concept.path);
        const connectionType = this.getConnectionTypeLabel(relationshipType);
        const pronunciationHTML = concept.pronunciation ? 
            `<div class="concept-item__pronunciation">${this.escapeHtml(concept.pronunciation)}</div>` : '';
        
        // Create comprehensive ARIA label
        const ariaLabel = this.createConceptAriaLabel(concept, relationshipType, strengthLabel, pathDisplay);
        
        return `
            <div class="concept-item concept-item--${relationshipType.replace('_', '-')} ${strengthClass}" 
                 data-concept="${this.escapeHtml(concept.label)}"
                 data-concept-id="${this.escapeHtml(concept.id || concept.label)}"
                 data-relationship="${relationshipType}"
                 role="listitem"
                 tabindex="0"
                 aria-label="${this.escapeHtml(ariaLabel)}"
                 aria-describedby="concept-item-instructions">
                
                <div class="concept-item__connection-type" aria-hidden="true">${connectionType}</div>
                
                <div class="concept-item__header">
                    <div class="concept-item__title-group">
                        <div class="concept-item__title" aria-hidden="true">${this.escapeHtml(concept.label)}</div>
                        ${pronunciationHTML ? `<div class="concept-item__pronunciation" aria-hidden="true">${this.escapeHtml(concept.pronunciation)}</div>` : ''}
                    </div>
                    <div class="concept-item__badges">
                        <div class="concept-item__type" aria-hidden="true">${this.escapeHtml(this.formatNodeType(concept.type || 'concept'))}</div>
                        ${concept.domain ? `<div class="concept-item__domain" aria-hidden="true">${this.escapeHtml(concept.domain)}</div>` : ''}
                    </div>
                </div>
                
                <div class="concept-item__definition" aria-hidden="true">
                    ${this.escapeHtml(concept.definition || 'No definition available')}
                </div>
                
                <div class="concept-item__meta" aria-hidden="true">
                    <div class="concept-item__strength">
                        <div class="concept-item__strength-indicator" aria-label="Connection strength: ${strengthLabel}"></div>
                        ${strengthLabel}
                    </div>
                    <div class="concept-item__path" title="${this.escapeHtml(pathDisplay.full)}">
                        ${this.escapeHtml(pathDisplay.display)}
                    </div>
                </div>
            </div>
        `;
    }
    
    createConceptAriaLabel(concept, relationshipType, strengthLabel, pathDisplay) {
        const parts = [];
        
        // Main concept info
        parts.push(`${concept.label}`);
        
        if (concept.pronunciation) {
            parts.push(`pronounced ${concept.pronunciation}`);
        }
        
        // Definition
        if (concept.definition) {
            parts.push(`meaning: ${concept.definition}`);
        }
        
        // Type and domain
        const type = this.formatNodeType(concept.type || 'concept');
        parts.push(`type: ${type}`);
        
        if (concept.domain) {
            parts.push(`domain: ${concept.domain}`);
        }
        
        // Relationship info
        const connectionType = this.getConnectionTypeLabel(relationshipType);
        parts.push(`connection: ${connectionType}`);
        parts.push(`strength: ${strengthLabel}`);
        
        if (pathDisplay.display !== 'Direct') {
            parts.push(`path: ${pathDisplay.full}`);
        }
        
        // Instructions
        parts.push('Press Enter to explore relationships, Space for details, or use arrow keys to navigate');
        
        return parts.join(', ');
    }
    
    getStrengthLabel(strength) {
        if (strength >= 0.8) return 'Strong';
        if (strength >= 0.6) return 'Medium';
        if (strength >= 0.4) return 'Weak';
        return 'Minimal';
    }
    
    getStrengthClass(strength) {
        if (strength >= 0.8) return 'concept-item--strength-strong';
        if (strength >= 0.6) return 'concept-item--strength-medium';
        if (strength >= 0.4) return 'concept-item--strength-weak';
        return 'concept-item--strength-minimal';
    }
    
    getConnectionTypeLabel(relationshipType) {
        const typeLabels = {
            'is_a': 'Direct Translation',
            'has_root': 'Root Component',
            'is_related_to': 'Conceptual Link'
        };
        return typeLabels[relationshipType] || relationshipType;
    }
    
    formatNodeType(type) {
        const typeMap = {
            'fidakune_word': 'Fidakune',
            'fidakune_root': 'Root',
            'english_keyword': 'English',
            'concept': 'Concept'
        };
        return typeMap[type] || type;
    }
    
    formatConnectionPath(path) {
        if (!path || path.length <= 1) {
            return {
                display: 'Direct',
                full: 'Direct connection'
            };
        }
        
        const pathLabels = path.map(nodeId => {
            const node = this.searchEngine?.getNode?.(nodeId);
            return node ? node.label : nodeId;
        });
        
        const fullPath = pathLabels.join(' → ');
        
        // Truncate long paths for display
        if (pathLabels.length > 3) {
            const display = `${pathLabels[0]} → ... → ${pathLabels[pathLabels.length - 1]}`;
            return {
                display: display,
                full: fullPath
            };
        }
        
        return {
            display: fullPath,
            full: fullPath
        };
    }
    
    showSearchSuggestions(query) {
        // This would be implemented to show real-time suggestions
        // For now, we'll keep it simple
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (query.length < 2) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        // Basic suggestion display (would be enhanced with actual search engine integration)
        suggestionsContainer.innerHTML = `
            <div class="search-suggestion" style="color: #6c757d; font-size: 0.9rem; text-align: center;">
                Type to search for "${query}"...
            </div>
        `;
    }
    
    addToHistory(query) {
        if (this.searchHistory[this.searchHistory.length - 1] !== query) {
            this.searchHistory.push(query);
        }
    }
    
    updateBreadcrumbs() {
        if (this.searchHistory.length === 0) {
            this.elements.breadcrumbs.classList.remove('active');
            return;
        }
        
        this.elements.breadcrumbs.classList.add('active');
        
        // Limit breadcrumbs display for better UX
        const maxBreadcrumbs = 5;
        const displayHistory = this.searchHistory.length > maxBreadcrumbs 
            ? ['...', ...this.searchHistory.slice(-maxBreadcrumbs)]
            : this.searchHistory;
        
        const breadcrumbsHTML = displayHistory.map((query, index) => {
            const isLast = index === displayHistory.length - 1;
            const isEllipsis = query === '...';
            
            return `
                <li class="breadcrumbs__item">
                    ${isEllipsis ? 
                        `<span class="breadcrumbs__ellipsis">...</span>
                         <span class="breadcrumbs__separator" aria-hidden="true">→</span>` :
                        isLast ? 
                            `<span class="breadcrumbs__current">${this.escapeHtml(query)}</span>` :
                            `<a href="#" class="breadcrumbs__link" 
                                data-query="${this.escapeHtml(query)}"
                                title="Return to '${this.escapeHtml(query)}'">${this.escapeHtml(query)}</a>
                             <span class="breadcrumbs__separator" aria-hidden="true">→</span>`
                    }
                </li>
            `;
        }).join('');
        
        this.elements.breadcrumbsList.innerHTML = breadcrumbsHTML;
        this.elements.backButton.disabled = this.searchHistory.length <= 1;
        
        // Add enhanced click handlers for breadcrumb links
        this.setupBreadcrumbNavigation();
        
        // Add breadcrumb animation
        this.animateBreadcrumbs();
    }
    
    setupBreadcrumbNavigation() {
        // Remove existing listeners to prevent duplicates
        const existingHandler = this.elements.breadcrumbsList._clickHandler;
        if (existingHandler) {
            this.elements.breadcrumbsList.removeEventListener('click', existingHandler);
        }
        
        const clickHandler = async (e) => {
            if (e.target.classList.contains('breadcrumbs__link')) {
                e.preventDefault();
                const query = e.target.dataset.query;
                
                // Add loading state to clicked breadcrumb
                e.target.classList.add('breadcrumbs__link--loading');
                
                try {
                    await this.navigateToBreadcrumb(query);
                } finally {
                    e.target.classList.remove('breadcrumbs__link--loading');
                }
            }
        };
        
        this.elements.breadcrumbsList.addEventListener('click', clickHandler);
        this.elements.breadcrumbsList._clickHandler = clickHandler;
    }
    
    async navigateToBreadcrumb(query) {
        // Find the position in history and truncate
        const queryIndex = this.searchHistory.lastIndexOf(query);
        if (queryIndex !== -1) {
            this.searchHistory = this.searchHistory.slice(0, queryIndex + 1);
        }
        
        // Perform search with transition
        this.elements.searchInput.value = query;
        this.currentQuery = query;
        await this.performSearchWithTransition();
        
        // Update breadcrumbs
        this.updateBreadcrumbs();
    }
    
    animateBreadcrumbs() {
        const breadcrumbItems = this.elements.breadcrumbsList.querySelectorAll('.breadcrumbs__item');
        
        breadcrumbItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-10px)';
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
    
    goBack() {
        if (this.searchHistory.length > 1) {
            // Add back navigation animation
            this.addBackNavigationEffect();
            
            this.searchHistory.pop(); // Remove current
            const previousQuery = this.searchHistory[this.searchHistory.length - 1];
            this.navigateToBreadcrumb(previousQuery);
        }
    }
    
    addBackNavigationEffect() {
        const backButton = this.elements.backButton;
        backButton.style.transform = 'scale(0.9)';
        backButton.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            backButton.style.transform = '';
        }, 200);
    }
    
    goBack() {
        if (this.searchHistory.length > 1) {
            this.searchHistory.pop(); // Remove current
            const previousQuery = this.searchHistory[this.searchHistory.length - 1];
            this.searchForConcept(previousQuery);
        }
    }
    
    async showConceptDetails(concept, sourceElement = null) {
        // Add to details history
        this.explorationState.detailsHistory.push({
            concept: concept,
            timestamp: Date.now(),
            sourceQuery: this.currentQuery
        });
        
        // Announce details opening
        this.announceConceptDetails(concept.label);
        
        // Create enhanced concept details
        const detailsHTML = await this.createConceptDetailsHTML(concept);
        this.elements.conceptDetailsContent.innerHTML = detailsHTML;
        
        // Show panel with animation
        this.elements.conceptDetails.hidden = false;
        this.elements.conceptDetails.setAttribute('aria-hidden', 'false');
        
        // Trigger reflow for animation
        this.elements.conceptDetails.offsetHeight;
        
        this.elements.conceptDetails.classList.add('active');
        
        // Set up tab trapping for the details panel
        this.setupTabTrap(this.elements.conceptDetails);
        
        // Focus management for accessibility
        const closeButton = this.elements.conceptDetails.querySelector('.concept-details__close');
        if (closeButton) {
            closeButton.focus();
        }
        
        // Add source element highlight
        if (sourceElement) {
            this.highlightSourceElement(sourceElement);
        }
    }
    
    async createConceptDetailsHTML(concept) {
        // Get additional concept information from search engine
        let relatedConcepts = [];
        let conceptStats = null;
        
        try {
            if (this.searchEngine && concept.id) {
                const node = this.searchEngine.getNode(concept.id);
                if (node) {
                    const connections = this.searchEngine.getConnectedEdges(concept.id);
                    relatedConcepts = connections.slice(0, 5); // Top 5 connections
                    conceptStats = {
                        totalConnections: connections.length,
                        strongConnections: connections.filter(c => c.strength >= 0.8).length
                    };
                }
            }
        } catch (error) {
            console.warn('Failed to get additional concept details:', error);
        }
        
        const pronunciationHTML = concept.pronunciation ? 
            `<div class="concept-details__pronunciation">
                <strong>Pronunciation:</strong> ${this.escapeHtml(concept.pronunciation)}
            </div>` : '';
        
        const domainHTML = concept.domain ? 
            `<div class="concept-details__domain">
                <strong>Domain:</strong> ${this.escapeHtml(concept.domain)}
            </div>` : '';
        
        const statsHTML = conceptStats ? 
            `<div class="concept-details__stats">
                <h5>Connection Statistics</h5>
                <p>Total connections: ${conceptStats.totalConnections}</p>
                <p>Strong connections: ${conceptStats.strongConnections}</p>
            </div>` : '';
        
        const relatedHTML = relatedConcepts.length > 0 ? 
            `<div class="concept-details__related">
                <h5>Quick Connections</h5>
                <div class="concept-details__related-list">
                    ${relatedConcepts.map(edge => {
                        const targetNode = this.searchEngine.getNode(edge.target);
                        return targetNode ? `
                            <button class="concept-details__related-item" 
                                    data-concept="${this.escapeHtml(targetNode.label)}"
                                    title="Explore ${targetNode.label}">
                                ${this.escapeHtml(targetNode.label)}
                                <span class="relationship-type">${edge.relationship}</span>
                            </button>
                        ` : '';
                    }).join('')}
                </div>
            </div>` : '';
        
        return `
            <div class="concept-details__main">
                <h4 class="concept-details__title">${this.escapeHtml(concept.label)}</h4>
                ${pronunciationHTML}
                <div class="concept-details__type">
                    <strong>Type:</strong> ${this.escapeHtml(this.formatNodeType(concept.type || 'concept'))}
                </div>
                ${domainHTML}
                <div class="concept-details__definition">
                    <strong>Definition:</strong> ${this.escapeHtml(concept.definition || 'No definition available')}
                </div>
                ${statsHTML}
                ${relatedHTML}
                <div class="concept-details__actions">
                    <button class="concept-details__explore-btn" data-concept="${this.escapeHtml(concept.label)}">
                        Explore Relationships
                    </button>
                </div>
            </div>
        `;
    }
    
    highlightSourceElement(element) {
        element.classList.add('concept-item--highlighted');
        setTimeout(() => {
            element.classList.remove('concept-item--highlighted');
        }, 2000);
    }
    
    hideConceptDetails() {
        this.elements.conceptDetails.classList.remove('active');
        this.elements.conceptDetails.hidden = true;
        this.elements.conceptDetails.setAttribute('aria-hidden', 'true');
        
        // Disable tab trapping
        this.navigationState.tabTrapActive = false;
        
        // Announce closure
        this.announceNavigationChange('close-details');
        
        // Return focus to the element that opened the details
        if (this.navigationState.currentFocus) {
            this.navigationState.currentFocus.focus();
        }
    }
    
    showLoading(show) {
        this.elements.loadingIndicator.setAttribute('aria-hidden', !show);
        if (show) {
            this.elements.loadingIndicator.style.display = 'flex';
        } else {
            this.elements.loadingIndicator.style.display = 'none';
        }
    }
    
    showEnhancedLoading(show) {
        this.showLoading(show);
        
        if (show) {
            // Disable interactions during loading
            this.navigationState.keyboardNavigationEnabled = false;
            document.body.style.cursor = 'wait';
            
            // Add loading overlay to results
            this.addLoadingOverlay();
        } else {
            // Re-enable interactions
            this.navigationState.keyboardNavigationEnabled = true;
            document.body.style.cursor = '';
            
            // Remove loading overlay
            this.removeLoadingOverlay();
        }
    }
    
    addLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'results-loading-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            backdrop-filter: blur(2px);
        `;
        
        const spinner = document.createElement('div');
        spinner.className = 'loading__spinner';
        overlay.appendChild(spinner);
        
        const resultsContainer = this.elements.resultsContainer;
        if (resultsContainer) {
            resultsContainer.style.position = 'relative';
            resultsContainer.appendChild(overlay);
        }
    }
    
    removeLoadingOverlay() {
        const overlay = document.querySelector('.results-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    findNodeByLabel(label) {
        // Helper method to find node by label when ID is not available
        if (!this.searchEngine || !this.searchEngine.nodes) return null;
        
        for (const [nodeId, node] of this.searchEngine.nodes) {
            if (node.label.toLowerCase() === label.toLowerCase()) {
                return node;
            }
        }
        return null;
    }
    
    showConceptContextMenu(event, conceptItem) {
        // Simple context menu implementation
        const menu = document.createElement('div');
        menu.className = 'concept-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            min-width: 150px;
        `;
        
        const conceptLabel = conceptItem.dataset.concept;
        
        menu.innerHTML = `
            <div class="context-menu-item" data-action="explore">
                <span>🔍</span> Explore Relationships
            </div>
            <div class="context-menu-item" data-action="details">
                <span>ℹ️</span> Show Details
            </div>
            <div class="context-menu-item" data-action="copy">
                <span>📋</span> Copy Label
            </div>
        `;
        
        // Add styles for menu items
        const style = document.createElement('style');
        style.textContent = `
            .context-menu-item {
                padding: 8px 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            .context-menu-item:hover {
                background: #f5f5f5;
            }
            .context-menu-item:first-child {
                border-radius: 8px 8px 0 0;
            }
            .context-menu-item:last-child {
                border-radius: 0 0 8px 8px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(menu);
        
        // Handle menu clicks
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            
            switch (action) {
                case 'explore':
                    this.exploreConceptRelationships(conceptLabel, conceptItem);
                    break;
                case 'details':
                    const node = this.findNodeByLabel(conceptLabel);
                    if (node) {
                        this.showConceptDetails(node, conceptItem);
                    }
                    break;
                case 'copy':
                    navigator.clipboard.writeText(conceptLabel);
                    break;
            }
            
            menu.remove();
            style.remove();
        });
        
        // Remove menu when clicking elsewhere
        const removeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                style.remove();
                document.removeEventListener('click', removeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 100);
    }
    
    showError(message) {
        // Simple error display - could be enhanced with a proper error component
        console.error(message);
        alert(message); // Temporary - should be replaced with proper error UI
    }
    
    showNoResults() {
        this.elements.noResults.hidden = false;
        this.elements.resultsContainer.style.display = 'none';
    }
    
    clearResults() {
        Object.values(this.elements).forEach(element => {
            if (element.list) {
                element.list.innerHTML = '';
                element.empty.hidden = true;
            }
        });
    }
    
    isEmptyResults(results) {
        return !results.directlyRelated?.length && 
               !results.componentRoots?.length && 
               !results.relatedIdeas?.length;
    }
    
    handleKeyboardNavigation(e) {
        if (!this.navigationState.keyboardNavigationEnabled) return;
        
        // Check for modifier keys
        const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
        
        // Handle keyboard shortcuts
        switch (e.key) {
            case '/':
                if (e.target !== this.elements.searchInput && !hasModifier) {
                    e.preventDefault();
                    this.focusSearchInput();
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.handleEscapeKey();
                break;
                
            case 'ArrowDown':
            case 'ArrowUp':
                if (e.target === this.elements.searchInput || e.target.classList.contains('concept-item')) {
                    e.preventDefault();
                    this.navigateConceptItems(e.key === 'ArrowDown' ? 'next' : 'prev');
                }
                break;
                
            case 'ArrowLeft':
            case 'ArrowRight':
                if (e.target.classList.contains('concept-item')) {
                    e.preventDefault();
                    this.navigateCategories(e.key === 'ArrowRight' ? 'next' : 'prev');
                }
                break;
                
            case 'Enter':
                if (e.target.classList.contains('concept-item')) {
                    e.preventDefault();
                    this.activateConceptItem(e.target, e.shiftKey);
                } else if (e.target.classList.contains('breadcrumbs__link')) {
                    e.preventDefault();
                    e.target.click();
                }
                break;
                
            case ' ': // Space key
                if (e.target.classList.contains('concept-item')) {
                    e.preventDefault();
                    this.showConceptDetailsFromKeyboard(e.target);
                }
                break;
                
            case 'Tab':
                this.handleTabNavigation(e);
                break;
                
            // Keyboard shortcuts with modifiers
            case 'b':
                if (hasModifier) {
                    e.preventDefault();
                    this.goBack();
                }
                break;
                
            case 'f':
                if (hasModifier) {
                    e.preventDefault();
                    this.focusSearchInput();
                }
                break;
                
            case 'h':
                if (hasModifier) {
                    e.preventDefault();
                    this.showKeyboardHelp();
                }
                break;
                
            case 'd':
                if (hasModifier && this.navigationState.currentFocus) {
                    e.preventDefault();
                    this.showConceptDetailsFromKeyboard(this.navigationState.currentFocus);
                }
                break;
                
            case 'c':
                if (hasModifier && this.navigationState.currentFocus) {
                    e.preventDefault();
                    this.copyConceptLabel(this.navigationState.currentFocus);
                }
                break;
                
            // Number keys for quick category navigation
            case '1':
            case '2':
            case '3':
                if (hasModifier) {
                    e.preventDefault();
                    this.jumpToCategory(parseInt(e.key) - 1);
                }
                break;
                
            // Quick search shortcuts
            case 'n':
                if (hasModifier) {
                    e.preventDefault();
                    this.clearSearchAndFocus();
                }
                break;
                
            case 'r':
                if (hasModifier) {
                    e.preventDefault();
                    this.refreshCurrentSearch();
                }
                break;
        }
    }
    
    focusSearchInput() {
        this.elements.searchInput.focus();
        this.elements.searchInput.select();
        this.updateFocusState(this.elements.searchInput);
    }
    
    handleEscapeKey() {
        // Priority order for escape key handling
        if (this.elements.conceptDetails.classList.contains('active')) {
            this.hideConceptDetails();
        } else if (document.querySelector('.concept-context-menu')) {
            document.querySelector('.concept-context-menu').remove();
        } else if (this.navigationState.currentFocus && this.navigationState.currentFocus !== this.elements.searchInput) {
            this.focusSearchInput();
        } else if (this.searchHistory.length > 1) {
            this.goBack();
        } else {
            // Clear search if no other action
            this.clearSearchAndFocus();
        }
    }
    
    activateConceptItem(item, showDetails = false) {
        const concept = item.dataset.concept;
        if (!concept) return;
        
        if (showDetails) {
            this.showConceptDetailsFromKeyboard(item);
        } else {
            this.exploreConceptRelationships(concept, item);
        }
    }
    
    showConceptDetailsFromKeyboard(item) {
        const conceptLabel = item.dataset.concept;
        const conceptId = item.dataset.conceptId;
        
        if (conceptLabel && this.searchEngine) {
            const node = this.searchEngine.getNode(conceptId) || this.findNodeByLabel(conceptLabel);
            if (node) {
                this.showConceptDetails(node, item);
            }
        }
    }
    
    copyConceptLabel(item) {
        const concept = item.dataset.concept;
        if (concept) {
            navigator.clipboard.writeText(concept).then(() => {
                this.showTemporaryMessage(`Copied "${concept}" to clipboard`);
            }).catch(() => {
                this.showTemporaryMessage('Failed to copy to clipboard');
            });
        }
    }
    
    jumpToCategory(categoryIndex) {
        const categories = ['directly-related', 'component-roots', 'related-ideas'];
        const categoryId = categories[categoryIndex];
        
        if (categoryId) {
            const category = document.getElementById(categoryId);
            const firstItem = category?.querySelector('.concept-item');
            
            if (firstItem) {
                firstItem.focus();
                this.updateFocusState(firstItem);
                firstItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    clearSearchAndFocus() {
        this.elements.searchInput.value = '';
        this.elements.searchInput.focus();
        this.clearResults();
        this.elements.breadcrumbs.classList.remove('active');
        this.searchHistory = [];
        this.updateUIState();
    }
    
    refreshCurrentSearch() {
        if (this.currentQuery) {
            this.performSearchWithTransition();
        }
    }
    
    showTemporaryMessage(message, duration = 3000) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = 'temporary-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
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
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => messageEl.remove(), 300);
        }, duration);
    }
    
    showKeyboardHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'keyboard-help-modal';
        helpModal.innerHTML = `
            <div class="keyboard-help-overlay" tabindex="-1">
                <div class="keyboard-help-content" role="dialog" aria-labelledby="keyboard-help-title">
                    <div class="keyboard-help-header">
                        <h3 id="keyboard-help-title">Keyboard Shortcuts</h3>
                        <button class="keyboard-help-close" aria-label="Close help">&times;</button>
                    </div>
                    <div class="keyboard-help-body">
                        <div class="keyboard-help-section">
                            <h4>Navigation</h4>
                            <div class="keyboard-shortcut">
                                <kbd>/</kbd> <span>Focus search input</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>↑</kbd><kbd>↓</kbd> <span>Navigate concept items</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>←</kbd><kbd>→</kbd> <span>Navigate between categories</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Tab</kbd> <span>Navigate all interactive elements</span>
                            </div>
                        </div>
                        <div class="keyboard-help-section">
                            <h4>Actions</h4>
                            <div class="keyboard-shortcut">
                                <kbd>Enter</kbd> <span>Explore concept relationships</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Shift</kbd>+<kbd>Enter</kbd> <span>Show concept details</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Space</kbd> <span>Show concept details</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Escape</kbd> <span>Close panels or go back</span>
                            </div>
                        </div>
                        <div class="keyboard-help-section">
                            <h4>Shortcuts</h4>
                            <div class="keyboard-shortcut">
                                <kbd>Ctrl</kbd>+<kbd>B</kbd> <span>Go back in history</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Ctrl</kbd>+<kbd>F</kbd> <span>Focus search</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Ctrl</kbd>+<kbd>D</kbd> <span>Show details for focused item</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Ctrl</kbd>+<kbd>C</kbd> <span>Copy focused concept label</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Ctrl</kbd>+<kbd>1-3</kbd> <span>Jump to category</span>
                            </div>
                            <div class="keyboard-shortcut">
                                <kbd>Ctrl</kbd>+<kbd>H</kbd> <span>Show this help</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Focus the modal for accessibility
        const overlay = helpModal.querySelector('.keyboard-help-overlay');
        overlay.focus();
        
        // Set up tab trapping
        this.setupTabTrap(helpModal);
        
        // Close handlers
        const closeBtn = helpModal.querySelector('.keyboard-help-close');
        const closeModal = () => {
            helpModal.remove();
            this.navigationState.tabTrapActive = false;
            // Return focus to previously focused element
            if (this.navigationState.currentFocus) {
                this.navigationState.currentFocus.focus();
            }
        };
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Close when clicking outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }
    
    navigateConceptItems(direction) {
        const conceptItems = Array.from(document.querySelectorAll('.concept-item:not([hidden])'));
        if (conceptItems.length === 0) return;
        
        let currentIndex = conceptItems.findIndex(item => 
            item === this.navigationState.currentFocus
        );
        
        if (currentIndex === -1) {
            // If no current focus, start from first or last item
            currentIndex = direction === 'next' ? -1 : conceptItems.length;
        }
        
        const nextIndex = direction === 'next' 
            ? (currentIndex + 1) % conceptItems.length
            : (currentIndex - 1 + conceptItems.length) % conceptItems.length;
        
        const nextItem = conceptItems[nextIndex];
        if (nextItem) {
            this.focusConceptItem(nextItem);
        }
    }
    
    navigateCategories(direction) {
        const categories = Array.from(document.querySelectorAll('.relationship-category'))
            .filter(cat => cat.style.display !== 'none');
        
        if (categories.length === 0) return;
        
        const currentItem = this.navigationState.currentFocus;
        if (!currentItem || !currentItem.classList.contains('concept-item')) return;
        
        // Find current category
        const currentCategory = currentItem.closest('.relationship-category');
        const currentCategoryIndex = categories.indexOf(currentCategory);
        
        if (currentCategoryIndex === -1) return;
        
        // Calculate next category index
        const nextCategoryIndex = direction === 'next'
            ? (currentCategoryIndex + 1) % categories.length
            : (currentCategoryIndex - 1 + categories.length) % categories.length;
        
        const nextCategory = categories[nextCategoryIndex];
        const firstItemInCategory = nextCategory.querySelector('.concept-item');
        
        if (firstItemInCategory) {
            this.focusConceptItem(firstItemInCategory);
        }
    }
    
    focusConceptItem(item) {
        // Remove previous focus styling
        if (this.navigationState.currentFocus) {
            this.navigationState.currentFocus.classList.remove('keyboard-focused');
        }
        
        // Focus new item
        item.focus();
        item.classList.add('keyboard-focused');
        this.navigationState.currentFocus = item;
        
        // Add to focus history
        this.addToFocusHistory(item);
        
        // Scroll into view with better positioning
        item.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        
        // Get context for screen reader announcement
        const conceptLabel = item.dataset.concept;
        const category = item.closest('.relationship-category');
        const categoryName = this.getCategoryDisplayName(category.id);
        const allItemsInCategory = category.querySelectorAll('.concept-item');
        const position = Array.from(allItemsInCategory).indexOf(item) + 1;
        const total = allItemsInCategory.length;
        
        // Announce to screen readers with context
        this.announceConceptFocus(conceptLabel, categoryName, position, total);
    }
    
    getCategoryDisplayName(categoryId) {
        const categoryNames = {
            'directly-related': 'Directly Related Concepts',
            'component-roots': 'Component Roots',
            'related-ideas': 'Related Ideas'
        };
        return categoryNames[categoryId] || 'Unknown Category';
    }
    
    addToFocusHistory(element) {
        this.navigationState.focusHistory.push(element);
        
        // Limit history size
        if (this.navigationState.focusHistory.length > 20) {
            this.navigationState.focusHistory.shift();
        }
        
        this.navigationState.currentFocusIndex = this.navigationState.focusHistory.length - 1;
    }
    
    updateFocusState(element) {
        this.navigationState.currentFocus = element;
        this.addToFocusHistory(element);
    }
    
    announceToScreenReader(message, targetId = 'sr-live-region', priority = 'polite') {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById(targetId);
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = targetId;
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden';
            
            // Add to appropriate container or body
            const container = targetId.includes('search') ? 
                document.querySelector('.search-form') : 
                targetId.includes('results') ? 
                document.getElementById('results-container') :
                targetId.includes('concept-details') ?
                document.getElementById('concept-details') :
                document.body;
                
            container.appendChild(liveRegion);
        }
        
        // Clear and set new message with slight delay to ensure announcement
        liveRegion.textContent = '';
        setTimeout(() => {
            liveRegion.textContent = message;
        }, 100);
    }
    
    announceSearchResults(results, query) {
        if (!results || this.isEmptyResults(results)) {
            this.announceToScreenReader(
                `No relationships found for "${query}". Try a different search term.`,
                'results-status'
            );
            return;
        }
        
        const totalResults = (results.directlyRelated?.length || 0) + 
                           (results.componentRoots?.length || 0) + 
                           (results.relatedIdeas?.length || 0);
        
        let announcement = `Found ${totalResults} relationship${totalResults !== 1 ? 's' : ''} for "${query}". `;
        
        const categories = [];
        if (results.directlyRelated?.length) {
            categories.push(`${results.directlyRelated.length} directly related concept${results.directlyRelated.length !== 1 ? 's' : ''}`);
        }
        if (results.componentRoots?.length) {
            categories.push(`${results.componentRoots.length} component root${results.componentRoots.length !== 1 ? 's' : ''}`);
        }
        if (results.relatedIdeas?.length) {
            categories.push(`${results.relatedIdeas.length} related idea${results.relatedIdeas.length !== 1 ? 's' : ''}`);
        }
        
        if (categories.length > 0) {
            announcement += 'Including ' + categories.join(', ') + '. ';
        }
        
        announcement += 'Use arrow keys to navigate through results, or Tab to move between sections.';
        
        this.announceToScreenReader(announcement, 'results-status');
    }
    
    announceConceptFocus(conceptLabel, categoryName, position, total) {
        const announcement = `${conceptLabel} in ${categoryName}, item ${position} of ${total}. Press Enter to explore relationships, or Space for details.`;
        this.announceToScreenReader(announcement, 'sr-live-region');
    }
    
    announceConceptExploration(conceptLabel) {
        this.announceToScreenReader(
            `Exploring relationships for "${conceptLabel}". Loading new results.`,
            'results-status'
        );
    }
    
    announceConceptDetails(conceptLabel) {
        this.announceToScreenReader(
            `Showing detailed information for "${conceptLabel}". Details panel opened.`,
            'concept-details-status'
        );
    }
    
    announceNavigationChange(action, context = '') {
        const messages = {
            'back': `Navigated back in exploration history. ${context}`,
            'breadcrumb': `Jumped to previous search: ${context}`,
            'category': `Moved to ${context} category`,
            'close-details': 'Concept details panel closed',
            'clear-search': 'Search cleared, ready for new input'
        };
        
        const message = messages[action] || `Navigation: ${action}`;
        this.announceToScreenReader(message, 'sr-live-region');
    }
    
    handleTabNavigation(e) {
        // Handle tab trapping if active
        if (this.navigationState.tabTrapActive) {
            this.handleTabTrap(e);
            return;
        }
        
        // Custom tab navigation logic for better UX
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(e.target);
        
        if (currentIndex === -1) return;
        
        // Add visual focus indicators
        this.updateFocusIndicators(e.target);
        
        // Update navigation state
        this.updateFocusState(e.target);
        
        // Special handling for concept items
        if (e.target.classList.contains('concept-item')) {
            e.target.classList.add('keyboard-focused');
        }
    }
    
    setupTabTrap(container) {
        this.navigationState.tabTrapActive = true;
        
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
        
        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
    }
    
    handleTabTrap(e) {
        // This method handles tab navigation within trapped contexts
        const container = e.target.closest('.keyboard-help-modal, .concept-details');
        if (!container) return;
        
        const focusableElements = Array.from(container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null && !el.disabled);
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    getFocusableElements() {
        return Array.from(document.querySelectorAll(
            'input, button, [tabindex]:not([tabindex="-1"]), .concept-item'
        )).filter(el => {
            return el.offsetParent !== null && !el.disabled;
        });
    }
    
    updateFocusIndicators(element) {
        // Remove previous focus indicators
        document.querySelectorAll('.keyboard-focus').forEach(el => {
            el.classList.remove('keyboard-focus');
        });
        
        // Add focus indicator to current element
        element.classList.add('keyboard-focus');
    }
    
    updateUIState() {
        // Update UI based on current state
        this.elements.backButton.disabled = this.searchHistory.length <= 1;
    }
    
    addCategoryVisualEnhancements(categoryKey, relationshipType) {
        const category = this.elements[categoryKey];
        
        // Add relationship-specific styling
        category.section.classList.add(`relationship-category--${relationshipType.replace('_', '-')}`);
        
        // Add hover effects for concept items
        const conceptItems = category.list.querySelectorAll('.concept-item');
        conceptItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
            });
        });
    }
    
    addResponsiveCardLayout() {
        // Adjust card layout based on screen size
        const updateLayout = () => {
            const conceptLists = document.querySelectorAll('.concept-list');
            const screenWidth = window.innerWidth;
            
            conceptLists.forEach(list => {
                if (screenWidth < 768) {
                    list.style.gridTemplateColumns = '1fr';
                } else if (screenWidth < 1024) {
                    list.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
                } else {
                    list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
                }
            });
        };
        
        updateLayout();
        window.addEventListener('resize', updateLayout);
    }
    
    initializeKeyboardNavigation() {
        // Add keyboard navigation class to body
        document.body.classList.add('keyboard-navigation-ready');
        
        // Set up focus management
        document.addEventListener('focusin', (e) => {
            this.updateFocusState(e.target);
        });
        
        // Detect keyboard vs mouse usage
        let isUsingKeyboard = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isUsingKeyboard = true;
                document.body.classList.add('keyboard-navigation-active');
            }
        });
        
        document.addEventListener('mousedown', () => {
            isUsingKeyboard = false;
            document.body.classList.remove('keyboard-navigation-active');
        });
        
        // Set up initial focus state
        this.navigationState.currentFocus = this.elements.searchInput;
        
        // Add keyboard shortcut indicators to help text
        this.addKeyboardShortcutHints();
        
        // Initialize screen reader compatibility
        this.initializeScreenReaderSupport();
        
        console.log('Keyboard navigation initialized');
    }
    
    initializeScreenReaderSupport() {
        // Add application role and description
        document.body.setAttribute('role', 'application');
        document.body.setAttribute('aria-label', 'Fidakune Conceptual Explorer - Interactive vocabulary relationship browser');
        
        // Create main live region if it doesn't exist
        if (!document.getElementById('sr-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden';
            document.body.appendChild(liveRegion);
        }
        
        // Initialize visual accessibility features
        this.initializeVisualAccessibility();
        
        // Add initial screen reader welcome message
        setTimeout(() => {
            this.announceToScreenReader(
                'Welcome to the Fidakune Conceptual Explorer. Use the search field to explore word relationships. Press Ctrl+H for keyboard shortcuts.'
            );
        }, 1000);
        
        // Set up heading hierarchy validation
        this.validateHeadingHierarchy();
        
        console.log('Screen reader support initialized');
    }
    
    initializeVisualAccessibility() {
        // Add alternative text to visual elements
        this.addAlternativeTextDescriptions();
        
        // Set up high contrast mode detection
        this.setupHighContrastMode();
        
        // Initialize text scaling support
        this.initializeTextScaling();
        
        // Add visual accessibility controls
        this.addVisualAccessibilityControls();
        
        console.log('Visual accessibility features initialized');
    }
    
    addAlternativeTextDescriptions() {
        // Add alt text to category icons
        const categoryIcons = document.querySelectorAll('.relationship-category__icon');
        const altTexts = {
            '🎯': 'Target icon representing direct relationships',
            '🔗': 'Link icon representing component roots',
            '💭': 'Thought bubble icon representing related ideas'
        };
        
        categoryIcons.forEach(icon => {
            const iconText = icon.textContent.trim();
            if (altTexts[iconText]) {
                icon.setAttribute('data-alt-text', altTexts[iconText]);
                icon.setAttribute('aria-label', altTexts[iconText]);
            }
        });
        
        // Add descriptions to strength indicators
        document.addEventListener('DOMContentLoaded', () => {
            this.updateStrengthIndicatorDescriptions();
        });
    }
    
    updateStrengthIndicatorDescriptions() {
        const strengthIndicators = document.querySelectorAll('.concept-item__strength-indicator');
        strengthIndicators.forEach(indicator => {
            const strengthText = indicator.parentElement.textContent.trim();
            indicator.setAttribute('aria-label', `Connection strength: ${strengthText}`);
        });
    }
    
    setupHighContrastMode() {
        // Detect high contrast preference
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        const updateHighContrastMode = (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast-mode');
                this.announceToScreenReader('High contrast mode activated');
            } else {
                document.body.classList.remove('high-contrast-mode');
            }
        };
        
        // Initial check
        updateHighContrastMode(prefersHighContrast);
        
        // Listen for changes
        prefersHighContrast.addListener(updateHighContrastMode);
    }
    
    initializeTextScaling() {
        // Monitor for text scaling changes
        const checkTextScaling = () => {
            const baseFontSize = 16;
            const currentFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const scaleFactor = currentFontSize / baseFontSize;
            
            if (scaleFactor > 1.5) {
                document.body.classList.add('large-text-mode');
                this.adjustLayoutForLargeText();
            } else {
                document.body.classList.remove('large-text-mode');
            }
        };
        
        // Check on resize and initial load
        window.addEventListener('resize', checkTextScaling);
        checkTextScaling();
    }
    
    adjustLayoutForLargeText() {
        // Adjust layout for large text scaling
        const conceptLists = document.querySelectorAll('.concept-list');
        conceptLists.forEach(list => {
            list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        });
        
        const conceptItems = document.querySelectorAll('.concept-item');
        conceptItems.forEach(item => {
            item.style.padding = '2rem';
        });
    }
    
    addVisualAccessibilityControls() {
        // Create accessibility control panel
        const controlPanel = document.createElement('div');
        controlPanel.className = 'accessibility-controls';
        controlPanel.innerHTML = `
            <button class="accessibility-control" id="toggle-high-contrast" aria-label="Toggle high contrast mode">
                <span aria-hidden="true">🌓</span>
                <span class="control-label">High Contrast</span>
            </button>
            <button class="accessibility-control" id="increase-text-size" aria-label="Increase text size">
                <span aria-hidden="true">🔍+</span>
                <span class="control-label">Larger Text</span>
            </button>
            <button class="accessibility-control" id="decrease-text-size" aria-label="Decrease text size">
                <span aria-hidden="true">🔍-</span>
                <span class="control-label">Smaller Text</span>
            </button>
        `;
        
        controlPanel.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            background: var(--primary-bg);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            display: none;
        `;
        
        document.body.appendChild(controlPanel);
        
        // Add toggle button for accessibility controls
        const toggleButton = document.createElement('button');
        toggleButton.className = 'accessibility-toggle';
        toggleButton.innerHTML = '♿';
        toggleButton.setAttribute('aria-label', 'Toggle accessibility controls');
        toggleButton.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-blue);
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
            transition: all 0.3s;
            z-index: 1001;
        `;
        
        document.body.appendChild(toggleButton);
        
        // Set up control functionality
        this.setupAccessibilityControls(controlPanel, toggleButton);
    }
    
    setupAccessibilityControls(controlPanel, toggleButton) {
        let controlsVisible = false;
        let currentTextScale = 1;
        
        toggleButton.addEventListener('click', () => {
            controlsVisible = !controlsVisible;
            controlPanel.style.display = controlsVisible ? 'block' : 'none';
            toggleButton.style.right = controlsVisible ? '200px' : '20px';
            
            this.announceToScreenReader(
                controlsVisible ? 'Accessibility controls opened' : 'Accessibility controls closed'
            );
        });
        
        // High contrast toggle
        document.getElementById('toggle-high-contrast').addEventListener('click', () => {
            document.body.classList.toggle('force-high-contrast');
            const isActive = document.body.classList.contains('force-high-contrast');
            this.announceToScreenReader(
                isActive ? 'High contrast mode enabled' : 'High contrast mode disabled'
            );
        });
        
        // Text size controls
        document.getElementById('increase-text-size').addEventListener('click', () => {
            if (currentTextScale < 2) {
                currentTextScale += 0.1;
                document.documentElement.style.fontSize = `${16 * currentTextScale}px`;
                this.announceToScreenReader(`Text size increased to ${Math.round(currentTextScale * 100)}%`);
            }
        });
        
        document.getElementById('decrease-text-size').addEventListener('click', () => {
            if (currentTextScale > 0.8) {
                currentTextScale -= 0.1;
                document.documentElement.style.fontSize = `${16 * currentTextScale}px`;
                this.announceToScreenReader(`Text size decreased to ${Math.round(currentTextScale * 100)}%`);
            }
        });
    }
    
    validateHeadingHierarchy() {
        // Ensure proper heading hierarchy for screen readers
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        
        headings.forEach((heading, index) => {
            const currentLevel = parseInt(heading.tagName.charAt(1));
            
            if (index === 0 && currentLevel !== 1) {
                console.warn('First heading should be h1');
            }
            
            if (currentLevel > previousLevel + 1) {
                console.warn(`Heading hierarchy skip detected: ${heading.tagName} after h${previousLevel}`);
            }
            
            previousLevel = currentLevel;
        });
    }
    
    addKeyboardShortcutHints() {
        // Add subtle keyboard shortcut hints to the interface
        const searchInput = this.elements.searchInput;
        if (searchInput) {
            searchInput.setAttribute('title', 'Press / to focus (Ctrl+F also works)');
        }
        
        const backButton = this.elements.backButton;
        if (backButton) {
            backButton.setAttribute('title', 'Go back (Ctrl+B)');
        }
        
        // Add help button if it doesn't exist
        this.addKeyboardHelpButton();
    }
    
    addKeyboardHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.className = 'keyboard-help-trigger';
        helpButton.innerHTML = '⌨️';
        helpButton.setAttribute('title', 'Keyboard shortcuts (Ctrl+H)');
        helpButton.setAttribute('aria-label', 'Show keyboard shortcuts');
        
        helpButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #667eea;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.3s;
            z-index: 100;
        `;
        
        helpButton.addEventListener('click', () => {
            this.showKeyboardHelp();
        });
        
        helpButton.addEventListener('mouseenter', () => {
            helpButton.style.transform = 'scale(1.1)';
            helpButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        });
        
        helpButton.addEventListener('mouseleave', () => {
            helpButton.style.transform = 'scale(1)';
            helpButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        });
        
        document.body.appendChild(helpButton);
    }
    
    initializePerformanceOptimizations() {
        // Set up lazy loading for results
        this.lazyLoadingConfig = {
            enabled: true,
            batchSize: 10,
            loadThreshold: 0.8 // Load more when 80% scrolled
        };
        
        // Set up result virtualization for large datasets
        this.virtualizationConfig = {
            enabled: true,
            itemHeight: 200, // Approximate height of concept item
            bufferSize: 5 // Number of items to render outside viewport
        };
        
        // Set up performance monitoring UI
        this.setupPerformanceMonitoringUI();
        
        // Set up memory management
        this.setupMemoryManagement();
        
        // Set up request debouncing
        this.setupRequestDebouncing();
        
        console.log('Performance optimizations initialized');
    }
    
    setupPerformanceMonitoringUI() {
        // Add performance indicator to the interface
        const perfIndicator = document.createElement('div');
        perfIndicator.id = 'performance-indicator';
        perfIndicator.className = 'performance-indicator';
        perfIndicator.innerHTML = `
            <div class="perf-indicator-content">
                <span class="perf-label">Performance</span>
                <span class="perf-value" id="perf-search-time">-</span>
                <span class="perf-unit">ms</span>
            </div>
        `;
        
        perfIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: monospace;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        `;
        
        document.body.appendChild(perfIndicator);
        
        // Show performance indicator during searches
        this.performanceIndicator = perfIndicator;
    }
    
    setupMemoryManagement() {
        // Clean up old results periodically
        setInterval(() => {
            this.cleanupOldResults();
        }, 60000); // Every minute
        
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (memInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
                    console.warn('High memory usage detected, cleaning up...');
                    this.performMemoryCleanup();
                }
            }, 30000); // Every 30 seconds
        }
    }
    
    setupRequestDebouncing() {
        // Debounce search requests to avoid excessive API calls
        this.searchDebounceTime = 300; // ms
        this.searchDebounceTimer = null;
        
        // Override the original search input handler
        const originalHandler = this.elements.searchInput.oninput;
        this.elements.searchInput.oninput = null;
        
        this.elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = setTimeout(() => {
                this.showSearchSuggestions(e.target.value);
            }, this.searchDebounceTime);
        });
    }
    
    cleanupOldResults() {
        // Remove old result elements that are no longer visible
        const oldResults = document.querySelectorAll('.concept-item[data-timestamp]');
        const cutoffTime = Date.now() - (5 * 60 * 1000); // 5 minutes ago
        
        oldResults.forEach(item => {
            const timestamp = parseInt(item.dataset.timestamp);
            if (timestamp < cutoffTime && !this.isElementVisible(item)) {
                item.remove();
            }
        });
    }
    
    performMemoryCleanup() {
        // Clear search engine caches
        if (this.searchEngine) {
            this.searchEngine.optimizeMemoryUsage();
        }
        
        // Clear old search history
        if (this.searchHistory.length > 20) {
            this.searchHistory = this.searchHistory.slice(-10);
        }
        
        // Clear old exploration state
        if (this.explorationState.detailsHistory.length > 10) {
            this.explorationState.detailsHistory = this.explorationState.detailsHistory.slice(-5);
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
    
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    async displayResultsWithLazyLoading(results) {
        if (!this.lazyLoadingConfig.enabled) {
            return this.displayResults(results);
        }
        
        // Process each category with lazy loading
        const categories = ['directlyRelated', 'componentRoots', 'relatedIdeas'];
        const relationshipTypes = ['is_a', 'has_root', 'is_related_to'];
        
        for (let i = 0; i < categories.length; i++) {
            const categoryKey = categories[i];
            const relationshipType = relationshipTypes[i];
            const concepts = results[categoryKey];
            
            if (concepts && concepts.length > 0) {
                const lazyResults = await this.searchEngine.loadResultsLazily(
                    concepts, 
                    this.lazyLoadingConfig.batchSize
                );
                
                if (lazyResults.initialResults) {
                    // Display initial batch
                    this.displayCategory(categoryKey, lazyResults.initialResults, relationshipType);
                    
                    // Set up lazy loading for remaining results
                    if (lazyResults.lazyLoader.hasMore()) {
                        this.setupLazyLoadingForCategory(categoryKey, lazyResults.lazyLoader, relationshipType);
                    }
                } else {
                    // Fallback to regular display
                    this.displayCategory(categoryKey, concepts, relationshipType);
                }
            }
        }
    }
    
    setupLazyLoadingForCategory(categoryKey, lazyLoader, relationshipType) {
        const category = this.elements[categoryKey];
        const loadMoreButton = document.createElement('button');
        loadMoreButton.className = 'load-more-button';
        loadMoreButton.textContent = `Load More (${lazyLoader.hasMore() ? 'more available' : 'all loaded'})`;
        loadMoreButton.setAttribute('aria-label', `Load more results for ${categoryKey}`);
        
        loadMoreButton.addEventListener('click', () => {
            const nextBatch = lazyLoader.loadNext();
            const newItems = nextBatch.map(concept => 
                this.createConceptItemHTML(concept, relationshipType)
            ).join('');
            
            // Insert new items before the load more button
            loadMoreButton.insertAdjacentHTML('beforebegin', newItems);
            
            // Update button state
            if (!lazyLoader.hasMore()) {
                loadMoreButton.textContent = 'All results loaded';
                loadMoreButton.disabled = true;
                setTimeout(() => loadMoreButton.remove(), 2000);
            }
            
            // Announce to screen readers
            this.announceToScreenReader(`Loaded ${nextBatch.length} more results`);
        });
        
        category.list.appendChild(loadMoreButton);
    }
    
    updatePerformanceIndicator(searchTime, resultCount, fromCache = false) {
        if (!this.performanceIndicator) return;
        
        const perfValue = this.performanceIndicator.querySelector('#perf-search-time');
        if (perfValue) {
            perfValue.textContent = searchTime.toFixed(1);
            
            // Color code based on performance
            let color = '#4ade80'; // Green for fast
            if (searchTime > 100) color = '#fbbf24'; // Yellow for medium
            if (searchTime > 500) color = '#ef4444'; // Red for slow
            
            perfValue.style.color = color;
            
            // Add cache indicator
            const cacheIndicator = fromCache ? ' (cached)' : '';
            perfValue.textContent += cacheIndicator;
        }
        
        // Show indicator briefly
        this.performanceIndicator.style.opacity = '1';
        setTimeout(() => {
            this.performanceIndicator.style.opacity = '0';
        }, 3000);
    }
    
    async runPerformanceBenchmark() {
        if (!this.searchEngine) return;
        
        console.log('Running performance benchmark...');
        const benchmark = await this.searchEngine.createPerformanceBenchmark();
        
        // Display benchmark results
        console.table(benchmark.results);
        console.log('Benchmark Statistics:', benchmark.statistics);
        
        // Show benchmark results to user
        this.showTemporaryMessage(
            `Benchmark completed: Avg ${benchmark.statistics.averageSearchTime.toFixed(1)}ms, ` +
            `Cache speedup: ${benchmark.statistics.cacheSpeedup.toFixed(1)}x`,
            5000
        );
        
        return benchmark;
    }
    
    initializeMobileOptimizations() {
        // Detect mobile device
        this.isMobile = this.detectMobileDevice();
        
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
            
            // Set up touch interactions
            this.setupTouchInteractions();
            
            // Set up swipe gestures
            this.setupSwipeGestures();
            
            // Set up mobile category navigation
            this.setupMobileCategoryNavigation();
            
            // Set up pull-to-refresh
            this.setupPullToRefresh();
            
            // Set up mobile floating action button
            this.setupMobileFloatingActionButton();
            
            // Optimize for mobile performance
            this.optimizeForMobile();
            
            console.log('Mobile optimizations initialized');
        }
    }
    
    detectMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768) ||
               ('ontouchstart' in window);
    }
    
    setupTouchInteractions() {
        // Add touch-friendly event listeners
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
        
        // Prevent zoom on double tap for concept items
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.concept-item')) {
                e.preventDefault();
            }
        });
    }
    
    setupSwipeGestures() {
        const resultsContainer = this.elements.resultsContainer;
        if (!resultsContainer) return;
        
        resultsContainer.classList.add('mobile-swipe-container');
        
        // Add swipe indicators
        const leftIndicator = document.createElement('div');
        leftIndicator.className = 'mobile-swipe-indicator mobile-swipe-indicator--left';
        leftIndicator.innerHTML = '←';
        
        const rightIndicator = document.createElement('div');
        rightIndicator.className = 'mobile-swipe-indicator mobile-swipe-indicator--right';
        rightIndicator.innerHTML = '→';
        
        resultsContainer.appendChild(leftIndicator);
        resultsContainer.appendChild(rightIndicator);
    }
    
    setupMobileCategoryNavigation() {
        // Create mobile category navigation
        const categoryNav = document.createElement('div');
        categoryNav.className = 'mobile-category-nav';
        categoryNav.innerHTML = `
            <div class="mobile-category-tabs">
                <button class="mobile-category-tab active" data-category="directly-related">
                    <span>🎯</span> Direct
                </button>
                <button class="mobile-category-tab" data-category="component-roots">
                    <span>🔗</span> Roots
                </button>
                <button class="mobile-category-tab" data-category="related-ideas">
                    <span>💭</span> Ideas
                </button>
            </div>
        `;
        
        // Insert before results container
        const resultsContainer = this.elements.resultsContainer;
        resultsContainer.parentNode.insertBefore(categoryNav, resultsContainer);
        
        // Add click handlers
        categoryNav.addEventListener('click', (e) => {
            const tab = e.target.closest('.mobile-category-tab');
            if (tab) {
                this.switchMobileCategory(tab.dataset.category);
            }
        });
    }
    
    setupPullToRefresh() {
        const mainContent = document.querySelector('.main');
        if (!mainContent) return;
        
        mainContent.classList.add('mobile-pull-refresh');
        
        // Create pull-to-refresh indicator
        const indicator = document.createElement('div');
        indicator.className = 'mobile-pull-refresh__indicator';
        indicator.innerHTML = '<div class="mobile-pull-refresh__spinner"></div>';
        
        mainContent.appendChild(indicator);
        
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        
        mainContent.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });
        
        mainContent.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            currentY = e.touches[0].clientY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 0 && pullDistance < 150) {
                e.preventDefault();
                indicator.style.top = `${Math.min(pullDistance - 60, 20)}px`;
                
                if (pullDistance > this.mobileState.pullRefreshThreshold) {
                    indicator.classList.add('visible');
                }
            }
        }, { passive: false });
        
        mainContent.addEventListener('touchend', () => {
            if (isPulling && currentY - startY > this.mobileState.pullRefreshThreshold) {
                this.triggerPullRefresh();
            }
            
            isPulling = false;
            indicator.classList.remove('visible');
            indicator.style.top = '-60px';
        }, { passive: true });
    }
    
    setupMobileFloatingActionButton() {
        const fab = document.createElement('button');
        fab.className = 'mobile-fab';
        fab.innerHTML = '🔍';
        fab.setAttribute('aria-label', 'Focus search input');
        
        fab.addEventListener('click', () => {
            this.elements.searchInput.focus();
            this.elements.searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        
        document.body.appendChild(fab);
        
        // Show/hide FAB based on scroll position
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 200) {
                fab.classList.add('visible');
            } else {
                fab.classList.remove('visible');
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }
    
    optimizeForMobile() {
        // Reduce animation complexity on mobile
        document.body.classList.add('mobile-optimized');
        
        // Optimize touch scrolling
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Prevent zoom on input focus
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
        }
        
        // Optimize concept item rendering for mobile
        this.optimizeConceptItemsForMobile();
    }
    
    optimizeConceptItemsForMobile() {
        // Use intersection observer for lazy loading on mobile
        if ('IntersectionObserver' in window) {
            this.mobileIntersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        item.classList.add('mobile-visible');
                        this.mobileIntersectionObserver.unobserve(item);
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    }
    
    handleTouchStart(e) {
        this.mobileState.touchStartX = e.touches[0].clientX;
        this.mobileState.touchStartY = e.touches[0].clientY;
        this.mobileState.isSwipeGesture = false;
    }
    
    handleTouchMove(e) {
        if (!this.mobileState.touchStartX || !this.mobileState.touchStartY) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        const deltaX = touchX - this.mobileState.touchStartX;
        const deltaY = touchY - this.mobileState.touchStartY;
        
        // Detect horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            this.mobileState.isSwipeGesture = true;
            
            // Show swipe indicators
            const indicators = document.querySelectorAll('.mobile-swipe-indicator');
            indicators.forEach(indicator => {
                indicator.classList.add('visible');
            });
        }
    }
    
    handleTouchEnd(e) {
        if (!this.mobileState.isSwipeGesture) return;
        
        this.mobileState.touchEndX = e.changedTouches[0].clientX;
        this.mobileState.touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = this.mobileState.touchEndX - this.mobileState.touchStartX;
        
        // Hide swipe indicators
        const indicators = document.querySelectorAll('.mobile-swipe-indicator');
        indicators.forEach(indicator => {
            indicator.classList.remove('visible');
        });
        
        // Handle swipe gestures
        if (Math.abs(deltaX) > 100) {
            if (deltaX > 0) {
                // Swipe right - previous category
                this.swipeToPreviousCategory();
            } else {
                // Swipe left - next category
                this.swipeToNextCategory();
            }
        }
        
        // Reset touch state
        this.mobileState.touchStartX = 0;
        this.mobileState.touchStartY = 0;
        this.mobileState.isSwipeGesture = false;
    }
    
    swipeToPreviousCategory() {
        const currentIndex = this.mobileState.currentCategory;
        const newIndex = currentIndex > 0 ? currentIndex - 1 : this.mobileState.categories.length - 1;
        
        this.switchMobileCategory(this.mobileState.categories[newIndex]);
        this.announceToScreenReader(`Switched to ${this.getCategoryDisplayName(this.mobileState.categories[newIndex])}`);
    }
    
    swipeToNextCategory() {
        const currentIndex = this.mobileState.currentCategory;
        const newIndex = currentIndex < this.mobileState.categories.length - 1 ? currentIndex + 1 : 0;
        
        this.switchMobileCategory(this.mobileState.categories[newIndex]);
        this.announceToScreenReader(`Switched to ${this.getCategoryDisplayName(this.mobileState.categories[newIndex])}`);
    }
    
    switchMobileCategory(categoryId) {
        // Update active tab
        const tabs = document.querySelectorAll('.mobile-category-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === categoryId);
        });
        
        // Show/hide categories
        const categories = document.querySelectorAll('.relationship-category');
        categories.forEach(category => {
            if (category.id === categoryId) {
                category.style.display = 'block';
                category.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                category.style.display = 'none';
            }
        });
        
        // Update current category index
        this.mobileState.currentCategory = this.mobileState.categories.indexOf(categoryId);
    }
    
    async triggerPullRefresh() {
        if (this.mobileState.isPullRefreshing) return;
        
        this.mobileState.isPullRefreshing = true;
        
        try {
            // Show refresh indicator
            const indicator = document.querySelector('.mobile-pull-refresh__indicator');
            indicator.classList.add('visible');
            
            // Refresh current search
            if (this.currentQuery) {
                await this.performSearch();
                this.showTemporaryMessage('Results refreshed', 2000);
            }
            
        } finally {
            this.mobileState.isPullRefreshing = false;
            
            // Hide refresh indicator
            setTimeout(() => {
                const indicator = document.querySelector('.mobile-pull-refresh__indicator');
                indicator.classList.remove('visible');
            }, 1000);
        }
    }
    
    createMobileLoadingSkeleton() {
        const skeleton = document.createElement('div');
        skeleton.className = 'mobile-concept-skeleton mobile-loading-skeleton';
        return skeleton;
    }
    
    showMobileLoadingSkeletons(count = 3) {
        const categories = document.querySelectorAll('.concept-list');
        
        categories.forEach(list => {
            // Clear existing content
            list.innerHTML = '';
            
            // Add skeleton items
            for (let i = 0; i < count; i++) {
                list.appendChild(this.createMobileLoadingSkeleton());
            }
        });
    }
    
    transferToLexiconSearch() {
        const query = this.elements.searchInput.value.trim();
        if (!query) {
            this.showTemporaryMessage('Enter a search term first', 2000);
            return;
        }
        
        if (window.FidakuneSharedSearch) {
            window.FidakuneSharedSearch.transferQuery(query, 'lexicon-search');
        } else {
            // Fallback direct navigation
            const url = new URL('lexicon-search.html', window.location.origin);
            url.searchParams.set('q', query);
            url.searchParams.set('from', 'conceptual-search');
            window.location.href = url.toString();
        }
    }
    
    updateTransferButton(query) {
        const transferButton = document.getElementById('transfer-to-lexicon');
        const transferContainer = document.getElementById('search-transfer');
        
        if (!transferButton || !transferContainer) return;
        
        if (query.trim()) {
            transferContainer.style.display = 'block';
            transferButton.querySelector('.search-transfer__text').textContent = 
                `Search "${query}" in Traditional Lexicon`;
        } else {
            transferContainer.style.display = 'none';
        }
    }
    
    setupIntegratedErrorHandling() {
        // Override default error handling to use unified system
        this.showError = (message, type = 'error') => {
            if (window.FidakuneErrorHandler) {
                window.FidakuneErrorHandler.showError(message, type);
            } else {
                // Fallback to original error handling
                console.error(message);
                alert(message);
            }
        };
    }
    
    setupSharedAccessibility() {
        // Use shared accessibility utilities
        if (window.FidakuneAccessibility) {
            this.announceToScreenReader = (message, targetId, priority) => {
                window.FidakuneAccessibility.announceToScreenReader(message, priority);
            };
        }
    }
    
    addSearchHistoryIntegration() {
        // Add search history dropdown
        const searchContainer = this.elements.searchInput.parentElement;
        const historyDropdown = document.createElement('div');
        historyDropdown.className = 'search-history-dropdown';
        historyDropdown.id = 'search-history-dropdown';
        historyDropdown.style.display = 'none';
        
        searchContainer.appendChild(historyDropdown);
        
        // Show history on input focus
        this.elements.searchInput.addEventListener('focus', () => {
            this.showSearchHistory();
        });
        
        // Hide history on blur (with delay for clicks)
        this.elements.searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideSearchHistory();
            }, 200);
        });
    }
    
    showSearchHistory() {
        if (!window.FidakuneSharedSearch) return;
        
        const history = window.FidakuneSharedSearch.getHistory();
        const dropdown = document.getElementById('search-history-dropdown');
        
        if (!dropdown || history.length === 0) return;
        
        // Filter recent searches from both apps
        const recentSearches = history
            .filter(entry => Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
            .slice(0, 5);
        
        if (recentSearches.length === 0) return;
        
        dropdown.innerHTML = `
            <div class="search-history-header">Recent Searches</div>
            ${recentSearches.map(entry => `
                <div class="search-history-item" data-query="${this.escapeHtml(entry.query)}">
                    <div class="search-history-query">${this.escapeHtml(entry.query)}</div>
                    <div class="search-history-meta">
                        <span class="search-history-app">${entry.app === 'conceptual-search' ? 'Conceptual' : 'Traditional'}</span>
                        <span class="search-history-time">${this.formatTimeAgo(entry.timestamp)}</span>
                    </div>
                </div>
            `).join('')}
        `;
        
        dropdown.style.display = 'block';
        
        // Add click handlers
        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.search-history-item');
            if (item) {
                const query = item.dataset.query;
                this.elements.searchInput.value = query;
                this.performSearch();
                this.hideSearchHistory();
            }
        });
    }
    
    hideSearchHistory() {
        const dropdown = document.getElementById('search-history-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.conceptualExplorer = new ConceptualExplorer();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConceptualExplorer;
}