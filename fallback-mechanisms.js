/**
 * Fallback Mechanisms for Fidakune Conceptual Explorer
 * Provides graceful degradation and error recovery capabilities
 */

class FallbackMechanisms {
    constructor() {
        this.fallbackData = this.initializeFallbackData();
        this.recoveryStrategies = this.initializeRecoveryStrategies();
        this.healthChecks = this.initializeHealthChecks();
        this.retryConfig = this.initializeRetryConfig();
        
        this.init();
    }
    
    init() {
        this.setupGlobalErrorHandling();
        this.setupNetworkFailureHandling();
        this.setupDataCorruptionHandling();
        this.setupPerformanceFallbacks();
        this.setupAccessibilityFallbacks();
        
        console.log('Fallback mechanisms initialized');
    }
    
    initializeFallbackData() {
        return {
            // Minimal vocabulary for emergency use
            emergencyVocabulary: {
                metadata: {
                    version: "emergency-1.0",
                    created: new Date().toISOString(),
                    curated_by: "Emergency Fallback System",
                    node_count: 10,
                    edge_count: 15
                },
                nodes: [
                    {
                        id: "fidakune_aqua",
                        label: "aqua",
                        type: "fidakune_word",
                        definition: "water",
                        domain: "Nature",
                        pronunciation: "/ˈa.kwa/"
                    },
                    {
                        id: "fidakune_sole",
                        label: "sole",
                        type: "fidakune_word",
                        definition: "sun",
                        domain: "Nature",
                        pronunciation: "/ˈso.le/"
                    },
                    {
                        id: "fidakune_ami",
                        label: "ami",
                        type: "fidakune_word",
                        definition: "friend",
                        domain: "Society",
                        pronunciation: "/ˈa.mi/"
                    },
                    {
                        id: "fidakune_kore",
                        label: "kore",
                        type: "fidakune_root",
                        definition: "heart",
                        domain: "Body",
                        pronunciation: "/ˈko.ɾe/"
                    },
                    {
                        id: "fidakune_pet",
                        label: "pet",
                        type: "fidakune_root",
                        definition: "stone",
                        domain: "Nature",
                        pronunciation: "/pet/"
                    },
                    {
                        id: "fidakune_kore_pet",
                        label: "kore-pet",
                        type: "fidakune_word",
                        definition: "grief",
                        domain: "Emotion",
                        pronunciation: "/ˈko.ɾe.pet/"
                    },
                    {
                        id: "en_water",
                        label: "water",
                        type: "english_keyword",
                        definition: "clear liquid essential for life",
                        domain: "Nature"
                    },
                    {
                        id: "en_sun",
                        label: "sun",
                        type: "english_keyword",
                        definition: "star at the center of our solar system",
                        domain: "Nature"
                    },
                    {
                        id: "en_friend",
                        label: "friend",
                        type: "english_keyword",
                        definition: "person with whom one has a bond of mutual affection",
                        domain: "Society"
                    },
                    {
                        id: "en_grief",
                        label: "grief",
                        type: "english_keyword",
                        definition: "deep sorrow, especially caused by loss",
                        domain: "Emotion"
                    }
                ],
                edges: [
                    {
                        source: "fidakune_aqua",
                        target: "en_water",
                        relationship: "is_a",
                        strength: 1.0,
                        description: "aqua means water"
                    },
                    {
                        source: "fidakune_sole",
                        target: "en_sun",
                        relationship: "is_a",
                        strength: 1.0,
                        description: "sole means sun"
                    },
                    {
                        source: "fidakune_ami",
                        target: "en_friend",
                        relationship: "is_a",
                        strength: 1.0,
                        description: "ami means friend"
                    },
                    {
                        source: "fidakune_kore_pet",
                        target: "en_grief",
                        relationship: "is_a",
                        strength: 0.9,
                        description: "kore-pet means grief"
                    },
                    {
                        source: "fidakune_kore_pet",
                        target: "fidakune_kore",
                        relationship: "has_root",
                        strength: 1.0,
                        description: "kore-pet contains root kore"
                    },
                    {
                        source: "fidakune_kore_pet",
                        target: "fidakune_pet",
                        relationship: "has_root",
                        strength: 1.0,
                        description: "kore-pet contains root pet"
                    }
                ]
            },
            
            // Fallback UI messages
            errorMessages: {
                networkError: "Unable to connect to the server. Using offline vocabulary.",
                dataCorruption: "Data appears corrupted. Using emergency vocabulary.",
                performanceIssue: "System running slowly. Switching to simplified mode.",
                accessibilityFallback: "Enhanced accessibility mode activated.",
                generalError: "Something went wrong. Using backup systems."
            },
            
            // Simplified UI for fallback mode
            simplifiedInterface: {
                enabled: false,
                reducedAnimations: true,
                basicStyling: true,
                limitedFeatures: true
            }
        };
    }
    
    initializeRecoveryStrategies() {
        return {
            networkFailure: {
                maxRetries: 3,
                retryDelay: 1000,
                backoffMultiplier: 2,
                fallbackToCache: true,
                fallbackToEmergencyData: true
            },
            
            dataCorruption: {
                validateOnLoad: true,
                fallbackToCache: true,
                fallbackToEmergencyData: true,
                reportCorruption: true
            },
            
            performanceIssue: {
                thresholds: {
                    slow: 2000,
                    verySlow: 5000,
                    critical: 10000
                },
                actions: {
                    slow: 'reduce_animations',
                    verySlow: 'simplified_interface',
                    critical: 'emergency_mode'
                }
            },
            
            memoryIssue: {
                threshold: 50 * 1024 * 1024, // 50MB
                actions: ['clear_cache', 'reduce_data', 'simplified_interface']
            },
            
            accessibilityIssue: {
                fallbackToBasicHTML: true,
                enhanceKeyboardNavigation: true,
                increaseContrast: true,
                simplifyInterface: true
            }
        };
    }
    
    initializeHealthChecks() {
        return {
            network: {
                interval: 30000, // 30 seconds
                timeout: 5000,
                endpoint: 'lexical_graph.json',
                lastCheck: null,
                status: 'unknown'
            },
            
            performance: {
                interval: 10000, // 10 seconds
                metrics: ['memory', 'timing', 'rendering'],
                thresholds: {
                    memory: 100 * 1024 * 1024, // 100MB
                    timing: 2000, // 2 seconds
                    rendering: 16 // 16ms per frame
                },
                lastCheck: null,
                status: 'unknown'
            },
            
            data: {
                interval: 60000, // 1 minute
                checks: ['integrity', 'availability', 'freshness'],
                lastCheck: null,
                status: 'unknown'
            },
            
            accessibility: {
                interval: 120000, // 2 minutes
                checks: ['keyboard_navigation', 'screen_reader', 'contrast'],
                lastCheck: null,
                status: 'unknown'
            }
        };
    }
    
    initializeRetryConfig() {
        return {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            backoffMultiplier: 2,
            jitter: true
        };
            }

    
    setupGlobalErrorHandling() {
        // Enhanced global error handler with fallback mechanisms
        window.addEventListener('error', (event) => {
            this.handleError(event.error, {
                type: 'javascript',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'promise',
                promise: event.promise
            });
        });
        
        // Override console.error to catch application errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.handleError(new Error(args.join(' ')), { type: 'console' });
            originalConsoleError.apply(console, args);
        };
        
        console.log('Global error handling with fallbacks configured');
    }
    
    setupNetworkFailureHandling() {
        // Monitor network connectivity
        window.addEventListener('online', () => {
            this.handleNetworkRestore();
        });
        
        window.addEventListener('offline', () => {
            this.handleNetworkFailure();
        });
        
        // Override fetch to add retry logic
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            return this.fetchWithRetry(originalFetch, url, options);
        };
        
        console.log('Network failure handling configured');
    }
    
    async fetchWithRetry(originalFetch, url, options, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await originalFetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
            
        } catch (error) {
            if (attempt < this.recoveryStrategies.networkFailure.maxRetries) {
                const delay = this.calculateRetryDelay(attempt);
                console.warn(`Network request failed (attempt ${attempt}), retrying in ${delay}ms:`, error);
                
                await this.delay(delay);
                return this.fetchWithRetry(originalFetch, url, options, attempt + 1);
            }
            
            // All retries failed, use fallback
            console.error('Network request failed after all retries:', error);
            return this.handleNetworkFallback(url, error);
        }
    }
    
    calculateRetryDelay(attempt) {
        const baseDelay = this.retryConfig.baseDelay;
        const backoffDelay = baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        const cappedDelay = Math.min(backoffDelay, this.retryConfig.maxDelay);
        
        // Add jitter to prevent thundering herd
        if (this.retryConfig.jitter) {
            const jitter = Math.random() * 0.1 * cappedDelay;
            return cappedDelay + jitter;
        }
        
        return cappedDelay;
    }
    
    async handleNetworkFallback(url, error) {
        // Try to load from cache first
        if (this.recoveryStrategies.networkFailure.fallbackToCache) {
            const cachedData = this.loadFromCache(url);
            if (cachedData) {
                console.log('Using cached data for:', url);
                return this.createMockResponse(cachedData);
            }
        }
        
        // Fall back to emergency data
        if (this.recoveryStrategies.networkFailure.fallbackToEmergencyData && 
            url.includes('lexical_graph.json')) {
            console.log('Using emergency vocabulary data');
            return this.createMockResponse(this.fallbackData.emergencyVocabulary);
        }
        
        throw error;
    }
    
    createMockResponse(data) {
        return {
            ok: true,
            status: 200,
            statusText: 'OK (Fallback)',
            json: async () => data,
            text: async () => JSON.stringify(data),
            headers: new Map([['content-type', 'application/json']])
        };
    }
    
    setupDataCorruptionHandling() {
        // Monitor data integrity
        const originalJSON = JSON.parse;
        JSON.parse = (text, reviver) => {
            try {
                const data = originalJSON.call(JSON, text, reviver);
                
                // Validate graph data if it looks like our vocabulary data
                if (data && data.nodes && data.edges) {
                    this.validateGraphData(data);
                }
                
                return data;
            } catch (error) {
                console.error('Data corruption detected:', error);
                return this.handleDataCorruption(text, error);
            }
        };
        
        console.log('Data corruption handling configured');
    }
    
    validateGraphData(data) {
        // Basic structure validation
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
            throw new Error('Invalid graph structure: nodes and edges must be arrays');
        }
        
        // Check for required fields
        data.nodes.forEach((node, index) => {
            if (!node.id || !node.label || !node.type) {
                throw new Error(`Invalid node at index ${index}: missing required fields`);
            }
        });
        
        data.edges.forEach((edge, index) => {
            if (!edge.source || !edge.target || !edge.relationship) {
                throw new Error(`Invalid edge at index ${index}: missing required fields`);
            }
        });
        
        // Check for reasonable data sizes
        if (data.nodes.length > 50000 || data.edges.length > 100000) {
            throw new Error('Graph data exceeds reasonable size limits');
        }
        
        return true;
    }
    
    handleDataCorruption(text, error) {
        // Try to recover partial data
        try {
            const partialData = this.attemptPartialRecovery(text);
            if (partialData) {
                console.warn('Partial data recovery successful');
                return partialData;
            }
        } catch (recoveryError) {
            console.error('Partial recovery failed:', recoveryError);
        }
        
        // Fall back to cached data
        const cachedData = this.loadFromCache('lexical_graph.json');
        if (cachedData) {
            console.warn('Using cached data due to corruption');
            return cachedData;
        }
        
        // Last resort: emergency vocabulary
        console.warn('Using emergency vocabulary due to data corruption');
        return this.fallbackData.emergencyVocabulary;
    }
    
    attemptPartialRecovery(text) {
        // Try to extract valid JSON from corrupted text
        const jsonMatches = text.match(/\{[\s\S]*\}/);
        if (jsonMatches) {
            try {
                return JSON.parse(jsonMatches[0]);
            } catch (e) {
                // Try to fix common JSON issues
                let fixedText = jsonMatches[0]
                    .replace(/,\s*}/g, '}')  // Remove trailing commas
                    .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
                    .replace(/'/g, '"');     // Replace single quotes with double quotes
                
                return JSON.parse(fixedText);
            }
        }
        
        return null;
    }
    
    setupPerformanceFallbacks() {
        // Monitor performance and activate fallbacks when needed
        this.performanceMonitor = {
            measurements: [],
            isSlowMode: false,
            isEmergencyMode: false
        };
        
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.checkPerformance();
        });
        
        // Monitor ongoing performance
        setInterval(() => {
            this.checkPerformance();
        }, 10000); // Check every 10 seconds
        
        console.log('Performance fallbacks configured');
    }
    
    checkPerformance() {
        const now = performance.now();
        const memory = this.getMemoryUsage();
        const timing = this.getTimingMetrics();
        
        const measurement = {
            timestamp: now,
            memory: memory,
            timing: timing
        };
        
        this.performanceMonitor.measurements.push(measurement);
        
        // Keep only last 10 measurements
        if (this.performanceMonitor.measurements.length > 10) {
            this.performanceMonitor.measurements.shift();
        }
        
        // Check if performance fallbacks are needed
        this.evaluatePerformanceFallbacks(measurement);
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    getTimingMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                responseTime: navigation.responseEnd - navigation.responseStart
            };
        }
        return null;
    }
    
    evaluatePerformanceFallbacks(measurement) {
        const thresholds = this.recoveryStrategies.performanceIssue.thresholds;
        const actions = this.recoveryStrategies.performanceIssue.actions;
        
        // Check memory usage
        if (measurement.memory && measurement.memory.used > this.recoveryStrategies.memoryIssue.threshold) {
            this.activateMemoryFallback();
        }
        
        // Check timing metrics
        if (measurement.timing) {
            const loadTime = measurement.timing.loadTime;
            
            if (loadTime > thresholds.critical && !this.performanceMonitor.isEmergencyMode) {
                this.activateEmergencyMode();
            } else if (loadTime > thresholds.verySlow && !this.performanceMonitor.isSlowMode) {
                this.activateSlowMode();
            } else if (loadTime > thresholds.slow) {
                this.reduceAnimations();
            }
        }
    }
    
    activateMemoryFallback() {
        console.warn('Memory usage high, activating memory fallback');
        
        // Clear caches
        this.clearCaches();
        
        // Reduce data in memory
        this.reduceDataFootprint();
        
        // Activate simplified interface
        this.activateSimplifiedInterface();
        
        this.showFallbackNotification('Memory optimization activated');
    }
    
    activateSlowMode() {
        console.warn('Performance slow, activating slow mode');
        this.performanceMonitor.isSlowMode = true;
        
        this.reduceAnimations();
        this.activateSimplifiedInterface();
        
        this.showFallbackNotification('Performance mode activated');
    }
    
    activateEmergencyMode() {
        console.error('Critical performance issues, activating emergency mode');
        this.performanceMonitor.isEmergencyMode = true;
        
        this.reduceAnimations();
        this.activateSimplifiedInterface();
        this.switchToEmergencyData();
        
        this.showFallbackNotification('Emergency mode activated');
    }
    
    reduceAnimations() {
        // Add CSS class to reduce animations
        document.body.classList.add('reduced-motion');
        
        // Override CSS animations
        const style = document.createElement('style');
        style.textContent = `
            .reduced-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    activateSimplifiedInterface() {
        if (this.fallbackData.simplifiedInterface.enabled) return;
        
        this.fallbackData.simplifiedInterface.enabled = true;
        document.body.classList.add('simplified-interface');
        
        // Hide non-essential UI elements
        const nonEssential = document.querySelectorAll('.non-essential, .enhancement, .decoration');
        nonEssential.forEach(element => {
            element.style.display = 'none';
        });
        
        // Simplify complex components
        this.simplifyComponents();
    }
    
    simplifyComponents() {
        // Simplify search results display
        const conceptItems = document.querySelectorAll('.concept-item');
        conceptItems.forEach(item => {
            item.classList.add('simplified');
        });
        
        // Remove complex visual effects
        const visualEffects = document.querySelectorAll('.visual-effect, .animation, .transition');
        visualEffects.forEach(effect => {
            effect.style.display = 'none';
        });
    }
    
    switchToEmergencyData() {
        // Force use of emergency vocabulary
        if (window.conceptualExplorer && window.conceptualExplorer.searchEngine) {
            window.conceptualExplorer.searchEngine.loadGraph(this.fallbackData.emergencyVocabulary);
        }
    }
    
    setupAccessibilityFallbacks() {
        // Monitor for accessibility issues and provide fallbacks
        this.accessibilityMonitor = {
            keyboardNavigationFailed: false,
            screenReaderIssues: false,
            contrastIssues: false
        };
        
        // Detect keyboard navigation issues
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.checkKeyboardNavigation(e);
            }
        });
        
        // Detect screen reader issues
        this.checkScreenReaderCompatibility();
        
        // Monitor contrast issues
        this.checkContrastIssues();
        
        console.log('Accessibility fallbacks configured');
    }
    
    checkKeyboardNavigation(event) {
        // Check if Tab navigation is working properly
        const focusableElements = document.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) {
            this.activateKeyboardFallback();
        }
    }
    
    checkScreenReaderCompatibility() {
        // Check for proper ARIA attributes and semantic markup
        const missingAria = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        const missingHeadings = document.querySelectorAll('section:not(:has(h1, h2, h3, h4, h5, h6))');
        
        if (missingAria.length > 0 || missingHeadings.length > 0) {
            this.activateScreenReaderFallback();
        }
    }
    
    checkContrastIssues() {
        // Basic contrast checking (simplified)
        const computedStyle = getComputedStyle(document.body);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;
        
        // If we can't determine contrast, activate high contrast mode
        if (!backgroundColor || !color || backgroundColor === color) {
            this.activateHighContrastFallback();
        }
    }
    
    activateKeyboardFallback() {
        console.warn('Keyboard navigation issues detected, activating fallback');
        this.accessibilityMonitor.keyboardNavigationFailed = true;
        
        // Add tabindex to important elements
        const importantElements = document.querySelectorAll('.concept-item, .search-form__button, .propose-relationship-btn');
        importantElements.forEach((element, index) => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
        
        // Add keyboard event handlers
        this.addKeyboardHandlers();
        
        this.showFallbackNotification('Enhanced keyboard navigation activated');
    }
    
    addKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target;
                if (target.classList.contains('concept-item') || target.hasAttribute('role')) {
                    e.preventDefault();
                    target.click();
                }
            }
        });
    }
    
    activateScreenReaderFallback() {
        console.warn('Screen reader issues detected, activating fallback');
        this.accessibilityMonitor.screenReaderIssues = true;
        
        // Add missing ARIA labels
        const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        unlabeledButtons.forEach(button => {
            const text = button.textContent.trim() || button.innerHTML.replace(/<[^>]*>/g, '').trim();
            if (text) {
                button.setAttribute('aria-label', text);
            }
        });
        
        // Add live regions for dynamic content
        this.addLiveRegions();
        
        this.showFallbackNotification('Enhanced screen reader support activated');
    }
    
    addLiveRegions() {
        // Add live region for search results
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer && !resultsContainer.hasAttribute('aria-live')) {
            resultsContainer.setAttribute('aria-live', 'polite');
            resultsContainer.setAttribute('aria-atomic', 'false');
        }
        
        // Add live region for status messages
        let statusRegion = document.getElementById('status-live-region');
        if (!statusRegion) {
            statusRegion = document.createElement('div');
            statusRegion.id = 'status-live-region';
            statusRegion.setAttribute('aria-live', 'assertive');
            statusRegion.setAttribute('aria-atomic', 'true');
            statusRegion.className = 'visually-hidden';
            document.body.appendChild(statusRegion);
        }
    }
    
    activateHighContrastFallback() {
        console.warn('Contrast issues detected, activating high contrast mode');
        this.accessibilityMonitor.contrastIssues = true;
        
        document.body.classList.add('high-contrast-fallback');
        
        // Add high contrast CSS
        const style = document.createElement('style');
        style.textContent = `
            .high-contrast-fallback {
                background: #000000 !important;
                color: #ffffff !important;
            }
            .high-contrast-fallback * {
                background: inherit !important;
                color: inherit !important;
                border-color: #ffffff !important;
            }
            .high-contrast-fallback button,
            .high-contrast-fallback input,
            .high-contrast-fallback select,
            .high-contrast-fallback textarea {
                background: #ffffff !important;
                color: #000000 !important;
                border: 2px solid #ffffff !important;
            }
        `;
        document.head.appendChild(style);
        
        this.showFallbackNotification('High contrast mode activated');
    }
    
    // Utility methods
    
    handleError(error, context = {}) {
        console.error('Fallback mechanism handling error:', error, context);
        
        // Determine appropriate fallback strategy
        if (context.type === 'network' || error.message.includes('fetch')) {
            this.handleNetworkFailure();
        } else if (context.type === 'data' || error.message.includes('JSON')) {
            this.handleDataCorruption(null, error);
        } else if (error.message.includes('performance') || error.message.includes('memory')) {
            this.activateMemoryFallback();
        } else {
            this.activateGeneralFallback();
        }
    }
    
    handleNetworkFailure() {
        console.warn('Network failure detected, activating offline mode');
        
        // Show offline indicator
        this.showOfflineIndicator();
        
        // Switch to cached or emergency data
        this.switchToOfflineMode();
        
        this.showFallbackNotification(this.fallbackData.errorMessages.networkError);
    }
    
    handleNetworkRestore() {
        console.log('Network restored, attempting to sync');
        
        // Hide offline indicator
        this.hideOfflineIndicator();
        
        // Attempt to reload fresh data
        this.attemptDataSync();
        
        this.showFallbackNotification('Connection restored');
    }
    
    showOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #ff6b6b;
                    color: white;
                    padding: 8px;
                    text-align: center;
                    z-index: 1000;
                    font-weight: 500;
                ">
                    📡 Offline Mode - Using cached data
                </div>
            `;
            document.body.appendChild(indicator);
        }
    }
    
    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    switchToOfflineMode() {
        // Use cached data or emergency vocabulary
        const cachedData = this.loadFromCache('lexical_graph.json');
        const dataToUse = cachedData || this.fallbackData.emergencyVocabulary;
        
        if (window.conceptualExplorer && window.conceptualExplorer.searchEngine) {
            window.conceptualExplorer.searchEngine.loadGraph(dataToUse);
        }
    }
    
    attemptDataSync() {
        // Try to reload fresh data when network is restored
        if (window.conceptualExplorer && window.conceptualExplorer.searchEngine) {
            window.conceptualExplorer.searchEngine.loadGraph()
                .then(() => {
                    console.log('Data sync successful');
                })
                .catch((error) => {
                    console.warn('Data sync failed:', error);
                });
        }
    }
    
    activateGeneralFallback() {
        console.warn('Activating general fallback mode');
        
        // Activate multiple fallback strategies
        this.activateSimplifiedInterface();
        this.reduceAnimations();
        this.switchToEmergencyData();
        
        this.showFallbackNotification(this.fallbackData.errorMessages.generalError);
    }
    
    loadFromCache(key) {
        try {
            const cached = localStorage.getItem(`fidakune-cache-${key}`);
            if (cached) {
                const data = JSON.parse(cached);
                // Check if cache is still valid (24 hours)
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    return data.content;
                }
            }
        } catch (error) {
            console.warn('Cache loading failed:', error);
        }
        return null;
    }
    
    saveToCache(key, data) {
        try {
            const cacheEntry = {
                content: data,
                timestamp: Date.now()
            };
            localStorage.setItem(`fidakune-cache-${key}`, JSON.stringify(cacheEntry));
        } catch (error) {
            console.warn('Cache saving failed:', error);
        }
    }
    
    clearCaches() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('fidakune-cache-')) {
                    localStorage.removeItem(key);
                }
            });
            console.log('Caches cleared');
        } catch (error) {
            console.warn('Cache clearing failed:', error);
        }
    }
    
    reduceDataFootprint() {
        // Remove non-essential data from memory
        if (window.conceptualExplorer) {
            // Clear search history
            if (window.conceptualExplorer.searchHistory) {
                window.conceptualExplorer.searchHistory = window.conceptualExplorer.searchHistory.slice(-5);
            }
            
            // Clear cached results
            if (window.conceptualExplorer.searchEngine && window.conceptualExplorer.searchEngine.searchCache) {
                window.conceptualExplorer.searchEngine.searchCache.clear();
            }
        }
    }
    
    showFallbackNotification(message) {
        // Show user-friendly notification about fallback activation
        const notification = document.createElement('div');
        notification.className = 'fallback-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                max-width: 300px;
                font-size: 14px;
                animation: slideInRight 0.3s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>🛡️</span>
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; margin-left: auto;">×</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Public API for health checks and status
    
    getHealthStatus() {
        return {
            network: navigator.onLine,
            performance: {
                slowMode: this.performanceMonitor.isSlowMode,
                emergencyMode: this.performanceMonitor.isEmergencyMode
            },
            accessibility: {
                keyboardFallback: this.accessibilityMonitor.keyboardNavigationFailed,
                screenReaderFallback: this.accessibilityMonitor.screenReaderIssues,
                highContrastFallback: this.accessibilityMonitor.contrastIssues
            },
            interface: {
                simplified: this.fallbackData.simplifiedInterface.enabled
            },
            timestamp: new Date().toISOString()
        };
    }
    
    getFallbackData() {
        return this.fallbackData.emergencyVocabulary;
    }
    
    resetFallbacks() {
        // Reset all fallback states
        this.performanceMonitor.isSlowMode = false;
        this.performanceMonitor.isEmergencyMode = false;
        this.accessibilityMonitor.keyboardNavigationFailed = false;
        this.accessibilityMonitor.screenReaderIssues = false;
        this.accessibilityMonitor.contrastIssues = false;
        this.fallbackData.simplifiedInterface.enabled = false;
        
        // Remove fallback CSS classes
        document.body.classList.remove('reduced-motion', 'simplified-interface', 'high-contrast-fallback');
        
        // Remove fallback indicators
        this.hideOfflineIndicator();
        
        console.log('Fallback mechanisms reset');
    }
    
    // Manual fallback activation methods
    
    activateOfflineMode() {
        this.handleNetworkFailure();
    }
    
    activateAccessibilityMode() {
        this.activateKeyboardFallback();
        this.activateScreenReaderFallback();
        this.activateHighContrastFallback();
    }
    
    activatePerformanceMode() {
        this.activateSlowMode();
    }
}

// Initialize fallback mechanisms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.FidakuneFallbackMechanisms = new FallbackMechanisms();
    
    // Log initialization
    console.log('Fallback mechanisms ready');
    
    // Expose health check globally
    window.checkFallbackHealth = () => {
        return window.FidakuneFallbackMechanisms.getHealthStatus();
    };
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FallbackMechanisms;
}