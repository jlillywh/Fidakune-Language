/**
 * Fidakune Lexicon Search Application
 * Provides search functionality for the Fidakune lexicon and word proposal workflow
 */

// Application state
const AppState = {
    lexiconData: [],
    currentSearch: null,
    isLoading: false
};

// DOM elements
const elements = {
    searchForm: null,
    searchInput: null,
    loadingIndicator: null,
    resultsSection: null,
    proposeButton: null
};

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize application components
 */
function initializeApp() {
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load lexicon data
    loadLexiconData();
    
    // Announce app ready to screen readers
    announceToScreenReader('Fidakune Lexicon Search is ready');
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
    elements.searchForm = document.querySelector('.search-form');
    elements.searchInput = document.getElementById('search-input');
    elements.loadingIndicator = document.getElementById('loading-indicator');
    elements.resultsSection = document.getElementById('results-section');
    elements.proposeButton = document.getElementById('propose-word-button');
}

/**
 * Set up event listeners for user interactions
 */
function setupEventListeners() {
    // Search form submission
    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', handleSearchSubmit);
    }
    
    // Real-time search as user types (debounced)
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(handleSearchInput, 300));
    }
    
    // Propose word button
    if (elements.proposeButton) {
        elements.proposeButton.addEventListener('click', handleProposeWord);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle search form submission
 */
function handleSearchSubmit(event) {
    event.preventDefault();
    const query = elements.searchInput.value.trim();
    
    if (query) {
        performSearch(query);
    }
}

/**
 * Handle real-time search input
 */
function handleSearchInput(event) {
    const query = event.target.value.trim();
    
    if (query.length >= 2) {
        performSearch(query);
    } else if (query.length === 0) {
        clearResults();
    }
}

/**
 * Handle propose word button click
 */
function handleProposeWord() {
    const searchContext = AppState.currentSearch;
    const githubIssueUrl = buildGitHubIssueUrl(searchContext);
    
    // Open GitHub issue in new tab
    window.open(githubIssueUrl, '_blank', 'noopener,noreferrer');
    
    // Announce action to screen readers
    announceToScreenReader('Opening GitHub issue for word proposal');
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Focus search input with Ctrl/Cmd + K
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        elements.searchInput.focus();
    }
    
    // Trigger proposal with Ctrl/Cmd + Enter when search input is focused
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && 
        document.activeElement === elements.searchInput) {
        event.preventDefault();
        handleProposeWord();
    }
}

/**
 * Load lexicon data from LEXICON.md and fallback sources
 */
async function loadLexiconData() {
    const loadingStates = {
        markdown: 'pending',
        json: 'pending',
        cache: 'pending'
    };
    
    try {
        // First try to load from LEXICON.md
        console.log('Attempting to load LEXICON.md...');
        const lexiconData = await fetchLexiconFromMarkdown();
        
        // Cache the successful data
        cacheData('lexicon-markdown', lexiconData);
        AppState.lexiconData = lexiconData;
        loadingStates.markdown = 'success';
        
        console.log(`✅ Loaded ${lexiconData.length} lexicon entries from LEXICON.md`);
        
        // Try to supplement with JSON data for completeness
        try {
            const jsonData = await fetchLexiconFromJSON();
            const mergedData = mergeDataSources(lexiconData, jsonData);
            AppState.lexiconData = mergedData;
            loadingStates.json = 'success';
            
            console.log(`✅ Merged with ${jsonData.length} entries from JSON. Total: ${mergedData.length}`);
        } catch (jsonError) {
            console.warn('JSON supplement failed, continuing with markdown data:', jsonError);
            loadingStates.json = 'failed';
        }
        
    } catch (error) {
        console.warn('❌ Failed to load LEXICON.md, trying fallback sources:', error);
        loadingStates.markdown = 'failed';
        
        try {
            // Fallback to lexicon.json
            console.log('Attempting to load lexicon.json fallback...');
            const fallbackData = await fetchLexiconFromJSON();
            
            cacheData('lexicon-json', fallbackData);
            AppState.lexiconData = fallbackData;
            loadingStates.json = 'success';
            
            console.log(`✅ Loaded ${fallbackData.length} lexicon entries from JSON fallback`);
            
        } catch (fallbackError) {
            console.error('❌ JSON fallback failed, trying cached data:', fallbackError);
            loadingStates.json = 'failed';
            
            try {
                // Try cached data as last resort
                const cachedData = getCachedData();
                if (cachedData && cachedData.length > 0) {
                    AppState.lexiconData = cachedData;
                    loadingStates.cache = 'success';
                    
                    console.log(`✅ Loaded ${cachedData.length} lexicon entries from cache`);
                    showWarning('Using cached lexicon data. Some entries may be outdated.');
                } else {
                    throw new Error('No cached data available');
                }
                
            } catch (cacheError) {
                console.error('❌ All data sources failed:', cacheError);
                loadingStates.cache = 'failed';
                
                // Use minimal emergency vocabulary
                AppState.lexiconData = getEmergencyVocabulary();
                showError('Unable to load lexicon data. Using minimal vocabulary. Please check your connection and refresh.');
            }
        }
    }
    
    // Log final loading state
    console.log('Data loading summary:', loadingStates);
    announceToScreenReader(`Lexicon loaded with ${AppState.lexiconData.length} words available for search`);
}

/**
 * Merge data from multiple sources, preferring LEXICON.md data
 */
function mergeDataSources(markdownData, jsonData) {
    const merged = [...markdownData];
    const existingWords = new Set(markdownData.map(entry => entry.word));
    
    // Add JSON entries that don't exist in markdown data
    jsonData.forEach(jsonEntry => {
        if (!existingWords.has(jsonEntry.word)) {
            merged.push(jsonEntry);
        }
    });
    
    return merged;
}

/**
 * Cache lexicon data in localStorage
 */
function cacheData(key, data) {
    try {
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            version: '1.0'
        };
        localStorage.setItem(`fidakune-${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
        console.warn('Failed to cache data:', error);
    }
}

/**
 * Retrieve cached lexicon data
 */
function getCachedData() {
    try {
        // Try markdown cache first, then JSON cache
        const cacheKeys = ['lexicon-markdown', 'lexicon-json'];
        
        for (const key of cacheKeys) {
            const cached = localStorage.getItem(`fidakune-${key}`);
            if (cached) {
                const cacheEntry = JSON.parse(cached);
                
                // Check if cache is not too old (24 hours)
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                if (Date.now() - cacheEntry.timestamp < maxAge) {
                    console.log(`Using cached data from ${key}`);
                    return cacheEntry.data;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.warn('Failed to retrieve cached data:', error);
        return null;
    }
}

/**
 * Get minimal emergency vocabulary when all sources fail
 */
function getEmergencyVocabulary() {
    return [
        createLexiconEntry({ word: 'aqua', definition: 'water', domain: 'Nature', pronunciation: '/ˈa.kwa/', type: 'simple' }),
        createLexiconEntry({ word: 'sole', definition: 'sun', domain: 'Nature', pronunciation: '/ˈso.le/', type: 'simple' }),
        createLexiconEntry({ word: 'ami', definition: 'friend', domain: 'Society', pronunciation: '/ˈa.mi/', type: 'simple' }),
        createLexiconEntry({ word: 'lei', definition: 'law', domain: 'Society', pronunciation: '/lei/', type: 'simple' }),
        createLexiconEntry({ word: 'kore-pet', definition: 'grief', domain: 'Emotion', pronunciation: '/ˈko.ɾe.pet/', type: 'compound', roots: ['kore', 'pet'] })
    ];
}

/**
 * Show warning message to user
 */
function showWarning(message) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'warning-message';
    warningDiv.innerHTML = `
        <div class="warning-message__content">
            <span class="warning-message__icon" aria-hidden="true">⚠️</span>
            <span class="warning-message__text">${message}</span>
            <button class="warning-message__close" onclick="this.parentElement.parentElement.remove()" aria-label="Close warning">×</button>
        </div>
    `;
    
    document.body.insertBefore(warningDiv, document.body.firstChild);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (warningDiv.parentElement) {
            warningDiv.remove();
        }
    }, 10000);
}

/**
 * Fetch and parse lexicon data from LEXICON.md
 */
async function fetchLexiconFromMarkdown() {
    const response = await fetch('https://raw.githubusercontent.com/jlillywh/Fidakune-Language/main/LEXICON.md');
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const markdownText = await response.text();
    return parseLexiconMarkdown(markdownText);
}

/**
 * Fetch lexicon data from JSON fallback
 */
async function fetchLexiconFromJSON() {
    const response = await fetch('lexicon.json');
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    return jsonData.map(entry => createLexiconEntry({
        word: entry.word,
        definition: entry.meaning,
        domain: entry.domain,
        pronunciation: entry.pronunciation,
        type: entry.type || 'simple',
        roots: extractRoots(entry.word)
    }));
}

/**
 * Parse LEXICON.md markdown content to extract vocabulary entries
 */
function parseLexiconMarkdown(markdownText) {
    const entries = [];
    
    // Enhanced parsing patterns for different markdown structures
    const patterns = {
        // Pattern: `word` (definition)
        basicExample: /`(\w+(?:-\w+)*)`\s*\(([^)]+)\)/g,
        
        // Pattern: - `word` (definition)
        listExample: /^-\s*`(\w+(?:-\w+)*)`\s*\(([^)]+)\)/gm,
        
        // Pattern: **word:** definition
        boldDefinition: /\*\*(\w+(?:-\w+)*):\*\*\s*([^\n]+)/g,
        
        // Pattern for compound word explanations: `word-word` (definition) → "meaning"
        compoundExplanation: /`(\w+(?:-\w+)+)`\s*\(([^)]+)\)\s*→\s*["""]([^"""]+)["""]/g,
        
        // Pattern for official examples section
        officialExample: /### Official Example\s*\n`([^`]+)`[^→]*→\s*["""]([^"""]+)["""]/g
    };
    
    // Known vocabulary from the project (fallback data)
    const knownVocabulary = [
        { word: 'aqua', definition: 'water', domain: 'Nature', pronunciation: '/ˈa.kwa/', type: 'simple' },
        { word: 'sole', definition: 'sun', domain: 'Nature', pronunciation: '/ˈso.le/', type: 'simple' },
        { word: 'ami', definition: 'friend', domain: 'Society', pronunciation: '/ˈa.mi/', type: 'simple' },
        { word: 'lei', definition: 'law', domain: 'Society', pronunciation: '/lei/', type: 'simple' },
        { word: 'kore-pet', definition: 'grief', domain: 'Emotion', pronunciation: '/ˈko.ɾe.pet/', type: 'compound', roots: ['kore', 'pet'] },
        { word: 'sole-lum', definition: 'hope', domain: 'Emotion', pronunciation: '/ˈso.le.lum/', type: 'compound', roots: ['sole', 'lum'] },
        { word: 'kore', definition: 'heart', domain: 'Body', pronunciation: '/ˈko.ɾe/', type: 'simple' },
        { word: 'pet', definition: 'stone', domain: 'Nature', pronunciation: '/pet/', type: 'simple' },
        { word: 'lum', definition: 'light', domain: 'Nature', pronunciation: '/lum/', type: 'simple' },
        { word: 'mun-lum', definition: 'inspiration', domain: 'Emotion', pronunciation: '/ˈmun.lum/', type: 'compound', roots: ['mun', 'lum'] },
        { word: 'mun', definition: 'moon', domain: 'Nature', pronunciation: '/mun/', type: 'simple' }
    ];
    
    // Add known vocabulary as fallback
    knownVocabulary.forEach(entry => {
        entries.push(createLexiconEntry(entry));
    });
    
    // Parse markdown content using multiple patterns
    Object.entries(patterns).forEach(([patternName, pattern]) => {
        let match;
        while ((match = pattern.exec(markdownText)) !== null) {
            const word = match[1];
            const definition = match[2] || match[3]; // Handle different capture groups
            
            // Skip if already exists
            if (entries.find(entry => entry.word === word)) {
                continue;
            }
            
            // Determine domain from context
            const domain = inferDomainFromContext(markdownText, word, definition);
            
            entries.push(createLexiconEntry({
                word: word,
                definition: definition,
                domain: domain,
                pronunciation: generatePronunciation(word),
                type: word.includes('-') ? 'compound' : 'simple',
                roots: word.includes('-') ? extractRoots(word) : []
            }));
        }
    });
    
    // Parse semantic domain sections
    const domainSections = extractDomainSections(markdownText);
    domainSections.forEach(section => {
        section.entries.forEach(entry => {
            if (!entries.find(existing => existing.word === entry.word)) {
                entries.push(createLexiconEntry({
                    ...entry,
                    domain: section.domain
                }));
            }
        });
    });
    
    return entries;
}

/**
 * Create a standardized lexicon entry object
 */
function createLexiconEntry(data) {
    return new LexiconEntry(data);
}

/**
 * Generate pronunciation from Fidakune word
 */
function generatePronunciation(word) {
    // Basic pronunciation generation based on Fidakune phonotactics
    const syllables = word.split('-').map(part => {
        // Add stress to first syllable of each part
        if (part.length > 2) {
            return `ˈ${part.replace(/(.)/g, (char, index) => {
                // Map common letter combinations to IPA
                const ipaMap = {
                    'qu': 'kw',
                    'r': 'ɾ',
                    'c': 'k'
                };
                return ipaMap[char] || char;
            })}`;
        }
        return part;
    });
    
    return `/${syllables.join('.')}/`;
}

/**
 * Infer semantic domain from markdown context
 */
function inferDomainFromContext(markdownText, word, definition) {
    const domainKeywords = {
        'Nature': ['water', 'sun', 'moon', 'tree', 'stone', 'light', 'fire', 'earth', 'sky', 'sea', 'river', 'mountain', 'wind', 'rain', 'cloud', 'ice'],
        'Society': ['friend', 'law', 'family', 'community', 'peace', 'culture', 'tradition', 'education', 'work', 'service'],
        'Emotion': ['grief', 'hope', 'love', 'joy', 'anger', 'fear', 'happy', 'sad', 'calm', 'inspiration'],
        'Body': ['heart', 'head', 'hand', 'foot', 'hair', 'neck', 'back', 'belly'],
        'Technology': ['computer', 'network', 'data', 'code', 'digital', 'program', 'web', 'internet'],
        'Action': ['go', 'come', 'give', 'help', 'build', 'create', 'run', 'see', 'hear', 'speak', 'read', 'write'],
        'Quality': ['good', 'bad', 'big', 'small', 'strong', 'beautiful', 'clear', 'fast', 'slow', 'new', 'old'],
        'Grammar': ['past', 'future', 'not', 'question', 'respect', 'that', 'with', 'for', 'because']
    };
    
    const definitionLower = definition.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
        if (keywords.some(keyword => definitionLower.includes(keyword))) {
            return domain;
        }
    }
    
    // Check if word appears in a specific domain section
    const domainSectionRegex = /### (\w+) Domain[\s\S]*?(?=###|$)/g;
    let match;
    while ((match = domainSectionRegex.exec(markdownText)) !== null) {
        const sectionContent = match[0];
        if (sectionContent.includes(word)) {
            return match[1];
        }
    }
    
    return 'General';
}

/**
 * Extract vocabulary entries from semantic domain sections
 */
function extractDomainSections(markdownText) {
    const sections = [];
    const domainSectionRegex = /### (\w+) Domain([\s\S]*?)(?=###|$)/g;
    
    let match;
    while ((match = domainSectionRegex.exec(markdownText)) !== null) {
        const domain = match[1];
        const content = match[2];
        
        // Extract entries from this section
        const entries = [];
        const entryPatterns = [
            /`(\w+(?:-\w+)*)`\s*\(([^)]+)\)/g,
            /-\s*`(\w+(?:-\w+)*)`\s*\(([^)]+)\)/g
        ];
        
        entryPatterns.forEach(pattern => {
            let entryMatch;
            while ((entryMatch = pattern.exec(content)) !== null) {
                entries.push({
                    word: entryMatch[1],
                    definition: entryMatch[2],
                    pronunciation: generatePronunciation(entryMatch[1]),
                    type: entryMatch[1].includes('-') ? 'compound' : 'simple',
                    roots: entryMatch[1].includes('-') ? extractRoots(entryMatch[1]) : []
                });
            }
        });
        
        if (entries.length > 0) {
            sections.push({ domain, entries });
        }
    }
    
    return sections;
}

/**
 * LexiconEntry class for standardized vocabulary entries
 */
class LexiconEntry {
    constructor(data) {
        this.word = data.word || '';
        this.definition = data.definition || '';
        this.domain = data.domain || 'General';
        this.pronunciation = data.pronunciation || this.generatePronunciation();
        this.type = data.type || this.inferType();
        this.roots = data.roots || this.extractRoots();
        this.examples = data.examples || [];
        this.etymology = data.etymology || null;
        this.usage = data.usage || null;
        this.created = data.created || new Date().toISOString();
        this.validated = data.validated || false;
    }
    
    /**
     * Check if this is a compound word
     */
    isCompound() {
        return this.type === 'compound' && this.roots.length > 0;
    }
    
    /**
     * Check if query matches this entry
     */
    matchesQuery(query) {
        const normalizedQuery = query.toLowerCase().trim();
        return this.word.toLowerCase().includes(normalizedQuery) ||
               this.definition.toLowerCase().includes(normalizedQuery) ||
               this.roots.some(root => root.toLowerCase().includes(normalizedQuery));
    }
    
    /**
     * Get semantic similarity score with query
     */
    getSemanticScore(query) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const definitionWords = this.definition.toLowerCase().split(/\s+/);
        
        let score = 0;
        queryWords.forEach(qWord => {
            definitionWords.forEach(dWord => {
                if (qWord === dWord) score += 3;
                else if (qWord.includes(dWord) || dWord.includes(qWord)) score += 1;
            });
        });
        
        return score;
    }
    
    /**
     * Check if entry is valid according to Fidakune rules
     */
    isValid() {
        return this.word && 
               this.definition && 
               this.isPhonologicallyValid() && 
               this.domain && 
               this.pronunciation;
    }
    
    /**
     * Validate phonological structure
     */
    isPhonologicallyValid() {
        // Fidakune phoneme inventory
        const validPhonemes = /^[ptkbdgmnsfhlɾwjaeiou-]+$/;
        const cleanWord = this.word.replace(/-/g, '');
        return validPhonemes.test(cleanWord);
    }
    
    /**
     * Generate pronunciation if not provided
     */
    generatePronunciation() {
        if (!this.word) return '';
        
        const syllables = this.word.split('-').map(part => {
            // Add stress to first syllable of multi-syllabic parts
            if (part.length > 2) {
                return `ˈ${this.mapToIPA(part)}`;
            }
            return this.mapToIPA(part);
        });
        
        return `/${syllables.join('.')}/`;
    }
    
    /**
     * Map letters to IPA symbols
     */
    mapToIPA(text) {
        const ipaMap = {
            'qu': 'kw',
            'r': 'ɾ',
            'c': 'k',
            'x': 'ks'
        };
        
        let result = text;
        Object.entries(ipaMap).forEach(([from, to]) => {
            result = result.replace(new RegExp(from, 'g'), to);
        });
        
        return result;
    }
    
    /**
     * Infer word type from structure
     */
    inferType() {
        if (!this.word) return 'simple';
        
        if (this.word.includes('-')) {
            return 'compound';
        }
        
        // Check if it's a proper noun (capitalized)
        if (this.word[0] && this.word[0] === this.word[0].toUpperCase()) {
            return 'proper';
        }
        
        return 'simple';
    }
    
    /**
     * Extract roots from compound words
     */
    extractRoots() {
        if (this.word && this.word.includes('-')) {
            return this.word.split('-').filter(root => root.length > 0);
        }
        return [];
    }
    
    /**
     * Get formatted display information
     */
    getDisplayInfo() {
        return {
            word: this.word,
            definition: this.definition,
            domain: this.domain,
            pronunciation: this.pronunciation,
            type: this.type,
            roots: this.isCompound() ? this.roots.join(' + ') : null,
            examples: this.examples.length > 0 ? this.examples[0] : null
        };
    }
    
    /**
     * Export to JSON format
     */
    toJSON() {
        return {
            word: this.word,
            definition: this.definition,
            domain: this.domain,
            pronunciation: this.pronunciation,
            type: this.type,
            roots: this.roots,
            examples: this.examples,
            etymology: this.etymology,
            usage: this.usage,
            created: this.created,
            validated: this.validated
        };
    }
    
    /**
     * Create from JSON data
     */
    static fromJSON(jsonData) {
        return new LexiconEntry(jsonData);
    }
    
    /**
     * Validate multiple entries for conflicts
     */
    static validateEntries(entries) {
        const conflicts = [];
        const wordMap = new Map();
        
        entries.forEach((entry, index) => {
            if (wordMap.has(entry.word)) {
                conflicts.push({
                    type: 'duplicate',
                    word: entry.word,
                    indices: [wordMap.get(entry.word), index]
                });
            } else {
                wordMap.set(entry.word, index);
            }
            
            // Check for homophones
            entries.forEach((otherEntry, otherIndex) => {
                if (index !== otherIndex && 
                    entry.pronunciation === otherEntry.pronunciation &&
                    entry.word !== otherEntry.word) {
                    conflicts.push({
                        type: 'homophone',
                        words: [entry.word, otherEntry.word],
                        pronunciation: entry.pronunciation
                    });
                }
            });
        });
        
        return conflicts;
    }
}

/**
 * Extract roots from compound words (legacy function for compatibility)
 */
function extractRoots(word) {
    if (word && word.includes('-')) {
        return word.split('-').filter(root => root.length > 0);
    }
    return [];
}

/**
 * Perform search with three-tier logic
 */
function performSearch(query) {
    if (AppState.isLoading) return;
    
    AppState.isLoading = true;
    showLoading(true);
    
    // Simulate brief loading for better UX
    setTimeout(() => {
        const results = executeSearch(query);
        displayResults(results);
        
        AppState.currentSearch = {
            query: query,
            timestamp: new Date().toISOString(),
            results: results
        };
        
        AppState.isLoading = false;
        showLoading(false);
        
        // Announce results to screen readers
        const resultCount = results.exactMatches.length + results.relatedWords.length + results.semanticMatches.length;
        announceToScreenReader(`Search completed. Found ${resultCount} results for "${query}"`);
        
    }, 200);
}

/**
 * Formal Three-Tier Search Engine
 * Integrates with LexiconEntry data model for comprehensive search functionality
 */
class SearchEngine {
    constructor(lexiconData = []) {
        this.lexiconData = lexiconData;
        this.searchHistory = [];
        this.performanceMetrics = {
            totalSearches: 0,
            averageTime: 0,
            cacheHits: 0
        };
        this.searchCache = new Map();
    }
    
    /**
     * Update lexicon data
     */
    updateLexiconData(newData) {
        this.lexiconData = newData;
        this.clearCache();
    }
    
    /**
     * Main search method implementing three-tier logic
     */
    search(query, options = {}) {
        const startTime = performance.now();
        const normalizedQuery = this.normalizeQuery(query);
        
        // Check cache first
        const cacheKey = this.getCacheKey(normalizedQuery, options);
        if (this.searchCache.has(cacheKey)) {
            this.performanceMetrics.cacheHits++;
            return this.searchCache.get(cacheKey);
        }
        
        // Validate query
        if (!this.isValidQuery(normalizedQuery)) {
            return this.createEmptyResults(query, 'Invalid query');
        }
        
        // Execute three-tier search
        const results = this.executeThreeTierSearch(normalizedQuery, options);
        
        // Update performance metrics
        const endTime = performance.now();
        this.updatePerformanceMetrics(endTime - startTime);
        
        // Cache results
        this.searchCache.set(cacheKey, results);
        
        // Add to search history
        this.addToHistory(query, results);
        
        return results;
    }
    
    /**
     * Execute the formal three-tier search logic
     */
    executeThreeTierSearch(normalizedQuery, options = {}) {
        const results = {
            exactMatches: [],
            relatedWords: [],
            semanticMatches: [],
            query: normalizedQuery,
            timestamp: new Date().toISOString(),
            searchTier: null,
            totalResults: 0,
            processingTime: 0
        };
        
        const startTime = performance.now();
        
        // Tier 1: Exact Match Search
        results.exactMatches = this.performExactMatchSearch(normalizedQuery);
        
        if (results.exactMatches.length > 0) {
            results.searchTier = 'exact';
            results.totalResults = results.exactMatches.length;
            results.processingTime = performance.now() - startTime;
            return results;
        }
        
        // Tier 2: Root Analysis Search
        results.relatedWords = this.performRootAnalysisSearch(normalizedQuery);
        
        // Tier 3: Semantic Analysis Search
        results.semanticMatches = this.performSemanticAnalysisSearch(normalizedQuery, results.relatedWords);
        
        // Determine primary search tier
        if (results.relatedWords.length > 0) {
            results.searchTier = 'root';
        } else if (results.semanticMatches.length > 0) {
            results.searchTier = 'semantic';
        } else {
            results.searchTier = 'none';
        }
        
        results.totalResults = results.exactMatches.length + results.relatedWords.length + results.semanticMatches.length;
        results.processingTime = performance.now() - startTime;
        
        return results;
    }
    
    /**
     * Tier 1: Exact Match Search Implementation
     */
    performExactMatchSearch(query) {
        const exactMatches = [];
        
        this.lexiconData.forEach(entry => {
            if (this.isExactMatch(entry, query)) {
                exactMatches.push({
                    entry: entry,
                    matchType: 'exact',
                    matchField: this.getMatchField(entry, query),
                    confidence: 1.0
                });
            }
        });
        
        // Sort by relevance (word matches before definition matches)
        return exactMatches.sort((a, b) => {
            if (a.matchField === 'word' && b.matchField !== 'word') return -1;
            if (a.matchField !== 'word' && b.matchField === 'word') return 1;
            return 0;
        });
    }
    
    /**
     * Check if entry is an exact match
     */
    isExactMatch(entry, query) {
        const entryWord = entry.word.toLowerCase();
        const entryDefinition = entry.definition.toLowerCase();
        
        return entryWord === query || 
               entryDefinition === query ||
               (entry.examples && entry.examples.some(ex => ex.toLowerCase().includes(query)));
    }
    
    /**
     * Determine which field matched
     */
    getMatchField(entry, query) {
        if (entry.word.toLowerCase() === query) return 'word';
        if (entry.definition.toLowerCase() === query) return 'definition';
        if (entry.examples && entry.examples.some(ex => ex.toLowerCase().includes(query))) return 'example';
        return 'unknown';
    }
    
    /**
     * Normalize query for consistent processing
     */
    normalizeQuery(query) {
        return query.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    
    /**
     * Validate query format and content
     */
    isValidQuery(query) {
        return query && 
               query.length > 0 && 
               query.length <= 100 && 
               /^[a-zA-Z0-9\s\-']+$/.test(query);
    }
    
    /**
     * Create cache key for query and options
     */
    getCacheKey(query, options) {
        return `${query}:${JSON.stringify(options)}`;
    }
    
    /**
     * Create empty results object
     */
    createEmptyResults(query, reason = '') {
        return {
            exactMatches: [],
            relatedWords: [],
            semanticMatches: [],
            query: query,
            timestamp: new Date().toISOString(),
            searchTier: 'none',
            totalResults: 0,
            processingTime: 0,
            error: reason
        };
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(searchTime) {
        this.performanceMetrics.totalSearches++;
        this.performanceMetrics.averageTime = 
            (this.performanceMetrics.averageTime * (this.performanceMetrics.totalSearches - 1) + searchTime) / 
            this.performanceMetrics.totalSearches;
    }
    
    /**
     * Add search to history
     */
    addToHistory(query, results) {
        this.searchHistory.unshift({
            query: query,
            timestamp: new Date().toISOString(),
            resultCount: results.totalResults,
            searchTier: results.searchTier
        });
        
        // Keep only last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
    }
    
    /**
     * Clear search cache
     */
    clearCache() {
        this.searchCache.clear();
    }
    
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    
    /**
     * Get search history
     */
    getSearchHistory() {
        return [...this.searchHistory];
    }
    
    /**
     * Tier 2: Root Analysis Search Implementation
     */
    performRootAnalysisSearch(query) {
        const relatedWords = [];
        const queryRoots = this.extractQueryRoots(query);
        
        if (queryRoots.length === 0) {
            return relatedWords;
        }
        
        this.lexiconData.forEach(entry => {
            const rootMatch = this.analyzeRootMatch(entry, queryRoots, query);
            
            if (rootMatch.hasMatch) {
                relatedWords.push({
                    entry: entry,
                    matchType: 'root',
                    matchedRoots: rootMatch.matchedRoots,
                    confidence: rootMatch.confidence,
                    rootHighlights: rootMatch.highlights
                });
            }
        });
        
        // Sort by confidence and number of matched roots
        return relatedWords.sort((a, b) => {
            if (a.confidence !== b.confidence) {
                return b.confidence - a.confidence;
            }
            return b.matchedRoots.length - a.matchedRoots.length;
        });
    }
    
    /**
     * Extract potential roots from query
     */
    extractQueryRoots(query) {
        // Split on common separators and filter meaningful parts
        const parts = query.split(/[-\s_]+/)
            .filter(part => part.length >= 2)
            .map(part => part.toLowerCase());
        
        // Also consider the whole query as a potential root
        if (query.length >= 2 && !parts.includes(query)) {
            parts.push(query);
        }
        
        return parts;
    }
    
    /**
     * Analyze root matching between entry and query roots
     */
    analyzeRootMatch(entry, queryRoots, originalQuery) {
        const result = {
            hasMatch: false,
            matchedRoots: [],
            confidence: 0,
            highlights: []
        };
        
        const entryRoots = entry.roots || [];
        const entryWord = entry.word.toLowerCase();
        
        // Check for direct root matches
        queryRoots.forEach(queryRoot => {
            // Direct root match
            if (entryRoots.includes(queryRoot)) {
                result.matchedRoots.push(queryRoot);
                result.confidence += 0.8;
                result.highlights.push({
                    type: 'direct_root',
                    root: queryRoot,
                    position: entryRoots.indexOf(queryRoot)
                });
            }
            // Word contains query root
            else if (entryWord.includes(queryRoot)) {
                result.matchedRoots.push(queryRoot);
                result.confidence += 0.6;
                result.highlights.push({
                    type: 'word_contains',
                    root: queryRoot,
                    position: entryWord.indexOf(queryRoot)
                });
            }
            // Query root contains entry root (partial match)
            else {
                entryRoots.forEach(entryRoot => {
                    if (queryRoot.includes(entryRoot) && entryRoot.length >= 3) {
                        result.matchedRoots.push(entryRoot);
                        result.confidence += 0.4;
                        result.highlights.push({
                            type: 'partial_match',
                            root: entryRoot,
                            queryRoot: queryRoot
                        });
                    }
                });
            }
        });
        
        // Check for compound word pattern matching
        if (originalQuery.includes('-') && entry.isCompound()) {
            const compoundScore = this.analyzeCompoundPattern(originalQuery, entry);
            result.confidence += compoundScore;
            
            if (compoundScore > 0) {
                result.highlights.push({
                    type: 'compound_pattern',
                    score: compoundScore
                });
            }
        }
        
        // Check for morphological similarity
        const morphScore = this.analyzeMorphologicalSimilarity(originalQuery, entry);
        result.confidence += morphScore;
        
        result.hasMatch = result.confidence > 0.3; // Threshold for relevance
        result.confidence = Math.min(result.confidence, 1.0); // Cap at 1.0
        
        return result;
    }
    
    /**
     * Analyze compound word pattern matching
     */
    analyzeCompoundPattern(query, entry) {
        if (!entry.isCompound()) return 0;
        
        const queryParts = query.split('-');
        const entryRoots = entry.roots;
        
        let score = 0;
        
        // Check for similar compound structure
        if (queryParts.length === entryRoots.length) {
            score += 0.2;
            
            // Check for positional matches
            queryParts.forEach((queryPart, index) => {
                if (index < entryRoots.length) {
                    const entryRoot = entryRoots[index];
                    if (queryPart === entryRoot) {
                        score += 0.3;
                    } else if (queryPart.includes(entryRoot) || entryRoot.includes(queryPart)) {
                        score += 0.1;
                    }
                }
            });
        }
        
        return score;
    }
    
    /**
     * Analyze morphological similarity between query and entry
     */
    analyzeMorphologicalSimilarity(query, entry) {
        const entryWord = entry.word.toLowerCase();
        let score = 0;
        
        // Check for common prefixes/suffixes
        const commonPrefixes = ['pre', 'un', 'non', 're'];
        const commonSuffixes = ['ing', 'ed', 'er', 'est', 'ly'];
        
        commonPrefixes.forEach(prefix => {
            if (query.startsWith(prefix) && entryWord.startsWith(prefix)) {
                score += 0.1;
            }
        });
        
        commonSuffixes.forEach(suffix => {
            if (query.endsWith(suffix) && entryWord.endsWith(suffix)) {
                score += 0.1;
            }
        });
        
        // Check for character overlap
        const queryChars = new Set(query.split(''));
        const entryChars = new Set(entryWord.split(''));
        const intersection = new Set([...queryChars].filter(x => entryChars.has(x)));
        const union = new Set([...queryChars, ...entryChars]);
        
        const jaccardSimilarity = intersection.size / union.size;
        if (jaccardSimilarity > 0.5) {
            score += jaccardSimilarity * 0.2;
        }
        
        return score;
    }
    
    /**
     * Tier 3: Semantic Analysis Search Implementation
     */
    performSemanticAnalysisSearch(query, excludeEntries = []) {
        const semanticMatches = [];
        const queryKeywords = this.extractSemanticKeywords(query);
        const excludeWords = new Set(excludeEntries.map(match => match.entry.word));
        
        if (queryKeywords.length === 0) {
            return semanticMatches;
        }
        
        this.lexiconData.forEach(entry => {
            // Skip if already found in previous tiers
            if (excludeWords.has(entry.word)) {
                return;
            }
            
            const semanticMatch = this.analyzeSemanticMatch(entry, queryKeywords, query);
            
            if (semanticMatch.hasMatch) {
                semanticMatches.push({
                    entry: entry,
                    matchType: 'semantic',
                    matchedKeywords: semanticMatch.matchedKeywords,
                    confidence: semanticMatch.confidence,
                    semanticScore: semanticMatch.semanticScore,
                    domainRelevance: semanticMatch.domainRelevance
                });
            }
        });
        
        // Sort by semantic relevance and confidence
        return semanticMatches.sort((a, b) => {
            if (a.semanticScore !== b.semanticScore) {
                return b.semanticScore - a.semanticScore;
            }
            return b.confidence - a.confidence;
        });
    }
    
    /**
     * Extract semantic keywords from query
     */
    extractSemanticKeywords(query) {
        // Remove common stop words
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        ]);
        
        const keywords = query.split(/\s+/)
            .filter(word => word.length >= 3 && !stopWords.has(word.toLowerCase()))
            .map(word => word.toLowerCase());
        
        // Add stemmed versions of keywords
        const stemmedKeywords = keywords.map(word => this.stemWord(word));
        
        return [...new Set([...keywords, ...stemmedKeywords])];
    }
    
    /**
     * Simple word stemming for better semantic matching
     */
    stemWord(word) {
        // Basic English stemming rules
        const suffixes = [
            { pattern: /ies$/, replacement: 'y' },
            { pattern: /ied$/, replacement: 'y' },
            { pattern: /ying$/, replacement: 'ie' },
            { pattern: /ing$/, replacement: '' },
            { pattern: /ed$/, replacement: '' },
            { pattern: /er$/, replacement: '' },
            { pattern: /est$/, replacement: '' },
            { pattern: /ly$/, replacement: '' },
            { pattern: /s$/, replacement: '' }
        ];
        
        for (const suffix of suffixes) {
            if (suffix.pattern.test(word) && word.length > 4) {
                return word.replace(suffix.pattern, suffix.replacement);
            }
        }
        
        return word;
    }
    
    /**
     * Analyze semantic matching between entry and query keywords
     */
    analyzeSemanticMatch(entry, queryKeywords, originalQuery) {
        const result = {
            hasMatch: false,
            matchedKeywords: [],
            confidence: 0,
            semanticScore: 0,
            domainRelevance: 0
        };
        
        const entryDefinition = entry.definition.toLowerCase();
        const entryWords = entryDefinition.split(/\s+/);
        const entryDomain = entry.domain.toLowerCase();
        
        // Direct keyword matching in definition
        queryKeywords.forEach(keyword => {
            const keywordScore = this.calculateKeywordScore(keyword, entryWords, entryDefinition);
            
            if (keywordScore > 0) {
                result.matchedKeywords.push({
                    keyword: keyword,
                    score: keywordScore,
                    matchType: this.getKeywordMatchType(keyword, entryWords, entryDefinition)
                });
                result.confidence += keywordScore;
            }
        });
        
        // Semantic domain analysis
        result.domainRelevance = this.analyzeDomainRelevance(originalQuery, entryDomain);
        result.confidence += result.domainRelevance;
        
        // Conceptual similarity analysis
        const conceptualScore = this.analyzeConceptualSimilarity(originalQuery, entry);
        result.confidence += conceptualScore;
        
        // Calculate overall semantic score using LexiconEntry's built-in method
        result.semanticScore = entry.getSemanticScore(originalQuery);
        
        // Combine scores with weights
        result.confidence = (result.confidence * 0.6) + (result.semanticScore * 0.4);
        
        result.hasMatch = result.confidence > 0.2; // Lower threshold for semantic matches
        result.confidence = Math.min(result.confidence, 1.0);
        
        return result;
    }
    
    /**
     * Calculate score for individual keyword match
     */
    calculateKeywordScore(keyword, entryWords, entryDefinition) {
        let score = 0;
        
        // Exact word match
        if (entryWords.includes(keyword)) {
            score += 0.8;
        }
        // Partial word match
        else if (entryWords.some(word => word.includes(keyword) || keyword.includes(word))) {
            score += 0.4;
        }
        // Definition contains keyword
        else if (entryDefinition.includes(keyword)) {
            score += 0.3;
        }
        
        // Boost score for longer keywords (more specific)
        if (keyword.length > 5) {
            score *= 1.2;
        }
        
        return score;
    }
    
    /**
     * Determine the type of keyword match
     */
    getKeywordMatchType(keyword, entryWords, entryDefinition) {
        if (entryWords.includes(keyword)) {
            return 'exact_word';
        } else if (entryWords.some(word => word.includes(keyword))) {
            return 'partial_word';
        } else if (entryDefinition.includes(keyword)) {
            return 'definition_contains';
        }
        return 'no_match';
    }
    
    /**
     * Analyze domain relevance between query and entry domain
     */
    analyzeDomainRelevance(query, entryDomain) {
        const domainKeywords = {
            'nature': ['water', 'sun', 'moon', 'tree', 'stone', 'light', 'fire', 'earth', 'sky', 'sea', 'river', 'mountain', 'wind', 'rain', 'cloud', 'ice', 'natural', 'environment'],
            'society': ['friend', 'law', 'family', 'community', 'peace', 'culture', 'tradition', 'education', 'work', 'service', 'social', 'people', 'group'],
            'emotion': ['grief', 'hope', 'love', 'joy', 'anger', 'fear', 'happy', 'sad', 'calm', 'inspiration', 'feeling', 'mood', 'emotional'],
            'body': ['heart', 'head', 'hand', 'foot', 'hair', 'neck', 'back', 'belly', 'body', 'physical', 'anatomy'],
            'technology': ['computer', 'network', 'data', 'code', 'digital', 'program', 'web', 'internet', 'tech', 'electronic'],
            'action': ['go', 'come', 'give', 'help', 'build', 'create', 'run', 'see', 'hear', 'speak', 'read', 'write', 'do', 'make', 'move'],
            'quality': ['good', 'bad', 'big', 'small', 'strong', 'beautiful', 'clear', 'fast', 'slow', 'new', 'old', 'quality', 'attribute'],
            'grammar': ['past', 'future', 'not', 'question', 'respect', 'that', 'with', 'for', 'because', 'grammar', 'language']
        };
        
        const queryLower = query.toLowerCase();
        const domainLower = entryDomain.toLowerCase();
        
        // Check if query contains domain-specific keywords
        const relevantKeywords = domainKeywords[domainLower] || [];
        const matchingKeywords = relevantKeywords.filter(keyword => queryLower.includes(keyword));
        
        return matchingKeywords.length > 0 ? matchingKeywords.length * 0.1 : 0;
    }
    
    /**
     * Analyze conceptual similarity using word associations
     */
    analyzeConceptualSimilarity(query, entry) {
        // Simple conceptual associations
        const conceptualMap = {
            'water': ['liquid', 'drink', 'wet', 'flow', 'ocean', 'river'],
            'sun': ['light', 'bright', 'day', 'warm', 'solar', 'star'],
            'friend': ['companion', 'buddy', 'pal', 'ally', 'social', 'relationship'],
            'heart': ['love', 'emotion', 'feeling', 'center', 'core', 'vital'],
            'grief': ['sadness', 'sorrow', 'loss', 'mourning', 'pain', 'emotional'],
            'hope': ['optimism', 'faith', 'future', 'positive', 'expectation', 'light']
        };
        
        const queryLower = query.toLowerCase();
        const definitionLower = entry.definition.toLowerCase();
        
        let score = 0;
        
        // Check if query relates to entry through conceptual associations
        Object.entries(conceptualMap).forEach(([concept, associations]) => {
            if (queryLower.includes(concept) || definitionLower.includes(concept)) {
                associations.forEach(association => {
                    if (queryLower.includes(association) || definitionLower.includes(association)) {
                        score += 0.1;
                    }
                });
            }
        });
        
        return Math.min(score, 0.5); // Cap conceptual score
    }
}

// Global search engine instance
let searchEngine = null;

/**
 * Execute the three-tier search logic (legacy function for compatibility)
 */
function executeSearch(query) {
    if (!searchEngine) {
        searchEngine = new SearchEngine(AppState.lexiconData);
    } else {
        searchEngine.updateLexiconData(AppState.lexiconData);
    }
    
    const results = searchEngine.search(query);
    
    // Convert to legacy format for compatibility with existing UI
    return {
        exactMatches: results.exactMatches.map(match => match.entry),
        relatedWords: results.relatedWords.map(match => match.entry),
        semanticMatches: results.semanticMatches.map(match => match.entry),
        query: results.query
    };
}

// Legacy helper functions removed - functionality moved to SearchEngine class

/**
 * Display search results in the UI
 */
function displayResults(results) {
    const hasResults = results.exactMatches.length > 0 || 
                      results.relatedWords.length > 0 || 
                      results.semanticMatches.length > 0;
    
    if (!hasResults) {
        displayNoResults(results.query);
        return;
    }
    
    let html = '<div class="search-results">';
    
    // Exact matches
    if (results.exactMatches.length > 0) {
        html += '<div class="result-section">';
        html += '<h3 class="result-section__title">Exact Match</h3>';
        html += '<div class="result-cards">';
        results.exactMatches.forEach(entry => {
            html += createResultCard(entry, 'exact');
        });
        html += '</div></div>';
    }
    
    // Related words (root analysis)
    if (results.relatedWords.length > 0) {
        html += '<div class="result-section">';
        html += '<h3 class="result-section__title">Related Words</h3>';
        html += '<div class="result-cards">';
        results.relatedWords.forEach(entry => {
            html += createResultCard(entry, 'related');
        });
        html += '</div></div>';
    }
    
    // Semantic matches
    if (results.semanticMatches.length > 0) {
        html += '<div class="result-section">';
        html += '<h3 class="result-section__title">Related Concepts</h3>';
        html += '<div class="result-cards">';
        results.semanticMatches.forEach(entry => {
            html += createResultCard(entry, 'semantic');
        });
        html += '</div></div>';
    }
    
    html += '</div>';
    
    elements.resultsSection.innerHTML = html;
    elements.resultsSection.classList.add('show');
}

/**
 * Create HTML for a result card
 */
function createResultCard(entry, matchType, matchData = null) {
    // Handle both new format (with match objects) and legacy format (direct entries)
    const actualEntry = entry.entry || entry;
    const actualMatchType = matchType || (entry.matchType || 'unknown');
    const confidence = entry.confidence || null;
    
    const isCompound = actualEntry.isCompound ? actualEntry.isCompound() : actualEntry.type === 'compound';
    const rootsDisplay = isCompound && actualEntry.roots ? 
        `<div class="result-card__roots">Roots: ${actualEntry.roots.join(' + ')}</div>` : '';
    
    // Add confidence indicator for new search engine results
    const confidenceDisplay = confidence !== null ? 
        `<div class="result-card__confidence">
            <span class="result-card__confidence-label">Relevance:</span>
            <div class="result-card__confidence-bar">
                <div class="result-card__confidence-fill" style="width: ${Math.round(confidence * 100)}%"></div>
            </div>
            <span class="result-card__confidence-value">${Math.round(confidence * 100)}%</span>
        </div>` : '';
    
    // Add match-specific information
    let matchInfo = '';
    if (entry.matchedRoots && entry.matchedRoots.length > 0) {
        matchInfo = `<div class="result-card__match-info">Matched roots: ${entry.matchedRoots.join(', ')}</div>`;
    } else if (entry.matchedKeywords && entry.matchedKeywords.length > 0) {
        const keywords = entry.matchedKeywords.map(k => k.keyword).join(', ');
        matchInfo = `<div class="result-card__match-info">Matched concepts: ${keywords}</div>`;
    } else if (entry.matchField) {
        matchInfo = `<div class="result-card__match-info">Exact match in: ${entry.matchField}</div>`;
    }
    
    return `
        <div class="result-card result-card--${actualMatchType}" role="article" tabindex="0">
            <div class="result-card__header">
                <h4 class="result-card__word">${actualEntry.word}</h4>
                <span class="result-card__pronunciation">${actualEntry.pronunciation}</span>
            </div>
            <div class="result-card__definition">${actualEntry.definition}</div>
            <div class="result-card__meta">
                <span class="result-card__domain">${actualEntry.domain}</span>
                <span class="result-card__type">${actualEntry.type}</span>
            </div>
            ${rootsDisplay}
            ${matchInfo}
            ${confidenceDisplay}
        </div>
    `;
}

/**
 * Display no results message
 */
function displayNoResults(query) {
    const html = `
        <div class="no-results">
            <div class="no-results__icon" aria-hidden="true">🔍</div>
            <h3 class="no-results__title">No results found for "${query}"</h3>
            <p class="no-results__message">
                We couldn't find any words matching your search. This might be a great opportunity to propose a new word!
            </p>
            <div class="no-results__suggestions">
                <h4>Try searching for:</h4>
                <ul>
                    <li>Basic concepts like "water", "sun", or "friend"</li>
                    <li>Compound words like "kore-pet" (grief)</li>
                    <li>Related terms or synonyms</li>
                </ul>
            </div>
        </div>
    `;
    
    elements.resultsSection.innerHTML = html;
    elements.resultsSection.classList.add('show');
}

/**
 * Clear search results
 */
function clearResults() {
    elements.resultsSection.innerHTML = '';
    elements.resultsSection.classList.remove('show');
    AppState.currentSearch = null;
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    if (show) {
        elements.loadingIndicator.classList.add('show');
        elements.loadingIndicator.setAttribute('aria-hidden', 'false');
    } else {
        elements.loadingIndicator.classList.remove('show');
        elements.loadingIndicator.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Show error message
 */
function showError(message) {
    const html = `
        <div class="error-message" role="alert">
            <div class="error-message__icon" aria-hidden="true">⚠️</div>
            <h3 class="error-message__title">Error</h3>
            <p class="error-message__text">${message}</p>
            <button class="error-message__retry" onclick="location.reload()">
                Refresh Page
            </button>
        </div>
    `;
    
    elements.resultsSection.innerHTML = html;
    elements.resultsSection.classList.add('show');
}

/**
 * Build GitHub issue URL with pre-populated data
 */
function buildGitHubIssueUrl(searchContext) {
    const baseUrl = 'https://github.com/jlillywh/Fidakune-Language/issues/new';
    const template = 'word_proposal.yml';
    
    let body = '';
    
    if (searchContext) {
        body += `## Search Context\n\n`;
        body += `**Search performed:** ${searchContext.query}\n`;
        body += `**Search timestamp:** ${new Date(searchContext.timestamp).toLocaleString()}\n\n`;
        
        const totalResults = searchContext.results.exactMatches.length + 
                           searchContext.results.relatedWords.length + 
                           searchContext.results.semanticMatches.length;
        
        if (totalResults > 0) {
            body += `**Related words found:** ${totalResults}\n`;
            
            if (searchContext.results.exactMatches.length > 0) {
                body += `- Exact matches: ${searchContext.results.exactMatches.map(e => e.word).join(', ')}\n`;
            }
            if (searchContext.results.relatedWords.length > 0) {
                body += `- Related words: ${searchContext.results.relatedWords.map(e => e.word).join(', ')}\n`;
            }
            if (searchContext.results.semanticMatches.length > 0) {
                body += `- Semantic matches: ${searchContext.results.semanticMatches.map(e => e.word).join(', ')}\n`;
            }
        } else {
            body += `**No related words found** - This may indicate a genuine gap in the lexicon.\n`;
        }
        
        body += `\n---\n\n`;
    }
    
    body += `I have searched the lexicon using the [Fidakune Lexicon Search tool](${window.location.href}) and believe this concept is not adequately covered.\n\n`;
    
    const params = new URLSearchParams({
        template: template,
        body: body
    });
    
    return `${baseUrl}?${params.toString()}`;
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Debounce function to limit API calls
 */
function debounce(func, wait) {
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