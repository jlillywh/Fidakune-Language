/**
 * Graph-Based Conceptual Search Engine
 * Implements efficient graph algorithms for conceptual search and traversal
 */

/**
 * GraphSearchEngine provides the core search functionality for the lexical graph
 */
class GraphSearchEngine {
    constructor() {
        // Core data structures
        this.nodes = new Map(); // id -> GraphNode
        this.edges = new Map(); // id -> GraphEdge
        this.outgoingEdges = new Map(); // nodeId -> [edges]
        this.incomingEdges = new Map(); // nodeId -> [edges]

        // Search indexes
        this.labelIndex = new Map(); // label -> [nodeIds]
        this.typeIndex = new Map(); // type -> [nodeIds]
        this.domainIndex = new Map(); // domain -> [nodeIds]

        // Enhanced performance tracking
        this.performanceMetrics = {
            totalSearches: 0,
            averageSearchTime: 0,
            cacheHits: 0,
            graphLoadTime: 0,
            memoryUsage: 0,
            indexBuildTime: 0,
            traversalTimes: [],
            searchComplexity: new Map(),
            slowQueries: []
        };

        // Performance monitoring
        this.performanceMonitor = {
            enabled: true,
            sampleRate: 0.1, // Sample 10% of searches for detailed analysis
            slowQueryThreshold: 100, // ms
            memoryCheckInterval: 30000 // 30 seconds
        };

        // Advanced caching system
        this.searchCache = new Map();
        this.resultCache = new Map();
        this.traversalCache = new Map();
        this.cacheMaxSize = 500;
        this.cacheExpirationTime = 10 * 60 * 1000; // 10 minutes
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalSize: 0
        };

        // Configuration
        this.maxTraversalDepth = 2;
        this.maxResultsPerCategory = 20;

        // State
        this.isLoaded = false;
        this.loadError = null;
    }

    /**
     * Load graph data - wrapper method for compatibility
     */
    async loadGraph(dataSource = 'lexical_graph.json') {
        return await this.loadGraphData(dataSource);
    }

    /**
     * Load graph data from lexical_graph.json
     */
    async loadGraphData(dataSource = 'lexical_graph.json') {
        const startTime = performance.now();

        try {
            console.log('Loading graph data from:', dataSource);

            let graphData;
            if (typeof dataSource === 'string') {
                // Load from URL/file
                const response = await fetch(dataSource);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                graphData = await response.json();
            } else {
                // Use provided data object
                graphData = dataSource;
            }

            // Validate graph data
            const validator = new GraphValidator();
            const validation = validator.validateGraphData(graphData);

            if (!validation.valid) {
                throw new Error(`Graph validation failed: ${validation.errors.join(', ')}`);
            }

            // Log warnings if any
            if (validation.warnings.length > 0) {
                console.warn('Graph validation warnings:', validation.warnings);
            }

            // Build graph structures
            this.buildGraphStructures(graphData);

            // Build search indexes
            this.buildSearchIndexes();

            // Update state
            this.isLoaded = true;
            this.loadError = null;

            const loadTime = performance.now() - startTime;
            this.performanceMetrics.graphLoadTime = loadTime;

            console.log(`Graph loaded successfully in ${loadTime.toFixed(2)}ms`);
            console.log(`Loaded ${this.nodes.size} nodes and ${this.edges.size} edges`);
            console.log('Validation stats:', validation.stats);

            return {
                success: true,
                loadTime: loadTime,
                stats: validation.stats,
                warnings: validation.warnings
            };

        } catch (error) {
            this.isLoaded = false;
            this.loadError = error;

            console.error('Failed to load graph data:', error);

            // Try fallback to cached data
            const fallbackResult = await this.tryFallbackData();
            if (fallbackResult.success) {
                return fallbackResult;
            }

            throw new GraphLoadError(`Failed to load graph data: ${error.message}`);
        }
    }

    /**
     * Build internal graph data structures from loaded data
     */
    buildGraphStructures(graphData) {
        // Clear existing data
        this.nodes.clear();
        this.edges.clear();
        this.outgoingEdges.clear();
        this.incomingEdges.clear();

        // Load nodes
        graphData.nodes.forEach(nodeData => {
            const node = new GraphNode(nodeData);
            this.nodes.set(node.id, node);

            // Initialize edge arrays
            this.outgoingEdges.set(node.id, []);
            this.incomingEdges.set(node.id, []);
        });

        // Load edges
        graphData.edges.forEach((edgeData) => {
            const edge = new GraphEdge(edgeData);
            const edgeId = `${edge.source}->${edge.target}:${edge.relationship}`;
            this.edges.set(edgeId, edge);

            // Add to outgoing/incoming edge maps
            if (this.outgoingEdges.has(edge.source)) {
                this.outgoingEdges.get(edge.source).push(edge);
            }

            if (this.incomingEdges.has(edge.target)) {
                this.incomingEdges.get(edge.target).push(edge);
            }
        });

        console.log(`Built graph structures: ${this.nodes.size} nodes, ${this.edges.size} edges`);
    }

    /**
     * Build search indexes for efficient lookup
     */
    buildSearchIndexes() {
        // Clear existing indexes
        this.labelIndex.clear();
        this.typeIndex.clear();
        this.domainIndex.clear();

        this.nodes.forEach((node, nodeId) => {
            // Label index (for fuzzy matching)
            const label = node.label.toLowerCase();
            if (!this.labelIndex.has(label)) {
                this.labelIndex.set(label, []);
            }
            this.labelIndex.get(label).push(nodeId);

            // Type index
            if (!this.typeIndex.has(node.type)) {
                this.typeIndex.set(node.type, []);
            }
            this.typeIndex.get(node.type).push(nodeId);

            // Domain index
            if (node.domain && !this.domainIndex.has(node.domain)) {
                this.domainIndex.set(node.domain, []);
            }
            if (node.domain) {
                this.domainIndex.get(node.domain).push(nodeId);
            }
        });

        console.log(`Built search indexes: ${this.labelIndex.size} labels, ${this.typeIndex.size} types, ${this.domainIndex.size} domains`);
    }

    /**
     * Try to load fallback data from cache or minimal dataset
     */
    async tryFallbackData() {
        try {
            // Try localStorage cache first
            const cachedData = this.getCachedGraphData();
            if (cachedData) {
                console.log('Loading from cached graph data');
                this.buildGraphStructures(cachedData);
                this.buildSearchIndexes();
                this.isLoaded = true;
                return {
                    success: true,
                    source: 'cache'
                };
            }

            // Try minimal emergency dataset
            const emergencyData = this.getEmergencyGraphData();
            console.log('Loading emergency graph data');
            this.buildGraphStructures(emergencyData);
            this.buildSearchIndexes();
            this.isLoaded = true;

            return {
                success: true,
                source: 'emergency',
                warning: 'Using minimal dataset'
            };

        } catch (error) {
            console.error('Fallback data loading failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get cached graph data from localStorage
     */
    getCachedGraphData() {
        try {
            const cached = localStorage.getItem('fidakune-graph-cache');
            if (!cached) return null;

            const cacheEntry = JSON.parse(cached);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (Date.now() - cacheEntry.timestamp < maxAge) {
                return cacheEntry.data;
            }

            // Remove expired cache
            localStorage.removeItem('fidakune-graph-cache');
            return null;

        } catch (error) {
            console.warn('Failed to retrieve cached graph data:', error);
            return null;
        }
    }

    /**
     * Cache graph data to localStorage
     */
    cacheGraphData(graphData) {
        try {
            const cacheEntry = {
                data: graphData,
                timestamp: Date.now(),
                version: '1.0'
            };

            localStorage.setItem('fidakune-graph-cache', JSON.stringify(cacheEntry));
            console.log('Graph data cached successfully');

        } catch (error) {
            console.warn('Failed to cache graph data:', error);
        }
    }

    /**
     * Get minimal emergency graph data
     */
    getEmergencyGraphData() {
        return {
            metadata: {
                version: '1.0-emergency',
                created: new Date().toISOString().split('T')[0],
                curated_by: 'Emergency Fallback',
                node_count: 6,
                edge_count: 4
            },
            nodes: [{
                id: 'fidakune_aqua',
                label: 'aqua',
                type: 'fidakune_word',
                definition: 'water',
                domain: 'Nature',
                pronunciation: '/ˈa.kwa/'
            }, {
                id: 'en_water',
                label: 'water',
                type: 'english_keyword',
                definition: 'clear liquid',
                domain: 'Nature'
            }, {
                id: 'fidakune_sole',
                label: 'sole',
                type: 'fidakune_root',
                definition: 'sun',
                domain: 'Nature',
                pronunciation: '/ˈso.le/'
            }, {
                id: 'en_sun',
                label: 'sun',
                type: 'english_keyword',
                definition: 'star at center of solar system',
                domain: 'Nature'
            }, {
                id: 'fidakune_ami',
                label: 'ami',
                type: 'fidakune_word',
                definition: 'friend',
                domain: 'Society',
                pronunciation: '/ˈa.mi/'
            }, {
                id: 'en_friend',
                label: 'friend',
                type: 'english_keyword',
                definition: 'person with mutual affection',
                domain: 'Society'
            }],
            edges: [{
                source: 'fidakune_aqua',
                target: 'en_water',
                relationship: 'is_a',
                strength: 1.0,
                description: 'aqua means water'
            }, {
                source: 'fidakune_sole',
                target: 'en_sun',
                relationship: 'is_a',
                strength: 1.0,
                description: 'sole means sun'
            }, {
                source: 'fidakune_ami',
                target: 'en_friend',
                relationship: 'is_a',
                strength: 1.0,
                description: 'ami means friend'
            }, {
                source: 'en_water',
                target: 'en_sun',
                relationship: 'is_related_to',
                strength: 0.3,
                description: 'basic natural elements'
            }]
        };
    }

    /**
     * Find starting nodes for a search query
     */
    findStartingNodes(query) {
        if (!this.isLoaded) {
            throw new GraphSearchError('Graph data not loaded');
        }

        const normalizedQuery = query.toLowerCase().trim();
        const matches = [];

        // Exact label matches (highest priority)
        if (this.labelIndex.has(normalizedQuery)) {
            const nodeIds = this.labelIndex.get(normalizedQuery);
            nodeIds.forEach(nodeId => {
                const node = this.nodes.get(nodeId);
                matches.push({
                    node: node,
                    score: 1.0,
                    matchType: 'exact_label',
                    matchField: 'label'
                });
            });
        }

        // If exact matches found, return them
        if (matches.length > 0) {
            return matches;
        }

        // Fuzzy label matches
        this.labelIndex.forEach((nodeIds, label) => {
            if (label.includes(normalizedQuery) || normalizedQuery.includes(label)) {
                const similarity = this.calculateStringSimilarity(normalizedQuery, label);
                if (similarity > 0.5) {
                    nodeIds.forEach(nodeId => {
                        const node = this.nodes.get(nodeId);
                        matches.push({
                            node: node,
                            score: similarity,
                            matchType: 'fuzzy_label',
                            matchField: 'label'
                        });
                    });
                }
            }
        });

        // Definition matches
        this.nodes.forEach((node, nodeId) => {
            const definitionMatch = node.definition.toLowerCase().includes(normalizedQuery);
            if (definitionMatch && !matches.some(m => m.node.id === nodeId)) {
                const similarity = this.calculateStringSimilarity(normalizedQuery, node.definition.toLowerCase());
                matches.push({
                    node: node,
                    score: similarity * 0.8, // Slightly lower than label matches
                    matchType: 'definition',
                    matchField: 'definition'
                });
            }
        });

        // Sort by score and return top matches
        return matches
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Limit to top 10 starting points
    }

    /**
     * Calculate string similarity using Jaccard similarity
     */
    calculateStringSimilarity(str1, str2) {
        const set1 = new Set(str1.split(''));
        const set2 = new Set(str2.split(''));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    /**
     * Perform breadth-first search traversal from starting nodes
     */
    traverseGraph(startingNodes, maxDepth = null) {
        if (!this.isLoaded) {
            throw new GraphSearchError('Graph data not loaded');
        }

        const depth = maxDepth || this.maxTraversalDepth;
        const queue = new Queue();
        const visited = new Set();
        const results = [];

        // Initialize queue with starting nodes
        startingNodes.forEach(({
            node,
            score,
            matchType,
            matchField
        }) => {
            queue.enqueue({
                node: node,
                depth: 0,
                path: [node.id],
                sourceScore: score,
                sourceMatchType: matchType,
                sourceMatchField: matchField
            });
        });

        while (!queue.isEmpty()) {
            const {
                node,
                depth: currentDepth,
                path,
                sourceScore,
                sourceMatchType
            } = queue.dequeue();

            if (node === null) continue;

            // Skip if we've already visited this node or exceeded max depth
            if (visited.has(node.id) || currentDepth > depth) {
                continue;
            }

            visited.add(node.id);

            // Get all outgoing edges from this node
            const outgoingEdges = this.getOutgoingEdges(node.id);

            outgoingEdges.forEach(edge => {
                const targetNode = this.getNode(edge.target);
                if (!targetNode) return;

                // Create result entry
                const result = {
                    source: node,
                    target: targetNode,
                    edge: edge,
                    relationship: edge.relationship,
                    strength: edge.strength,
                    depth: currentDepth + 1,
                    path: [...path, edge.target],
                    sourceScore: sourceScore,
                    sourceMatchType: sourceMatchType,
                    combinedScore: this.calculateCombinedScore(sourceScore, edge.strength, currentDepth + 1)
                };

                results.push(result);

                // Add target to queue for further exploration if within depth limit
                if (currentDepth + 1 < depth) {
                    queue.enqueue({
                        node: targetNode,
                        depth: currentDepth + 1,
                        path: [...path, edge.target],
                        sourceScore: sourceScore,
                        sourceMatchType: sourceMatchType
                    });
                }
            });

            // Also explore incoming edges (bidirectional traversal)
            const incomingEdges = this.getIncomingEdges(node.id);

            incomingEdges.forEach(edge => {
                const sourceNode = this.getNode(edge.source);
                if (!sourceNode) return;

                // Skip if this would create a cycle in the current path
                if (path.includes(edge.source)) return;

                // Create result entry (reverse direction)
                const result = {
                    source: sourceNode,
                    target: node,
                    edge: edge,
                    relationship: edge.relationship,
                    strength: edge.strength,
                    depth: currentDepth + 1,
                    path: [edge.source, ...path],
                    sourceScore: sourceScore,
                    sourceMatchType: sourceMatchType,
                    combinedScore: this.calculateCombinedScore(sourceScore, edge.strength, currentDepth + 1),
                    isReverse: true
                };

                results.push(result);

                // Add source to queue for further exploration if within depth limit
                if (currentDepth + 1 < depth) {
                    queue.enqueue({
                        node: sourceNode,
                        depth: currentDepth + 1,
                        path: [edge.source, ...path],
                        sourceScore: sourceScore,
                        sourceMatchType: sourceMatchType
                    });
                }
            });
        }

        return this.deduplicateResults(results);
    }

    /**
     * Perform conceptual search with graph traversal
     */
    search(query, options = {}) {
        const startTime = performance.now();

        try {
            // Check cache first
            const cacheKey = this.getCacheKey(query, options);
            const cachedResult = this.getCachedResult(cacheKey, 'search');

            if (cachedResult) {
                this.performanceMetrics.cacheHits++;
                this.recordSearchMetrics(query, startTime, performance.now(),
                    this.countTotalResults(cachedResult), true);
                return cachedResult;
            }

            // Find starting nodes
            const startingNodes = this.findStartingNodes(query);

            if (startingNodes.length === 0) {
                return this.createEmptySearchResult(query, 'No matching concepts found');
            }

            // Perform graph traversal
            const maxDepth = options.maxDepth || this.maxTraversalDepth;
            const traversalResults = this.traverseGraph(startingNodes, maxDepth);

            // Organize results by relationship type
            const organizedResults = this.organizeResults(traversalResults, options);

            // Create final search result
            const searchResult = {
                query: query,
                timestamp: new Date().toISOString(),
                startingNodes: startingNodes.map(sn => ({
                    id: sn.node.id,
                    label: sn.node.label,
                    score: sn.score,
                    matchType: sn.matchType
                })),
                results: organizedResults,
                totalResults: traversalResults.length,
                processingTime: performance.now() - startTime,
                options: options
            };

            // Cache the result
            this.setCachedResult(cacheKey, searchResult, 'search');

            // Record performance metrics
            const endTime = performance.now();
            this.recordSearchMetrics(query, startTime, endTime,
                this.countTotalResults(searchResult), false);

            return searchResult;

        } catch (error) {
            console.error('Search error:', error);
            return this.createEmptySearchResult(query, error.message);
        }
    }

    /**
     * Organize search results by relationship type with ranking
     */
    organizeResults(traversalResults, options = {}) {
        const organized = {
            directlyRelated: [], // is_a relationships
            componentRoots: [], // has_root relationships
            relatedIdeas: [] // is_related_to relationships
        };

        // Group results by relationship type
        traversalResults.forEach(result => {
            switch (result.relationship) {
                case 'is_a':
                    organized.directlyRelated.push(result);
                    break;
                case 'has_root':
                    organized.componentRoots.push(result);
                    break;
                case 'is_related_to':
                    organized.relatedIdeas.push(result);
                    break;
            }
        });

        // Rank and limit results in each category
        const maxResults = options.maxResultsPerCategory || this.maxResultsPerCategory;

        organized.directlyRelated = this.rankAndLimitResults(organized.directlyRelated, maxResults, 'is_a');
        organized.componentRoots = this.rankAndLimitResults(organized.componentRoots, maxResults, 'has_root');
        organized.relatedIdeas = this.rankAndLimitResults(organized.relatedIdeas, maxResults, 'is_related_to');

        return organized;
    }

    /**
     * Rank results within a category and limit to top N
     */
    rankAndLimitResults(results, maxResults, relationshipType) {
        // Sort by combined score (descending)
        const sorted = results.sort((a, b) => {
            // Primary sort: combined score
            if (a.combinedScore !== b.combinedScore) {
                return b.combinedScore - a.combinedScore;
            }

            // Secondary sort: relationship strength
            if (a.strength !== b.strength) {
                return b.strength - a.strength;
            }

            // Tertiary sort: depth (prefer closer connections)
            if (a.depth !== b.depth) {
                return a.depth - b.depth;
            }

            // Quaternary sort: node type preference
            return this.getNodeTypePreference(a.target.type) - this.getNodeTypePreference(b.target.type);
        });

        // Apply relationship-specific ranking adjustments
        const adjusted = this.applyRelationshipRanking(sorted, relationshipType);

        // Limit results and add ranking information
        return adjusted.slice(0, maxResults).map((result, index) => ({
            ...result,
            rank: index + 1,
            category: this.getRelationshipCategory(relationshipType),
            displayInfo: this.createResultDisplayInfo(result, index + 1)
        }));
    }

    /**
     * Apply relationship-specific ranking adjustments
     */
    applyRelationshipRanking(results, relationshipType) {
        switch (relationshipType) {
            case 'is_a':
                // For direct relationships, prefer exact translations and high-strength connections
                return results.sort((a, b) => {
                    // Boost exact translations (Fidakune <-> English)
                    const aIsTranslation = this.isTranslationPair(a.source, a.target);
                    const bIsTranslation = this.isTranslationPair(b.source, b.target);

                    if (aIsTranslation && !bIsTranslation) return -1;
                    if (!aIsTranslation && bIsTranslation) return 1;

                    return b.combinedScore - a.combinedScore;
                });

            case 'has_root':
                // For root relationships, prefer compound words and clear morphological connections
                return results.sort((a, b) => {
                    // Boost compound words
                    const aIsCompound = a.source.label.includes('-');
                    const bIsCompound = b.source.label.includes('-');

                    if (aIsCompound && !bIsCompound) return -1;
                    if (!aIsCompound && bIsCompound) return 1;

                    return b.combinedScore - a.combinedScore;
                });

            case 'is_related_to':
                // For conceptual relationships, prefer same-domain connections and higher strength
                return results.sort((a, b) => {
                    // Boost same-domain relationships
                    const aSameDomain = a.source.domain === a.target.domain;
                    const bSameDomain = b.source.domain === b.target.domain;

                    if (aSameDomain && !bSameDomain) return -1;
                    if (!aSameDomain && bSameDomain) return 1;

                    return b.combinedScore - a.combinedScore;
                });

            default:
                return results;
        }
    }
    
    /**
     * Get a node by ID
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }
    
    /**
     * Get outgoing edges for a node
     */
    getOutgoingEdges(nodeId) {
        return this.outgoingEdges.get(nodeId) || [];
    }

    /**
     * Get incoming edges for a node
     */
    getIncomingEdges(nodeId) {
        return this.incomingEdges.get(nodeId) || [];
    }
    
    /**
     * Calculate combined score based on source match score, edge strength, and depth
     */
    calculateCombinedScore(sourceScore, edgeStrength, depth) {
        // Decay score based on depth
        const depthDecay = Math.pow(0.7, depth - 1);

        // Combine source score, edge strength, and depth decay
        return sourceScore * edgeStrength * depthDecay;
    }
    
    /**
     * Remove duplicate results and keep the best scoring ones
     */
    deduplicateResults(results) {
        const resultMap = new Map();

        results.forEach(result => {
            const key = `${result.source.id}->${result.target.id}:${result.relationship}`;

            if (!resultMap.has(key) || resultMap.get(key).combinedScore < result.combinedScore) {
                resultMap.set(key, result);
            }
        });

        return Array.from(resultMap.values());
    }

    /**
     * Create cache key for search query and options
     */
    getCacheKey(query, options) {
        const optionsStr = JSON.stringify(options);
        return `${query.toLowerCase().trim()}:${optionsStr}`;
    }

    /**
     * Get cached result with access tracking
     */
    getCachedResult(cacheKey, cacheType = 'search') {
        const cache = this.getCacheByType(cacheType);
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheExpirationTime) {
            cached.accessCount = (cached.accessCount || 0) + 1;
            cached.lastAccessed = Date.now();
            this.cacheStats.hits++;
            return cached.result;
        }

        if (cached) {
            cache.delete(cacheKey); // Remove expired entry
        }

        this.cacheStats.misses++;
        return null;
    }

    /**
     * Set cached result with metadata
     */
    setCachedResult(cacheKey, result, cacheType = 'search') {
        const cache = this.getCacheByType(cacheType);

        // Evict old entries if needed
        this.evictLRUCacheEntries();

        cache.set(cacheKey, {
            result,
            timestamp: Date.now(),
            accessCount: 1,
            lastAccessed: Date.now(),
            size: this.estimateObjectSize(result)
        });

        this.cacheStats.totalSize++;
    }

    /**
     * Get cache by type
     */
    getCacheByType(type) {
        switch (type) {
            case 'result':
                return this.resultCache;
            case 'traversal':
                return this.traversalCache;
            default:
                return this.searchCache;
        }
    }
    
    /**
     * Intelligent cache eviction using LRU strategy
     */
    evictLRUCacheEntries() {
        const allCaches = [this.searchCache, this.resultCache, this.traversalCache];
        let totalSize = 0;

        // Calculate total cache size
        allCaches.forEach(cache => {
            totalSize += cache.size;
        });

        if (totalSize <= this.cacheMaxSize) return;

        // Collect all cache entries with timestamps
        const allEntries = [];

        allCaches.forEach((cache, cacheIndex) => {
            for (const [key, value] of cache.entries()) {
                allEntries.push({
                    key,
                    value,
                    cacheIndex,
                    timestamp: value.timestamp || 0,
                    accessCount: value.accessCount || 0
                });
            }
        });

        // Sort by LRU (least recently used + least accessed)
        allEntries.sort((a, b) => {
            const aScore = a.timestamp + (a.accessCount * 1000);
            const bScore = b.timestamp + (b.accessCount * 1000);
            return aScore - bScore;
        });

        // Evict oldest entries
        const entriesToEvict = totalSize - this.cacheMaxSize + 50; // Extra buffer
        for (let i = 0; i < Math.min(entriesToEvict, allEntries.length); i++) {
            const entry = allEntries[i];
            allCaches[entry.cacheIndex].delete(entry.key);
            this.cacheStats.evictions++;
        }
    }

    /**
     * Create empty search result for failed searches
     */
    createEmptySearchResult(query, reason) {
        return {
            query: query,
            timestamp: new Date().toISOString(),
            startingNodes: [],
            results: {
                directlyRelated: [],
                componentRoots: [],
                relatedIdeas: []
            },
            totalResults: 0,
            processingTime: 0,
            error: reason
        };
    }

    /**
     * Count total results in search result
     */
    countTotalResults(searchResult) {
        if (!searchResult || !searchResult.results) return 0;

        return (searchResult.results.directlyRelated ?.length || 0) +
            (searchResult.results.componentRoots ?.length || 0) +
            (searchResult.results.relatedIdeas ?.length || 0);
    }
    
    /**
     * Check if two nodes form a translation pair
     */
    isTranslationPair(node1, node2) {
        const type1 = node1.type || '';
        const type2 = node2.type || '';
        return (type1.startsWith('fidakune') && type2.startsWith('english')) ||
            (type1.startsWith('english') && type2.startsWith('fidakune'));
    }
    
    /**
     * Get node type preference for sorting (lower = higher preference)
     */
    getNodeTypePreference(nodeType) {
        const preferences = {
            'fidakune_word': 1,
            'fidakune_root': 2,
            'english_keyword': 3
        };
        return preferences[nodeType] || 4;
    }

    /**
     * Get human-readable category name for relationship type
     */
    getRelationshipCategory(relationshipType) {
        const categories = {
            'is_a': 'Directly Related Concepts',
            'has_root': 'Component Roots to Consider',
            'is_related_to': 'Related Ideas'
        };
        return categories[relationshipType] || 'Other Relationships';
    }

    /**
     * Create display information for a search result
     */
    createResultDisplayInfo(result, rank) {
        const sourceNode = this.getNode(result.source.id);
        const targetNode = this.getNode(result.target.id);
        
        return {
            rank: rank,
            source: {
                id: sourceNode.id,
                label: sourceNode.label,
                type: sourceNode.type,
                typeLabel: sourceNode.getTypeLabel ? sourceNode.getTypeLabel() : sourceNode.type,
                definition: sourceNode.definition,
                domain: sourceNode.domain,
                pronunciation: sourceNode.pronunciation
            },
            target: {
                id: targetNode.id,
                label: targetNode.label,
                type: targetNode.type,
                typeLabel: targetNode.getTypeLabel ? targetNode.getTypeLabel() : targetNode.type,
                definition: targetNode.definition,
                domain: targetNode.domain,
                pronunciation: targetNode.pronunciation
            },
            relationship: {
                type: result.relationship,
                label: result.edge.getRelationshipLabel ? result.edge.getRelationshipLabel() : result.relationship,
                description: result.edge.description,
                strength: result.strength
            },
            path: {
                nodeIds: result.path,
                depth: result.depth,
                pathDescription: this.createPathDescription(result.path)
            },
            scores: {
                combined: result.combinedScore,
                source: result.sourceScore,
                strength: result.strength,
                depth: result.depth
            },
            metadata: {
                isReverse: result.isReverse || false,
                sourceMatchType: result.sourceMatchType
            }
        };
    }

    /**
     * Create human-readable path description
     */
    createPathDescription(path) {
        if (path.length <= 2) {
            return 'Direct connection';
        }

        const pathNodes = path.map(nodeId => {
            const node = this.getNode(nodeId);
            return node ? node.label : nodeId;
        });

        return `Path: ${pathNodes.join(' → ')}`;
    }
    
    /**
     * Record performance metrics for a search
     */
    recordSearchMetrics(query, startTime, endTime, resultCount, fromCache = false) {
        const searchTime = endTime - startTime;

        this.performanceMetrics.totalSearches++;

        if (!fromCache) {
            const totalTime = this.performanceMetrics.averageSearchTime * (this.performanceMetrics.totalSearches - 1) + searchTime;
            this.performanceMetrics.averageSearchTime = totalTime / this.performanceMetrics.totalSearches;
            this.performanceMetrics.traversalTimes.push(searchTime);
            if (this.performanceMetrics.traversalTimes.length > 1000) {
                this.performanceMetrics.traversalTimes.shift();
            }
        }

        const complexity = this.calculateQueryComplexity(query, resultCount);
        const currentCount = this.performanceMetrics.searchComplexity.get(complexity) || 0;
        this.performanceMetrics.searchComplexity.set(complexity, currentCount + 1);

        if (searchTime > this.performanceMonitor.slowQueryThreshold) {
            this.performanceMetrics.slowQueries.push({
                query,
                searchTime,
                resultCount,
                timestamp: Date.now()
            });
        }

        if (Math.random() < this.performanceMonitor.sampleRate) {
            this.performDetailedAnalysis(query, searchTime, resultCount);
        }
    }

    /**
     * Calculate query complexity score
     */
    calculateQueryComplexity(query, resultCount) {
        let complexity = 'simple';
        if (query.length > 10 || resultCount > 50) {
            complexity = 'medium';
        }
        if (query.length > 20 || resultCount > 100 || query.includes(' ')) {
            complexity = 'complex';
        }
        return complexity;
    }
    
    /**
     * Perform detailed performance analysis
     */
    performDetailedAnalysis(query, searchTime, resultCount) {
        console.log(`Detailed analysis for query "${query}":`, {
            searchTime: `${searchTime.toFixed(2)}ms`,
            resultCount,
            cacheEfficiency: `${this.calculateCacheEfficiency().toFixed(1)}%`,
            memoryUsage: `${(this.estimateMemoryUsage() / 1024 / 1024).toFixed(2)}MB`
        });
    }
    
    /**
     * Estimate object size for memory tracking
     */
    estimateObjectSize(obj) {
        let size = 0;
        if (obj === null || obj === undefined) return 0;
        switch (typeof obj) {
            case 'boolean': size = 4; break;
            case 'number': size = 8; break;
            case 'string': size = obj.length * 2; break;
            case 'object':
                if (Array.isArray(obj)) {
                    size = obj.reduce((acc, item) => acc + this.estimateObjectSize(item), 0);
                } else {
                    size = Object.keys(obj).reduce((acc, key) => {
                        return acc + this.estimateObjectSize(key) + this.estimateObjectSize(obj[key]);
                    }, 0);
                }
                break;
        }
        return size;
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        if (config.maxTraversalDepth !== undefined) {
            this.maxTraversalDepth = Math.max(1, Math.min(5, config.maxTraversalDepth));
        }
        if (config.maxResultsPerCategory !== undefined) {
            this.maxResultsPerCategory = Math.max(5, Math.min(50, config.maxResultsPerCategory));
        }
        if (config.cacheMaxSize !== undefined) {
            this.cacheMaxSize = Math.max(100, Math.min(2000, config.cacheMaxSize));
        }
        if (config.cacheExpirationTime !== undefined) {
            this.cacheExpirationTime = Math.max(60000, config.cacheExpirationTime); // Min 1 minute
        }
    }

    /**
     * Start performance monitoring (stub method)
     */
    startPerformanceMonitoring() {
        console.log('Performance monitoring started');
        // Performance monitoring is already built into the search methods
    }

    /**
     * Optimize graph structures for better performance (stub method)
     */
    optimizeGraphStructures() {
        console.log('Graph structures optimized');
        // Graph structures are already optimized during loading
    }
}

/**
 * Custom error class for graph search operations
 */
class GraphSearchError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GraphSearchError';
    }
}

/**
 * Custom error class for graph loading operations
 */
class GraphLoadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GraphLoadError';
    }
}

/**
 * Simple queue implementation for BFS traversal
 */
class Queue {
    constructor() {
        this.items = [];
        this.head = 0;
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }

        const item = this.items[this.head];
        this.head++;

        // Reset array when it gets too sparse to save memory
        if (this.head > this.items.length / 2) {
            this.items = this.items.slice(this.head);
            this.head = 0;
        }

        return item;
    }

    isEmpty() {
        return this.head >= this.items.length;
    }

    size() {
        return this.items.length - this.head;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GraphSearchEngine,
        GraphSearchError,
        GraphLoadError,
        Queue
    };
}