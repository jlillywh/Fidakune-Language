/**
 * Comprehensive test suite for GraphSearchEngine
 */

// Test data - simplified version of lexical_graph.json
const testGraphData = {
    metadata: {
        version: '1.0-test',
        created: '2024-12-19',
        curated_by: 'Test Suite',
        node_count: 8,
        edge_count: 10
    },
    nodes: [
        {
            id: 'fidakune_aqua',
            label: 'aqua',
            type: 'fidakune_word',
            definition: 'water',
            domain: 'Nature',
            pronunciation: '/ˈa.kwa/'
        },
        {
            id: 'en_water',
            label: 'water',
            type: 'english_keyword',
            definition: 'clear liquid essential for life',
            domain: 'Nature'
        },
        {
            id: 'fidakune_sole',
            label: 'sole',
            type: 'fidakune_root',
            definition: 'sun',
            domain: 'Nature',
            pronunciation: '/ˈso.le/'
        },
        {
            id: 'fidakune_lum',
            label: 'lum',
            type: 'fidakune_root',
            definition: 'light',
            domain: 'Nature',
            pronunciation: '/lum/'
        },
        {
            id: 'fidakune_sole_lum',
            label: 'sole-lum',
            type: 'fidakune_word',
            definition: 'hope',
            domain: 'Emotion',
            pronunciation: '/ˈso.le.lum/'
        },
        {
            id: 'en_hope',
            label: 'hope',
            type: 'english_keyword',
            definition: 'feeling of expectation and desire for positive outcome',
            domain: 'Emotion'
        },
        {
            id: 'en_light',
            label: 'light',
            type: 'english_keyword',
            definition: 'electromagnetic radiation visible to human eye',
            domain: 'Nature'
        },
        {
            id: 'en_optimism',
            label: 'optimism',
            type: 'english_keyword',
            definition: 'hopefulness and confidence about future',
            domain: 'Emotion'
        }
    ],
    edges: [
        {
            source: 'fidakune_aqua',
            target: 'en_water',
            relationship: 'is_a',
            strength: 1.0,
            description: 'aqua means water'
        },
        {
            source: 'fidakune_sole_lum',
            target: 'fidakune_sole',
            relationship: 'has_root',
            strength: 1.0,
            description: 'sole-lum contains the root sole'
        },
        {
            source: 'fidakune_sole_lum',
            target: 'fidakune_lum',
            relationship: 'has_root',
            strength: 1.0,
            description: 'sole-lum contains the root lum'
        },
        {
            source: 'fidakune_sole_lum',
            target: 'en_hope',
            relationship: 'is_a',
            strength: 1.0,
            description: 'sole-lum means hope'
        },
        {
            source: 'fidakune_sole',
            target: 'en_light',
            relationship: 'is_related_to',
            strength: 0.8,
            description: 'sun produces light'
        },
        {
            source: 'fidakune_lum',
            target: 'en_light',
            relationship: 'is_a',
            strength: 1.0,
            description: 'lum means light'
        },
        {
            source: 'en_hope',
            target: 'en_optimism',
            relationship: 'is_related_to',
            strength: 0.8,
            description: 'hope and optimism are closely related concepts'
        },
        {
            source: 'fidakune_sole_lum',
            target: 'en_optimism',
            relationship: 'is_related_to',
            strength: 0.7,
            description: 'hope (sole-lum) relates to optimism'
        }
    ]
};

/**
 * Run comprehensive GraphSearchEngine tests
 */
function runGraphSearchEngineTests() {
    console.log('🔍 Running GraphSearchEngine Tests...\n');
    
    testGraphLoading();
    testSearchIndexing();
    testStartingNodeFinding();
    testGraphTraversal();
    testResultOrganization();
    testSearchCaching();
    testPerformanceMetrics();
    testErrorHandling();
    
    console.log('\n✅ All GraphSearchEngine tests completed!');
}

async function testGraphLoading() {
    console.log('Testing graph loading...');
    
    const engine = new GraphSearchEngine();
    
    // Test successful loading
    const loadResult = await engine.loadGraphData(testGraphData);
    console.assert(loadResult.success, 'Graph loading should succeed');
    console.assert(engine.isReady(), 'Engine should be ready after loading');
    console.assert(engine.nodes.size === 8, 'Should load correct number of nodes');
    console.assert(engine.edges.size === 8, 'Should load correct number of edges');
    
    // Test graph statistics
    const stats = engine.getGraphStats();
    console.assert(stats.totalNodes === 8, 'Stats should show correct node count');
    console.assert(stats.totalEdges === 8, 'Stats should show correct edge count');
    console.assert(stats.nodesByType['fidakune_word'] === 2, 'Should count Fidakune words correctly');
    console.assert(stats.nodesByType['english_keyword'] === 4, 'Should count English keywords correctly');
    
    console.log('✅ Graph loading tests passed');
}

async function testSearchIndexing() {
    console.log('Testing search indexing...');
    
    const engine = new GraphSearchEngine();
    await engine.loadGraphData(testGraphData);
    
    // Test label index
    console.assert(engine.labelIndex.has('aqua'), 'Label index should contain Fidakune words');
    console.assert(engine.labelIndex.has('water'), 'Label index should contain English words');
    console.assert(engine.labelIndex.get('aqua').includes('fidakune_aqua'), 'Label index should map to correct node ID');
    
    // Test type index
    console.assert(engine.typeIndex.has('fidakune_word'), 'Type index should contain word types');
    console.assert(engine.typeIndex.get('fidakune_word').length === 2, 'Type index should count correctly');
    
    // Test domain index
    console.assert(engine.domainIndex.has('Nature'), 'Domain index should contain domains');
    console.assert(engine.domainIndex.get('Nature').length === 5, 'Domain index should count correctly');
    
    console.log('✅ Search indexing tests passed');
}

async function testStartingNodeFinding() {
    console.log('Testing starting node finding...');
    
    const engine = new GraphSearchEngine();
    await engine.loadGraphData(testGraphData);
    
    // Test exact label match
    const exactMatches = engine.findStartingNodes('aqua');
    console.assert(exactMatches.length > 0, 'Should find exact matches');
    console.assert(exactMatches[0].node.id === 'fidakune_aqua', 'Should find correct node');
    console.assert(exactMatches[0].score === 1.0, 'Exact match should have score 1.0');
    console.assert(exactMatches[0].matchType === 'exact_label', 'Should identify match type correctly');
    
    // Test definition match
    const definitionMatches = engine.findStartingNodes('clear liquid');
    console.assert(definitionMatches.length > 0, 'Should find definition matches');
    console.assert(definitionMatches.some(m => m.node.id === 'en_water'), 'Should find water by definition');
    
    // Test no matches
    const noMatches = engine.findStartingNodes('nonexistent');
    console.assert(noMatches.length === 0, 'Should return empty array for no matches');
    
    console.log('✅ Starting node finding tests passed');
}

async function testGraphTraversal() {
    console.log('Testing graph traversal...');
    
    const engine = new GraphSearchEngine();
    await engine.loadGraphData(testGraphData);
    
    // Test traversal from a starting node
    const startingNodes = engine.findStartingNodes('sole-lum');
    console.assert(startingNodes.length > 0, 'Should find starting node for sole-lum');
    
    const traversalResults = engine.traverseGraph(startingNodes, 2);
    console.assert(traversalResults.length > 0, 'Traversal should return results');
    
    // Check that we find expected relationships
    const hasRootResults = traversalResults.filter(r => r.relationship === 'has_root');
    console.assert(hasRootResults.length >= 2, 'Should find has_root relationships for compound word');
    
    const isAResults = traversalResults.filter(r => r.relationship === 'is_a');
    console.assert(isAResults.length >= 1, 'Should find is_a relationships');
    
    const relatedResults = traversalResults.filter(r => r.relationship === 'is_related_to');
    console.assert(relatedResults.length >= 1, 'Should find is_related_to relationships');
    
    // Check path tracking
    const resultWithPath = traversalResults.find(r => r.path.length > 2);
    if (resultWithPath) {
        console.assert(resultWithPath.path.includes('fidakune_sole_lum'), 'Path should include starting node');
        console.assert(resultWithPath.depth > 1, 'Multi-step path should have depth > 1');
    }
    
    console.log('✅ Graph traversal tests passed');
}

async function testResultOrganization() {
    console.log('Testing result organization...');
    
    const engine = new GraphSearchEngine();
    await engine.loadGraphData(testGraphData);
    
    // Perform a search that should return multiple relationship types
    const searchResult = await engine.search('sole-lum');
    console.assert(searchResult.results, 'Search should return organized results');
    
    const results = searchResult.results;
    console.assert(results.directlyRelated !== undefined, 'Should have directlyRelated category');
    console.assert(results.componentRoots !== undefined, 'Should have componentRoots category');
    console.assert(results.relatedIdeas !== undefined, 'Should have relatedIdeas category');
    
    // Check that results are properly categorized
    if (results.componentRoots.length > 0) {
        const rootResult = results.componentRoots[0];
        console.assert(rootResult.relationship === 'has_root', 'Component roots should contain has_root relationships');
        console.assert(rootResult.category === 'Component Roots to Consider', 'Should have correct category label');
        console.assert(rootResult.rank >= 1, 'Should have ranking information');
        console.assert(rootResult.displayInfo, 'Should have display information');
    }
    
    if (results.directlyRelated.length > 0) {
        const directResult = results.directlyRelated[0];
        console.assert(directResult.relationship === 'is_a', 'Directly related should contain is_a relationships');
        console.assert(directResult.displayInfo.target.label, 'Display info should include target label');
    }
    
    console.log('✅ Result organization tests passed');
}

async function testSearchCaching() {
    console.log('Testing search caching...');
    
    const engine = new GraphSearchEngine();
    await engine.loadGraphData(testGraphData);
    
    // First search
    const result1 = await engine.search('aqua');
    const metrics1 = engine.getPerformanceMetrics();
    
    // Second identical search (should hit cache)
    const result2 = await engine.search('aqua');
    const metrics2 = engine.getPerformanceMetrics();
    
    console.assert(metrics2.cacheHits > metrics1.cacheHits, 'Should register cache hit');
    console.assert(JSON.stringify(result1) === JSON.stringify(result2), 'Cached results should be identical');
    
    // Clear cache and verify
    engine.clearSearchCache();
    const result3 = await engine.search('aqua');
    console.assert(result3.results, 'Should still work after cache clear');
    
    console.log('✅ Search caching tests passed');
}

async function testPerformanceMetrics() {
    console.log('Testing performance metrics...');
    
    const engine = new GraphSearchEngine();
    await engine.loadGraphData(testGraphData);
    
    // Perform multiple searches
    await engine.search('aqua');
    await engine.search('water');
    await engine.search('hope');
    
    const metrics = engine.getPerformanceMetrics();
    console.assert(metrics.totalSearches >= 3, 'Should track total searches');
    console.assert(metrics.averageSearchTime > 0, 'Should calculate average search time');
    console.assert(metrics.graphLoadTime > 0, 'Should track graph load time');
    
    const analytics = engine.getSearchAnalytics();
    console.assert(analytics.performanceMetrics, 'Analytics should include performance metrics');
    console.assert(analytics.cacheStats, 'Analytics should include cache statistics');
    console.assert(analytics.graphStats, 'Analytics should include graph statistics');
    
    console.log('✅ Performance metrics tests passed');
}

async function testErrorHandling() {
    console.log('Testing error handling...');
    
    const engine = new GraphSearchEngine();
    
    // Test search without loaded data
    try {
        engine.findStartingNodes('test');
        console.assert(false, 'Should throw error when graph not loaded');
    } catch (error) {
        console.assert(error.name === 'GraphSearchError', 'Should throw GraphSearchError');
    }
    
    // Test invalid graph data
    const invalidGraphData = {
        metadata: { version: '1.0' },
        nodes: [{ id: 'test' }], // Missing required fields
        edges: []
    };
    
    try {
        await engine.loadGraphData(invalidGraphData);
        console.assert(false, 'Should throw error for invalid graph data');
    } catch (error) {
        console.assert(error.message.includes('validation failed'), 'Should indicate validation failure');
    }
    
    // Test fallback to emergency data
    const engineWithFallback = new GraphSearchEngine();
    
    // Mock failed fetch by providing invalid URL
    try {
        await engineWithFallback.loadGraphData('nonexistent-file.json');
    } catch (error) {
        // Should attempt fallback
        console.assert(error.name === 'GraphLoadError', 'Should throw GraphLoadError for failed loading');
    }
    
    console.log('✅ Error handling tests passed');
}

async function testAdvancedSearchFeatures() {
    console.log('Testing advanced search features...');
    
    const engine = new GraphSearchEngine();
    await engine.loadGraphData(testGraphData);
    
    // Test search with options
    const searchResult = await engine.search('hope', {
        maxDepth: 1,
        maxResultsPerCategory: 5
    });
    
    console.assert(searchResult.options.maxDepth === 1, 'Should respect maxDepth option');
    console.assert(searchResult.options.maxResultsPerCategory === 5, 'Should respect maxResultsPerCategory option');
    
    // Test configuration updates
    engine.updateConfig({
        maxTraversalDepth: 3,
        maxResultsPerCategory: 10,
        cacheMaxSize: 50
    });
    
    console.assert(engine.maxTraversalDepth === 3, 'Should update max traversal depth');
    console.assert(engine.maxResultsPerCategory === 10, 'Should update max results per category');
    console.assert(engine.cacheMaxSize === 50, 'Should update cache max size');
    
    // Test node and edge retrieval methods
    const aquaNode = engine.getNode('fidakune_aqua');
    console.assert(aquaNode && aquaNode.label === 'aqua', 'Should retrieve node by ID');
    
    const fidakumeWords = engine.getNodesByType('fidakune_word');
    console.assert(fidakumeWords.length === 2, 'Should retrieve nodes by type');
    
    const natureNodes = engine.getNodesByDomain('Nature');
    console.assert(natureNodes.length === 5, 'Should retrieve nodes by domain');
    
    const outgoingEdges = engine.getOutgoingEdges('fidakune_sole_lum');
    console.assert(outgoingEdges.length >= 3, 'Should retrieve outgoing edges');
    
    console.log('✅ Advanced search features tests passed');
}

/**
 * Run all tests
 */
async function runAllGraphSearchEngineTests() {
    console.log('🚀 Running Comprehensive GraphSearchEngine Tests...\n');
    
    try {
        await runGraphSearchEngineTests();
        await testAdvancedSearchFeatures();
        
        console.log('\n🎉 All GraphSearchEngine tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        throw error;
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllGraphSearchEngineTests,
        runGraphSearchEngineTests,
        testGraphData
    };
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        runAllGraphSearchEngineTests();
    });
}