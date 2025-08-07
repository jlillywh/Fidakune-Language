/**
 * Security Configuration for Fidakune Conceptual Explorer
 * Implements security measures compatible with GitHub Pages hosting
 */

class SecurityConfig {
    constructor() {
        this.securityPolicies = this.initializeSecurityPolicies();
        this.threatDetection = this.initializeThreatDetection();
        this.securityHeaders = this.initializeSecurityHeaders();
        
        this.init();
    }
    
    init() {
        this.implementSecurityHeaders();
        this.setupInputValidation();
        this.initializeThreatDetection();
        this.setupSecureDataHandling();
        this.implementAccessControls();
        
        console.log('Security configuration initialized');
    }
    
    initializeSecurityPolicies() {
        return {
            // Content Security Policy
            contentSecurityPolicy: {
                'default-src': ["'self'"],
                'script-src': ["'self'", "'unsafe-inline'"],
                'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                'font-src': ["'self'", "https://fonts.gstatic.com"],
                'img-src': ["'self'", "data:", "https:"],
                'connect-src': ["'self'", "https://api.github.com", "https://raw.githubusercontent.com"],
                'object-src': ["'none'"],
                'media-src': ["'self'"],
                'frame-src': ["'none'"],
                'base-uri': ["'self'"],
                'form-action': ["'self'", "https://github.com"],
                'frame-ancestors': ["'none'"],
                'upgrade-insecure-requests': []
            },
            
            // Input validation rules
            inputValidation: {
                maxLength: 1000,
                allowedCharacters: /^[a-zA-Z0-9\s\-_.,!?'"()\u00C0-\u017F\u0100-\u024F]+$/,
                blockedPatterns: [
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
                    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
                    /<embed\b[^<]*>/gi,
                    /javascript:/gi,
                    /vbscript:/gi,
                    /on\w+\s*=/gi,
                    /data:text\/html/gi,
                    /data:application\/javascript/gi
                ],
                sanitizationRules: {
                    removeScripts: true,
                    removeObjects: true,
                    removeEvents: true,
                    encodeHtml: true,
                    normalizeWhitespace: true
                }
            },
            
            // Rate limiting configuration
            rateLimiting: {
                general: { requests: 100, window: 60000 }, // 100 requests per minute
                search: { requests: 50, window: 60000 },   // 50 searches per minute
                proposals: { requests: 5, window: 3600000 }, // 5 proposals per hour
                dataLoad: { requests: 10, window: 300000 }   // 10 data loads per 5 minutes
            },
            
            // Data validation rules
            dataValidation: {
                maxFileSize: 10 * 1024 * 1024, // 10MB
                allowedMimeTypes: ['application/json', 'text/plain'],
                maxNodes: 10000,
                maxEdges: 50000,
                maxStringLength: 1000,
                requiredFields: {
                    nodes: ['id', 'label', 'type'],
                    edges: ['source', 'target', 'relationship']
                }
            }
        };
    }
    
    initializeThreatDetection() {
        return {
            suspiciousPatterns: [
                /eval\s*\(/gi,
                /Function\s*\(/gi,
                /setTimeout\s*\(\s*["'].*["']/gi,
                /setInterval\s*\(\s*["'].*["']/gi,
                /document\.write/gi,
                /innerHTML\s*=/gi,
                /outerHTML\s*=/gi,
                /insertAdjacentHTML/gi
            ],
            
            anomalyThresholds: {
                rapidRequests: 10, // More than 10 requests in 1 second
                largePayload: 1024 * 1024, // Payload larger than 1MB
                suspiciousUserAgent: /bot|crawler|spider|scraper/gi,
                repeatedFailures: 5 // More than 5 failures in a row
            },
            
            blockedUserAgents: [
                /malicious/gi,
                /attack/gi,
                /hack/gi,
                /exploit/gi
            ]
        };
    }
    
    initializeSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Resource-Policy': 'same-origin'
        };
    }
    
    implementSecurityHeaders() {
        // Add security headers as meta tags (GitHub Pages limitation workaround)
        Object.entries(this.securityHeaders).forEach(([header, value]) => {
            const existing = document.querySelector(`meta[http-equiv="${header}"]`);
            if (!existing) {
                const meta = document.createElement('meta');
                meta.setAttribute('http-equiv', header);
                meta.setAttribute('content', value);
                document.head.appendChild(meta);
            }
        });
        
        // Add Content Security Policy
        const cspString = Object.entries(this.securityPolicies.contentSecurityPolicy)
            .map(([directive, sources]) => {
                const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${directiveName} ${sources.join(' ')}`;
            })
            .join('; ');
        
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!existingCSP) {
            const cspMeta = document.createElement('meta');
            cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
            cspMeta.setAttribute('content', cspString);
            document.head.appendChild(cspMeta);
        }
        
        console.log('Security headers implemented');
    }
    
    setupInputValidation() {
        const validator = {
            validate: (input, context = {}) => {
                if (typeof input !== 'string') {
                    throw new SecurityError('Input must be a string', 'INVALID_TYPE');
                }
                
                // Length validation
                if (input.length > this.securityPolicies.inputValidation.maxLength) {
                    throw new SecurityError('Input exceeds maximum length', 'LENGTH_EXCEEDED');
                }
                
                // Character validation
                if (!this.securityPolicies.inputValidation.allowedCharacters.test(input)) {
                    throw new SecurityError('Input contains invalid characters', 'INVALID_CHARACTERS');
                }
                
                // Pattern validation
                for (const pattern of this.securityPolicies.inputValidation.blockedPatterns) {
                    if (pattern.test(input)) {
                        this.logSecurityEvent('BLOCKED_PATTERN', { pattern: pattern.source, input: input.substring(0, 100) });
                        throw new SecurityError('Input contains potentially dangerous content', 'DANGEROUS_CONTENT');
                    }
                }
                
                // Threat detection
                for (const pattern of this.threatDetection.suspiciousPatterns) {
                    if (pattern.test(input)) {
                        this.logSecurityEvent('SUSPICIOUS_PATTERN', { pattern: pattern.source, input: input.substring(0, 100) });
                        throw new SecurityError('Input contains suspicious patterns', 'SUSPICIOUS_CONTENT');
                    }
                }
                
                return true;
            },
            
            sanitize: (input) => {
                if (typeof input !== 'string') return '';
                
                let sanitized = input;
                const rules = this.securityPolicies.inputValidation.sanitizationRules;
                
                if (rules.removeScripts) {
                    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                }
                
                if (rules.removeObjects) {
                    sanitized = sanitized.replace(/<(object|embed|iframe)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
                }
                
                if (rules.removeEvents) {
                    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
                }
                
                if (rules.encodeHtml) {
                    sanitized = sanitized
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#x27;')
                        .replace(/\//g, '&#x2F;');
                }
                
                if (rules.normalizeWhitespace) {
                    sanitized = sanitized.replace(/\s+/g, ' ').trim();
                }
                
                return sanitized;
            }
        };
        
        // Make validator globally available
        window.FidakuneSecurityValidator = validator;
        
        // Set up automatic input validation
        this.setupAutomaticValidation();
        
        console.log('Input validation configured');
    }
    
    setupAutomaticValidation() {
        // Validate all form inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="text"], input[type="search"], textarea')) {
                try {
                    window.FidakuneSecurityValidator.validate(e.target.value);
                } catch (error) {
                    if (error instanceof SecurityError) {
                        e.target.value = window.FidakuneSecurityValidator.sanitize(e.target.value);
                        this.showSecurityWarning(error.message);
                    }
                }
            }
        });
        
        // Validate search queries
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                const inputs = e.target.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    try {
                        window.FidakuneSecurityValidator.validate(input.value);
                    } catch (error) {
                        if (error instanceof SecurityError) {
                            e.preventDefault();
                            this.showSecurityWarning('Form contains invalid content and cannot be submitted');
                        }
                    }
                });
            }
        });
    }
    
    initializeThreatDetection() {
        const detector = {
            requestCounts: new Map(),
            failureCounts: new Map(),
            
            checkRequest: (identifier = 'default', type = 'general') => {
                const now = Date.now();
                const key = `${type}_${identifier}`;
                const limits = this.securityPolicies.rateLimiting[type] || this.securityPolicies.rateLimiting.general;
                
                if (!this.requestCounts.has(key)) {
                    this.requestCounts.set(key, []);
                }
                
                const requests = this.requestCounts.get(key);
                
                // Remove old requests
                const cutoff = now - limits.window;
                const validRequests = requests.filter(timestamp => timestamp > cutoff);
                
                // Check for rapid requests (anomaly detection)
                const recentRequests = validRequests.filter(timestamp => timestamp > now - 1000);
                if (recentRequests.length > this.threatDetection.anomalyThresholds.rapidRequests) {
                    this.logSecurityEvent('RAPID_REQUESTS', { identifier, count: recentRequests.length });
                    throw new SecurityError('Too many rapid requests detected', 'RATE_LIMIT_EXCEEDED');
                }
                
                // Check rate limit
                if (validRequests.length >= limits.requests) {
                    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { identifier, type, count: validRequests.length });
                    throw new SecurityError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
                }
                
                validRequests.push(now);
                this.requestCounts.set(key, validRequests);
                
                return true;
            },
            
            checkUserAgent: (userAgent) => {
                for (const pattern of this.threatDetection.blockedUserAgents) {
                    if (pattern.test(userAgent)) {
                        this.logSecurityEvent('BLOCKED_USER_AGENT', { userAgent });
                        throw new SecurityError('Access denied', 'BLOCKED_USER_AGENT');
                    }
                }
                
                if (this.threatDetection.anomalyThresholds.suspiciousUserAgent.test(userAgent)) {
                    this.logSecurityEvent('SUSPICIOUS_USER_AGENT', { userAgent });
                }
                
                return true;
            },
            
            recordFailure: (identifier = 'default') => {
                const key = `failure_${identifier}`;
                const count = this.failureCounts.get(key) || 0;
                const newCount = count + 1;
                
                this.failureCounts.set(key, newCount);
                
                if (newCount >= this.threatDetection.anomalyThresholds.repeatedFailures) {
                    this.logSecurityEvent('REPEATED_FAILURES', { identifier, count: newCount });
                    throw new SecurityError('Too many failures detected', 'REPEATED_FAILURES');
                }
                
                // Reset count after 5 minutes
                setTimeout(() => {
                    this.failureCounts.delete(key);
                }, 300000);
            }
        };
        
        // Make threat detector globally available
        window.FidakuneThreatDetector = detector;
        
        // Check user agent on initialization
        try {
            detector.checkUserAgent(navigator.userAgent);
        } catch (error) {
            if (error instanceof SecurityError) {
                this.handleSecurityThreat(error);
            }
        }
        
        console.log('Threat detection initialized');
    }
    
    setupSecureDataHandling() {
        const dataHandler = {
            validateGraphData: (data) => {
                const rules = this.securityPolicies.dataValidation;
                
                if (!data || typeof data !== 'object') {
                    throw new SecurityError('Invalid data format', 'INVALID_DATA_FORMAT');
                }
                
                // Validate structure
                if (!data.nodes || !Array.isArray(data.nodes)) {
                    throw new SecurityError('Missing or invalid nodes array', 'INVALID_STRUCTURE');
                }
                
                if (!data.edges || !Array.isArray(data.edges)) {
                    throw new SecurityError('Missing or invalid edges array', 'INVALID_STRUCTURE');
                }
                
                // Validate size limits
                if (data.nodes.length > rules.maxNodes) {
                    throw new SecurityError('Too many nodes in graph data', 'SIZE_LIMIT_EXCEEDED');
                }
                
                if (data.edges.length > rules.maxEdges) {
                    throw new SecurityError('Too many edges in graph data', 'SIZE_LIMIT_EXCEEDED');
                }
                
                // Validate node structure
                data.nodes.forEach((node, index) => {
                    rules.requiredFields.nodes.forEach(field => {
                        if (!node[field]) {
                            throw new SecurityError(`Missing required field '${field}' in node ${index}`, 'MISSING_REQUIRED_FIELD');
                        }
                    });
                    
                    // Validate string lengths
                    Object.values(node).forEach(value => {
                        if (typeof value === 'string' && value.length > rules.maxStringLength) {
                            throw new SecurityError(`String too long in node ${index}`, 'STRING_TOO_LONG');
                        }
                    });
                });
                
                // Validate edge structure
                data.edges.forEach((edge, index) => {
                    rules.requiredFields.edges.forEach(field => {
                        if (!edge[field]) {
                            throw new SecurityError(`Missing required field '${field}' in edge ${index}`, 'MISSING_REQUIRED_FIELD');
                        }
                    });
                });
                
                return true;
            },
            
            secureLoad: async (url) => {
                try {
                    // Check rate limit
                    window.FidakuneThreatDetector.checkRequest('data-load', 'dataLoad');
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache'
                        },
                        credentials: 'same-origin'
                    });
                    
                    if (!response.ok) {
                        throw new SecurityError(`HTTP ${response.status}: ${response.statusText}`, 'HTTP_ERROR');
                    }
                    
                    // Check content type
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !this.securityPolicies.dataValidation.allowedMimeTypes.some(type => contentType.includes(type))) {
                        throw new SecurityError('Invalid content type', 'INVALID_CONTENT_TYPE');
                    }
                    
                    // Check content length
                    const contentLength = response.headers.get('content-length');
                    if (contentLength && parseInt(contentLength) > this.securityPolicies.dataValidation.maxFileSize) {
                        throw new SecurityError('File too large', 'FILE_TOO_LARGE');
                    }
                    
                    const data = await response.json();
                    
                    // Validate data
                    this.validateGraphData(data);
                    
                    return data;
                    
                } catch (error) {
                    if (error instanceof SecurityError) {
                        throw error;
                    }
                    throw new SecurityError(`Data loading failed: ${error.message}`, 'LOAD_FAILED');
                }
            }
        };
        
        // Make data handler globally available
        window.FidakuneSecureDataHandler = dataHandler;
        
        console.log('Secure data handling configured');
    }
    
    implementAccessControls() {
        // Implement basic access controls
        const accessControl = {
            checkOrigin: () => {
                // Allow same origin and GitHub Pages
                const allowedOrigins = [
                    window.location.origin,
                    'https://jlillywh.github.io',
                    'https://pages.github.com'
                ];
                
                const referrer = document.referrer;
                if (referrer && !allowedOrigins.some(origin => referrer.startsWith(origin))) {
                    this.logSecurityEvent('SUSPICIOUS_REFERRER', { referrer });
                }
            },
            
            preventFraming: () => {
                // Prevent clickjacking
                if (window.top !== window.self) {
                    this.logSecurityEvent('FRAMING_ATTEMPT', { location: window.location.href });
                    window.top.location = window.self.location;
                }
            },
            
            secureStorage: {
                setItem: (key, value) => {
                    try {
                        // Validate key and value
                        if (typeof key !== 'string' || key.length > 100) {
                            throw new SecurityError('Invalid storage key', 'INVALID_KEY');
                        }
                        
                        const serialized = JSON.stringify(value);
                        if (serialized.length > 1024 * 1024) { // 1MB limit
                            throw new SecurityError('Storage value too large', 'VALUE_TOO_LARGE');
                        }
                        
                        localStorage.setItem(`fidakune-${key}`, serialized);
                    } catch (error) {
                        console.warn('Secure storage failed:', error);
                    }
                },
                
                getItem: (key) => {
                    try {
                        const item = localStorage.getItem(`fidakune-${key}`);
                        return item ? JSON.parse(item) : null;
                    } catch (error) {
                        console.warn('Secure storage retrieval failed:', error);
                        return null;
                    }
                },
                
                removeItem: (key) => {
                    localStorage.removeItem(`fidakune-${key}`);
                }
            }
        };
        
        // Run access control checks
        accessControl.checkOrigin();
        accessControl.preventFraming();
        
        // Make access control globally available
        window.FidakuneAccessControl = accessControl;
        
        console.log('Access controls implemented');
    }
    
    logSecurityEvent(eventType, details = {}) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            details: details
        };
        
        console.warn('Security Event:', event);
        
        // Store security events locally
        try {
            const events = JSON.parse(localStorage.getItem('fidakune-security-events') || '[]');
            events.push(event);
            
            // Keep only last 100 events
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            localStorage.setItem('fidakune-security-events', JSON.stringify(events));
        } catch (error) {
            console.warn('Failed to store security event:', error);
        }
    }
    
    handleSecurityThreat(error) {
        this.logSecurityEvent('SECURITY_THREAT', { error: error.message, code: error.code });
        
        // Show security warning to user
        this.showSecurityWarning('Security measure activated. Please refresh the page if you believe this is an error.');
        
        // In severe cases, could redirect or disable functionality
        if (error.code === 'BLOCKED_USER_AGENT' || error.code === 'REPEATED_FAILURES') {
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    }
    
    showSecurityWarning(message) {
        if (window.FidakuneErrorHandler) {
            window.FidakuneErrorHandler.showError(message, 'warning');
        } else {
            console.warn('Security Warning:', message);
            alert(`Security Warning: ${message}`);
        }
    }
    
    // Public API
    getSecurityStatus() {
        return {
            cspEnabled: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            inputValidationEnabled: !!window.FidakuneSecurityValidator,
            threatDetectionEnabled: !!window.FidakuneThreatDetector,
            secureDataHandlingEnabled: !!window.FidakuneSecureDataHandler,
            accessControlsEnabled: !!window.FidakuneAccessControl,
            timestamp: new Date().toISOString()
        };
    }
    
    getSecurityEvents() {
        try {
            return JSON.parse(localStorage.getItem('fidakune-security-events') || '[]');
        } catch (error) {
            return [];
        }
    }
    
    clearSecurityEvents() {
        localStorage.removeItem('fidakune-security-events');
    }
}

// Custom Security Error class
class SecurityError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'SecurityError';
        this.code = code;
    }
}

// Initialize security configuration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.FidakuneSecurityConfig = new SecurityConfig();
    
    // Log security status
    const status = window.FidakuneSecurityConfig.getSecurityStatus();
    console.log('Security Status:', status);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityConfig, SecurityError };
}