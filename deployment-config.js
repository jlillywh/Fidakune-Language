/**
 * Deployment Configuration for Fidakune Conceptual Explorer
 * Handles environment detection, security settings, and deployment-specific configurations
 */

class DeploymentConfig {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.loadConfiguration();
        this.securitySettings = this.initializeSecuritySettings();
        
        this.init();
    }
    
    init() {
        this.setupEnvironmentSpecificSettings();
        this.initializeSecurityMeasures();
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        
        console.log(`Deployment Config initialized for ${this.environment} environment`);
    }
    
    detectEnvironment() {
        // Detect if running on GitHub Pages
        if (window.location.hostname.includes('github.io') || 
            window.location.hostname.includes('pages.github.com')) {
            return 'production';
        }
        
        // Detect localhost development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '') {
            return 'development';
        }
        
        // Detect staging or other environments
        if (window.location.hostname.includes('staging') ||
            window.location.hostname.includes('test')) {
            return 'staging';
        }
        
        // Default to production for unknown environments
        return 'production';
    }
    
    loadConfiguration() {
        const baseConfig = {
            appName: 'Fidakune Conceptual Explorer',
            version: '1.0.0',
            repository: 'jlillywh/Fidakune-Language',
            dataSource: 'lexical_graph.json',
            maxRetries: 3,
            retryDelay: 1000,
            cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
            performanceThreshold: 2000, // 2 seconds
            errorReportingEnabled: true
        };
        
        const environmentConfigs = {
            development: {
                ...baseConfig,
                debug: true,
                errorReportingEnabled: false,
                performanceThreshold: 5000,
                cacheTimeout: 5 * 60 * 1000, // 5 minutes
                dataSource: 'lexical_graph.json'
            },
            staging: {
                ...baseConfig,
                debug: true,
                errorReportingEnabled: true,
                performanceThreshold: 3000,
                cacheTimeout: 60 * 60 * 1000, // 1 hour
                dataSource: 'lexical_graph.json'
            },
            production: {
                ...baseConfig,
                debug: false,
                errorReportingEnabled: true,
                performanceThreshold: 2000,
                cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
                dataSource: 'lexical_graph.json'
            }
        };
        
        return environmentConfigs[this.environment] || environmentConfigs.production;
    }
    
    initializeSecuritySettings() {
        return {
            // Content Security Policy settings
            csp: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.github.com", "https://raw.githubusercontent.com"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            },
            
            // Input sanitization settings
            sanitization: {
                maxInputLength: 1000,
                allowedCharacters: /^[a-zA-Z0-9\s\-_.,!?'"()]+$/,
                blockedPatterns: [
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                    /javascript:/gi,
                    /on\w+\s*=/gi,
                    /data:text\/html/gi
                ]
            },
            
            // Rate limiting settings
            rateLimiting: {
                maxRequestsPerMinute: 60,
                maxSearchesPerMinute: 30,
                maxProposalsPerHour: 10
            },
            
            // Data validation settings
            validation: {
                maxFileSize: 10 * 1024 * 1024, // 10MB
                allowedFileTypes: ['json'],
                maxGraphNodes: 10000,
                maxGraphEdges: 50000
            }
        };
    }
    
    setupEnvironmentSpecificSettings() {
        // Set global debug flag
        window.FIDAKUNE_DEBUG = this.config.debug;
        
        // Configure console logging based on environment
        if (!this.config.debug) {
            // Disable console.log in production
            console.log = () => {};
            console.info = () => {};
            console.warn = () => {};
        }
        
        // Set up performance monitoring
        if (this.config.performanceThreshold) {
            this.setupPerformanceMonitoring();
        }
        
        // Configure error reporting
        if (this.config.errorReportingEnabled) {
            this.setupErrorReporting();
        }
    }
    
    initializeSecurityMeasures() {
        // Set up Content Security Policy (if supported)
        this.setupContentSecurityPolicy();
        
        // Initialize input sanitization
        this.setupInputSanitization();
        
        // Set up rate limiting
        this.setupRateLimiting();
        
        // Initialize data validation
        this.setupDataValidation();
        
        // Set up secure headers
        this.setupSecureHeaders();
    }
    
    setupContentSecurityPolicy() {
        // Note: CSP headers should ideally be set by the server
        // This is a client-side fallback for additional security
        const cspString = Object.entries(this.securitySettings.csp)
            .map(([directive, sources]) => `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sources.join(' ')}`)
            .join('; ');
        
        // Add meta tag for CSP (fallback)
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!existingCSP) {
            const cspMeta = document.createElement('meta');
            cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
            cspMeta.setAttribute('content', cspString);
            document.head.appendChild(cspMeta);
        }
        
        console.log('Content Security Policy configured');
    }
    
    setupInputSanitization() {
        // Create global input sanitizer
        window.FidakuneSanitizer = {
            sanitizeInput: (input) => {
                if (typeof input !== 'string') return '';
                
                // Check length
                if (input.length > this.securitySettings.sanitization.maxInputLength) {
                    throw new Error('Input exceeds maximum allowed length');
                }
                
                // Check for blocked patterns
                for (const pattern of this.securitySettings.sanitization.blockedPatterns) {
                    if (pattern.test(input)) {
                        throw new Error('Input contains potentially dangerous content');
                    }
                }
                
                // Basic HTML entity encoding
                return input
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
            },
            
            validateInput: (input) => {
                if (typeof input !== 'string') return false;
                
                // Check allowed characters
                return this.securitySettings.sanitization.allowedCharacters.test(input);
            }
        };
        
        // Override form inputs to use sanitization
        this.setupFormSanitization();
        
        console.log('Input sanitization configured');
    }
    
    setupFormSanitization() {
        // Add event listeners to sanitize form inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="text"], input[type="search"], textarea')) {
                try {
                    const sanitized = window.FidakuneSanitizer.sanitizeInput(e.target.value);
                    if (sanitized !== e.target.value) {
                        e.target.value = sanitized;
                        this.showSecurityWarning('Input was sanitized for security');
                    }
                } catch (error) {
                    e.target.value = '';
                    this.showSecurityWarning(error.message);
                }
            }
        });
    }
    
    setupRateLimiting() {
        // Simple client-side rate limiting
        const rateLimiter = {
            requests: new Map(),
            searches: new Map(),
            proposals: new Map(),
            
            checkLimit: (type, identifier, limit, timeWindow) => {
                const now = Date.now();
                const key = `${type}_${identifier}`;
                
                if (!this[type].has(key)) {
                    this[type].set(key, []);
                }
                
                const timestamps = this[type].get(key);
                
                // Remove old timestamps
                const cutoff = now - timeWindow;
                const validTimestamps = timestamps.filter(ts => ts > cutoff);
                
                if (validTimestamps.length >= limit) {
                    return false;
                }
                
                validTimestamps.push(now);
                this[type].set(key, validTimestamps);
                return true;
            }
        };
        
        window.FidakuneRateLimiter = {
            checkRequest: (identifier = 'default') => {
                return rateLimiter.checkLimit('requests', identifier, 
                    this.securitySettings.rateLimiting.maxRequestsPerMinute, 60000);
            },
            
            checkSearch: (identifier = 'default') => {
                return rateLimiter.checkLimit('searches', identifier,
                    this.securitySettings.rateLimiting.maxSearchesPerMinute, 60000);
            },
            
            checkProposal: (identifier = 'default') => {
                return rateLimiter.checkLimit('proposals', identifier,
                    this.securitySettings.rateLimiting.maxProposalsPerHour, 3600000);
            }
        };
        
        console.log('Rate limiting configured');
    }
    
    setupDataValidation() {
        window.FidakuneDataValidator = {
            validateGraphData: (data) => {
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid graph data format');
                }
                
                if (!data.nodes || !Array.isArray(data.nodes)) {
                    throw new Error('Graph data must contain nodes array');
                }
                
                if (!data.edges || !Array.isArray(data.edges)) {
                    throw new Error('Graph data must contain edges array');
                }
                
                if (data.nodes.length > this.securitySettings.validation.maxGraphNodes) {
                    throw new Error('Graph exceeds maximum node limit');
                }
                
                if (data.edges.length > this.securitySettings.validation.maxGraphEdges) {
                    throw new Error('Graph exceeds maximum edge limit');
                }
                
                // Validate node structure
                data.nodes.forEach((node, index) => {
                    if (!node.id || !node.label || !node.type) {
                        throw new Error(`Invalid node structure at index ${index}`);
                    }
                });
                
                // Validate edge structure
                data.edges.forEach((edge, index) => {
                    if (!edge.source || !edge.target || !edge.relationship) {
                        throw new Error(`Invalid edge structure at index ${index}`);
                    }
                });
                
                return true;
            },
            
            validateFileSize: (size) => {
                return size <= this.securitySettings.validation.maxFileSize;
            },
            
            validateFileType: (filename) => {
                const extension = filename.split('.').pop().toLowerCase();
                return this.securitySettings.validation.allowedFileTypes.includes(extension);
            }
        };
        
        console.log('Data validation configured');
    }
    
    setupSecureHeaders() {
        // Add security-related meta tags
        const securityMetas = [
            { name: 'referrer', content: 'strict-origin-when-cross-origin' },
            { name: 'robots', content: 'index, follow' },
            { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
            { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
            { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' }
        ];
        
        securityMetas.forEach(meta => {
            const existing = document.querySelector(`meta[${Object.keys(meta)[0]}="${Object.values(meta)[0]}"]`);
            if (!existing) {
                const metaTag = document.createElement('meta');
                Object.entries(meta).forEach(([key, value]) => {
                    metaTag.setAttribute(key, value);
                });
                document.head.appendChild(metaTag);
            }
        });
        
        console.log('Secure headers configured');
    }
    
    setupErrorHandling() {
        // Enhanced error handling with deployment-specific features
        window.FidakuneDeploymentErrorHandler = {
            handleError: (error, context = {}) => {
                const errorInfo = {
                    message: error.message || error,
                    stack: error.stack,
                    timestamp: new Date().toISOString(),
                    environment: this.environment,
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    context: context,
                    config: {
                        version: this.config.version,
                        debug: this.config.debug
                    }
                };
                
                // Log error based on environment
                if (this.config.debug) {
                    console.error('Deployment Error:', errorInfo);
                } else {
                    console.error('Application Error:', errorInfo.message);
                }
                
                // Report error if enabled
                if (this.config.errorReportingEnabled) {
                    this.reportError(errorInfo);
                }
                
                // Show user-friendly error message
                this.showUserError(error);
                
                return errorInfo;
            },
            
            handleNetworkError: (error, url) => {
                const networkError = new Error(`Network request failed: ${url}`);
                networkError.originalError = error;
                networkError.url = url;
                
                return this.handleError(networkError, { type: 'network', url });
            },
            
            handleDataError: (error, data) => {
                const dataError = new Error(`Data processing failed: ${error.message}`);
                dataError.originalError = error;
                dataError.dataType = typeof data;
                
                return this.handleError(dataError, { type: 'data', dataType: typeof data });
            }
        };
        
        // Set up global error handlers
        window.addEventListener('error', (event) => {
            window.FidakuneDeploymentErrorHandler.handleError(event.error, {
                type: 'javascript',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            window.FidakuneDeploymentErrorHandler.handleError(event.reason, {
                type: 'promise',
                promise: event.promise
            });
        });
        
        console.log('Enhanced error handling configured');
    }
    
    setupErrorReporting() {
        // Simple error reporting (could be enhanced with external services)
        this.errorReporter = {
            reportError: (errorInfo) => {
                // In production, this could send to an error reporting service
                if (this.environment === 'production') {
                    // Store errors locally for now
                    this.storeErrorLocally(errorInfo);
                }
            },
            
            storeErrorLocally: (errorInfo) => {
                try {
                    const errors = JSON.parse(localStorage.getItem('fidakune-errors') || '[]');
                    errors.push(errorInfo);
                    
                    // Keep only last 50 errors
                    if (errors.length > 50) {
                        errors.splice(0, errors.length - 50);
                    }
                    
                    localStorage.setItem('fidakune-errors', JSON.stringify(errors));
                } catch (e) {
                    console.warn('Failed to store error locally:', e);
                }
            }
        };
    }
    
    setupPerformanceMonitoring() {
        window.FidakunePerformanceMonitor = {
            startTime: Date.now(),
            metrics: new Map(),
            
            mark: (name) => {
                if (performance.mark) {
                    performance.mark(name);
                }
                this.metrics.set(name, Date.now());
            },
            
            measure: (name, startMark, endMark) => {
                if (performance.measure) {
                    try {
                        performance.measure(name, startMark, endMark);
                    } catch (e) {
                        console.warn('Performance measurement failed:', e);
                    }
                }
                
                const startTime = this.metrics.get(startMark);
                const endTime = this.metrics.get(endMark);
                
                if (startTime && endTime) {
                    const duration = endTime - startTime;
                    
                    if (duration > this.config.performanceThreshold) {
                        console.warn(`Performance warning: ${name} took ${duration}ms`);
                    }
                    
                    return duration;
                }
                
                return null;
            },
            
            getMetrics: () => {
                const metrics = {};
                
                if (performance.getEntriesByType) {
                    const measures = performance.getEntriesByType('measure');
                    measures.forEach(measure => {
                        metrics[measure.name] = measure.duration;
                    });
                }
                
                return metrics;
            }
        };
        
        console.log('Performance monitoring configured');
    }
    
    reportError(errorInfo) {
        if (this.errorReporter) {
            this.errorReporter.reportError(errorInfo);
        }
    }
    
    showUserError(error) {
        // Show user-friendly error message
        const message = this.getUserFriendlyErrorMessage(error);
        
        if (window.FidakuneErrorHandler) {
            window.FidakuneErrorHandler.showError(message, 'error');
        } else {
            // Fallback error display
            this.showFallbackError(message);
        }
    }
    
    getUserFriendlyErrorMessage(error) {
        const message = error.message || error;
        
        // Map technical errors to user-friendly messages
        const errorMappings = {
            'Network request failed': 'Unable to load data. Please check your internet connection.',
            'Data processing failed': 'There was an issue processing the data. Please try again.',
            'Input exceeds maximum allowed length': 'Your input is too long. Please shorten it and try again.',
            'Input contains potentially dangerous content': 'Your input contains invalid characters. Please revise and try again.',
            'Graph exceeds maximum': 'The data file is too large to process safely.',
            'Invalid graph data format': 'The vocabulary data appears to be corrupted. Please refresh the page.',
            'Rate limit exceeded': 'You\'re making requests too quickly. Please wait a moment and try again.'
        };
        
        for (const [technical, friendly] of Object.entries(errorMappings)) {
            if (message.includes(technical)) {
                return friendly;
            }
        }
        
        return 'An unexpected error occurred. Please try again or refresh the page.';
    }
    
    showFallbackError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc3545;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            max-width: 500px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 20px;">⚠️</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 4px;">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }
    
    showSecurityWarning(message) {
        if (window.FidakuneErrorHandler) {
            window.FidakuneErrorHandler.showError(message, 'warning');
        } else {
            console.warn('Security Warning:', message);
        }
    }
    
    // Public API
    getConfig() {
        return { ...this.config };
    }
    
    getEnvironment() {
        return this.environment;
    }
    
    getSecuritySettings() {
        return { ...this.securitySettings };
    }
    
    isProduction() {
        return this.environment === 'production';
    }
    
    isDevelopment() {
        return this.environment === 'development';
    }
    
    // Health check for deployment
    healthCheck() {
        const checks = {
            environment: this.environment,
            config: !!this.config,
            security: !!this.securitySettings,
            errorHandling: !!window.FidakuneDeploymentErrorHandler,
            performance: !!window.FidakunePerformanceMonitor,
            sanitization: !!window.FidakuneSanitizer,
            rateLimiting: !!window.FidakuneRateLimiter,
            dataValidation: !!window.FidakuneDataValidator,
            timestamp: new Date().toISOString()
        };
        
        const allHealthy = Object.values(checks).every(check => 
            typeof check === 'boolean' ? check : true
        );
        
        return {
            healthy: allHealthy,
            checks: checks
        };
    }
}

// Initialize deployment configuration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.FidakuneDeploymentConfig = new DeploymentConfig();
    
    // Perform health check
    const health = window.FidakuneDeploymentConfig.healthCheck();
    console.log('Deployment Health Check:', health);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeploymentConfig;
}