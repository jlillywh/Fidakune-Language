/**
 * Unit Tests for Graph Algorithm Components
 * Tests the core graph traversal, search, and data structure algorithms
 */

class GraphAlgorithmTests {
    constructor() {
        this.testResults = [];
        this.mockData = this.createMockGraphData();
    }
    
    createMockGraphData() {
        return {
            metadata: {
                version: "test-1.0",
                created: new Date().toISOString(),
                curated_by: "Test Suite",
                node_count: 10,
                edge_count: 12
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
                    id: "en_heart",
                    label: "heart",
                    type: "english_keyword",
                    definition: "organ that pumps blood",
                    domain: "Body"
                },
                {
                    id: "en_stone",
                    label: "stone",
                    type: "english_keyword",
                    definition: "hard mineral matter",
                    domain: "Nature"
                },
                {
                    id: "en_grief",
                    label: "grief",
                    type: "english_keyword",
                    definition: "deep sorrow",
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
                    source: "fidakune_kore",
                    target: "en_heart",
                    relationship: "is_a",
                    strength: 1.0,
                    description: "kore means heart"
                },
                {
                    source: "fidakune_pet",
                    target: "en_stone",
                    relationship: "is_a",
                    strength: 1.0,
                    description: "pet means stone"
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
                },
                {
                    source: "en_grief",
                    target: "en_heart",
                    relationship: "is_related_to",
                    strength: 0.7,
                    description: "grief affects the heart"
                },
                {
                    source: "fidakune_aqua",
                    target: "fidakune_sole",
                    relationship: "is_related_to",
                    strength: 0.5,
                    description: "water and sun are natural elements"
                },
                {
                    source: "en_water",
                    target: "en_sun",
                    relationship: "is_related_to",
                    strength: 0.5,
                    description: "water and sun are natural elements"
                },
                {
                    source: "fidakune_kore",
                    target: "fidakune_pet",
                    relationship: "is_related_to",
                    strength: 0.3,
                    description: "both are roots used in compounds"
                },
                {
                    source: "en_heart",
                    target: "en_stone",
                    relationship: "is_related_to",
                    strength: 0.2,
                    description: "metaphorical connection in grief concept"
                }
            ]
        };
    }
    
    // Test Graph Data Structure Creation
    testGraphDataStructure() {
        const test = {
            name: 'Graph Data Structure Creation',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            // Test node creation
            if (typeof GraphNode !== 'undefined') {
                const node = new GraphNode(this.mockData.nodes[0]);
                test.details.nodeCreation = node.id === 'fidakune_aqua';
            } else {
                test.details.nodeCreation = false;
                test.details.nodeCreationError = 'GraphNode class not available';
            }
            
            // Test edge creation
            if (typeof GraphEdge !== 'undefined') {
                const edge = new GraphEdge(this.mockData.edges[0]);
                test.details.edgeCreation = edge.source === 'fidakune_aqua';
            } else {
                test.details.edgeCreation = false;
                test.details.edgeCreationError = 'GraphEdge class not available';
            }
            
            test.passed = test.details.nodeCreation && test.details.edgeCreation;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Graph Loading and Indexing
    async testGraphLoading() {
        const test = {
            name: 'Graph Loading and Indexing',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            if (typeof GraphSearchEngine === 'undefined') {
                test.error = 'GraphSearchEngine not available';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            const engine = new GraphSearchEngine();
            
            // Test graph loading
            const loadStart = performance.now();
            await engine.loadGraph(this.mockData);
            const loadEnd = performance.now();
            
            test.details.loadTime = loadEnd - loadStart;
            test.details.loadTimeAcceptable = test.details.loadTime < 1000; // Should load in under 1 second
            
            // Test node indexing
            const nodeCount = engine.graph ? engine.graph.size : 0;
            test.details.nodesLoaded = nodeCount;
            test.details.expectedNodes = this.mockData.nodes.length;
            test.details.nodesIndexedCorrectly = nodeCount === this.mockData.nodes.length;
            
            // Test reverse indexing
            if (engine.reverseIndex) {
                const indexSize = engine.reverseIndex.size;
                test.details.reverseIndexSize = indexSize;
                test.details.reverseIndexWorking = indexSize > 0;
            } else {
                test.details.reverseIndexWorking = false;
            }
            
            test.passed = test.details.loadTimeAcceptable && 
                          test.details.nodesIndexedCorrectly && 
                          test.details.reverseIndexWorking;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Breadth-First Search Algorithm
    async testBFSTraversal() {
        const test = {
            name: 'Breadth-First Search Traversal',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            if (typeof GraphSearchEngine === 'undefined') {
                test.error = 'GraphSearchEngine not available';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            const engine = new GraphSearchEngine();
            await engine.loadGraph(this.mockData);
            
            // Test BFS from a known starting point
            const searchStart = performance.now();
            const results = await engine.search('aqua', 2); // Search with depth 2
            const searchEnd = performance.now();
            
            test.details.searchTime = searchEnd - searchStart;
            test.details.searchTimeAcceptable = test.details.searchTime < 500; // Should search in under 500ms
            
            // Verify results structure
            test.details.hasResults = results !== null && typeof results === 'object';
            
            if (results) {
                test.details.hasDirectlyRelated = Array.isArray(results.directlyRelated);
                test.details.hasComponentRoots = Array.isArray(results.componentRoots);
                test.details.hasRelatedIdeas = Array.isArray(results.relatedIdeas);
                
                // Count total results
                const totalResults = (results.directlyRelated?.length || 0) +
                                   (results.componentRoots?.length || 0) +
                                   (results.relatedIdeas?.length || 0);
                test.details.totalResults = totalResults;
                test.details.hasReasonableResults = totalResults > 0 && totalResults < 100;
                
                // Test depth limiting
                if (results.directlyRelated && results.directlyRelated.length > 0) {
                    const maxDepth = Math.max(...results.directlyRelated.map(r => r.depth || 0));
                    test.details.maxDepth = maxDepth;
                    test.details.depthLimitRespected = maxDepth <= 2;
                } else {
                    test.details.depthLimitRespected = true; // No results to violate depth
                }
            }
            
            test.passed = test.details.searchTimeAcceptable &&
                          test.details.hasResults &&
                          test.details.hasDirectlyRelated &&
                          test.details.hasComponentRoots &&
                          test.details.hasRelatedIdeas &&
                          test.details.hasReasonableResults &&
                          test.details.depthLimitRespected;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Result Organization and Ranking
    async testResultOrganization() {
        const test = {
            name: 'Result Organization and Ranking',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            if (typeof GraphSearchEngine === 'undefined') {
                test.error = 'GraphSearchEngine not available';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            const engine = new GraphSearchEngine();
            await engine.loadGraph(this.mockData);
            
            // Search for a term that should have results in multiple categories
            const results = await engine.search('kore-pet');
            
            if (!results) {
                test.error = 'No search results returned';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            // Test category organization
            test.details.categoriesPresent = {
                directlyRelated: results.directlyRelated && results.directlyRelated.length > 0,
                componentRoots: results.componentRoots && results.componentRoots.length > 0,
                relatedIdeas: results.relatedIdeas && results.relatedIdeas.length > 0
            };
            
            // Test result ranking within categories
            if (results.directlyRelated && results.directlyRelated.length > 1) {
                const strengths = results.directlyRelated.map(r => r.strength || 0);
                const isSorted = strengths.every((strength, i) => 
                    i === 0 || strengths[i-1] >= strength);
                test.details.directlyRelatedSorted = isSorted;
            } else {
                test.details.directlyRelatedSorted = true; // Can't test sorting with < 2 items
            }
            
            // Test relationship type accuracy
            if (results.componentRoots && results.componentRoots.length > 0) {
                const hasRootRelationships = results.componentRoots.every(r => 
                    r.relationship === 'has_root');
                test.details.rootRelationshipsCorrect = hasRootRelationships;
            } else {
                test.details.rootRelationshipsCorrect = true;
            }
            
            // Test strength values
            const allResults = [
                ...(results.directlyRelated || []),
                ...(results.componentRoots || []),
                ...(results.relatedIdeas || [])
            ];
            
            const validStrengths = allResults.every(r => {
                const strength = r.strength || 0;
                return strength >= 0 && strength <= 1;
            });
            test.details.strengthValuesValid = validStrengths;
            
            test.passed = Object.values(test.details.categoriesPresent).some(Boolean) &&
                          test.details.directlyRelatedSorted &&
                          test.details.rootRelationshipsCorrect &&
                          test.details.strengthValuesValid;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Path Tracking
    async testPathTracking() {
        const test = {
            name: 'Path Tracking in Graph Traversal',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            if (typeof GraphSearchEngine === 'undefined') {
                test.error = 'GraphSearchEngine not available';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            const engine = new GraphSearchEngine();
            await engine.loadGraph(this.mockData);
            
            // Search for a term that should have multi-hop paths
            const results = await engine.search('kore');
            
            if (!results) {
                test.error = 'No search results returned';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            // Check if results have path information
            const allResults = [
                ...(results.directlyRelated || []),
                ...(results.componentRoots || []),
                ...(results.relatedIdeas || [])
            ];
            
            test.details.totalResults = allResults.length;
            
            if (allResults.length > 0) {
                const resultsWithPaths = allResults.filter(r => r.path && Array.isArray(r.path));
                test.details.resultsWithPaths = resultsWithPaths.length;
                test.details.pathTrackingWorking = resultsWithPaths.length > 0;
                
                // Test path validity
                if (resultsWithPaths.length > 0) {
                    const validPaths = resultsWithPaths.every(r => {
                        return r.path.length >= 1 && // At least source node
                               r.path.every(nodeId => typeof nodeId === 'string');
                    });
                    test.details.pathsValid = validPaths;
                    
                    // Test path lengths are reasonable
                    const maxPathLength = Math.max(...resultsWithPaths.map(r => r.path.length));
                    test.details.maxPathLength = maxPathLength;
                    test.details.pathLengthReasonable = maxPathLength <= 5; // Reasonable for depth 2 search
                } else {
                    test.details.pathsValid = false;
                    test.details.pathLengthReasonable = false;
                }
            } else {
                test.details.pathTrackingWorking = false;
                test.details.pathsValid = false;
                test.details.pathLengthReasonable = false;
            }
            
            test.passed = test.details.pathTrackingWorking &&
                          test.details.pathsValid &&
                          test.details.pathLengthReasonable;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Performance with Large Dataset
    async testLargeDatasetPerformance() {
        const test = {
            name: 'Large Dataset Performance',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            if (typeof GraphSearchEngine === 'undefined') {
                test.error = 'GraphSearchEngine not available';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            // Generate large dataset
            const largeDataset = this.generateLargeDataset(1000, 2000);
            test.details.generatedNodes = largeDataset.nodes.length;
            test.details.generatedEdges = largeDataset.edges.length;
            
            const engine = new GraphSearchEngine();
            
            // Test loading performance
            const loadStart = performance.now();
            await engine.loadGraph(largeDataset);
            const loadEnd = performance.now();
            
            test.details.loadTime = loadEnd - loadStart;
            test.details.loadTimeAcceptable = test.details.loadTime < 5000; // 5 seconds max
            
            // Test search performance
            const searchStart = performance.now();
            const results = await engine.search('node_500'); // Search for middle node
            const searchEnd = performance.now();
            
            test.details.searchTime = searchEnd - searchStart;
            test.details.searchTimeAcceptable = test.details.searchTime < 2000; // 2 seconds max
            
            // Test memory usage if available
            if (performance.memory) {
                test.details.memoryUsed = performance.memory.usedJSHeapSize;
                test.details.memoryReasonable = test.details.memoryUsed < 100 * 1024 * 1024; // 100MB max
            } else {
                test.details.memoryReasonable = true; // Can't test if not available
            }
            
            test.passed = test.details.loadTimeAcceptable &&
                          test.details.searchTimeAcceptable &&
                          test.details.memoryReasonable;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Edge Cases
    async testEdgeCases() {
        const test = {
            name: 'Edge Cases and Error Handling',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            if (typeof GraphSearchEngine === 'undefined') {
                test.error = 'GraphSearchEngine not available';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            const engine = new GraphSearchEngine();
            await engine.loadGraph(this.mockData);
            
            // Test empty search
            const emptyResults = await engine.search('');
            test.details.emptySearchHandled = emptyResults !== null;
            
            // Test non-existent term
            const nonExistentResults = await engine.search('nonexistentterm12345');
            test.details.nonExistentTermHandled = nonExistentResults !== null;
            
            // Test very long search term
            const longTerm = 'a'.repeat(1000);
            const longTermResults = await engine.search(longTerm);
            test.details.longTermHandled = longTermResults !== null;
            
            // Test special characters
            const specialCharResults = await engine.search('<script>alert("test")</script>');
            test.details.specialCharsHandled = specialCharResults !== null;
            
            // Test null/undefined search
            try {
                const nullResults = await engine.search(null);
                test.details.nullSearchHandled = nullResults !== null;
            } catch (error) {
                test.details.nullSearchHandled = true; // Throwing error is acceptable
            }
            
            // Test maximum depth
            const maxDepthResults = await engine.search('aqua', 10); // Very high depth
            test.details.maxDepthHandled = maxDepthResults !== null;
            
            test.passed = test.details.emptySearchHandled &&
                          test.details.nonExistentTermHandled &&
                          test.details.longTermHandled &&
                          test.details.specialCharsHandled &&
                          test.details.nullSearchHandled &&
                          test.details.maxDepthHandled;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Helper method to generate large dataset
    generateLargeDataset(nodeCount, edgeCount) {
        const nodes = [];
        const edges = [];
        
        // Generate nodes
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                id: `node_${i}`,
                label: `label_${i}`,
                type: i % 3 === 0 ? 'fidakune_root' : 'fidakune_word',
                definition: `definition for node ${i}`,
                domain: ['Nature', 'Society', 'Emotion', 'Body'][i % 4],
                pronunciation: `/ˈnode.${i}/`
            });
        }
        
        // Generate edges
        const relationships = ['is_a', 'has_root', 'is_related_to'];
        for (let i = 0; i < edgeCount && i < nodeCount - 1; i++) {
            const sourceIndex = i;
            const targetIndex = Math.min(i + 1 + Math.floor(Math.random() * 5), nodeCount - 1);
            
            edges.push({
                source: `node_${sourceIndex}`,
                target: `node_${targetIndex}`,
                relationship: relationships[i % relationships.length],
                strength: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
                description: `Connection between node ${sourceIndex} and ${targetIndex}`
            });
        }
        
        return {
            metadata: {
                version: "test-large-1.0",
                created: new Date().toISOString(),
                curated_by: "Test Suite",
                node_count: nodeCount,
                edge_count: edgeCount
            },
            nodes,
            edges
        };
    }
    
    // Run all tests
    async runAllTests() {
        console.log('Starting Graph Algorithm Unit Tests...');
        
        const tests = [
            () => this.testGraphDataStructure(),
            () => this.testGraphLoading(),
            () => this.testBFSTraversal(),
            () => this.testResultOrganization(),
            () => this.testPathTracking(),
            () => this.testLargeDatasetPerformance(),
            () => this.testEdgeCases()
        ];
        
        for (const testFunction of tests) {
            try {
                await testFunction();
            } catch (error) {
                console.error('Test execution error:', error);
            }
        }
        
        return this.getTestSummary();
    }
    
    // Get test summary
    getTestSummary() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(t => t.passed).length;
        const failed = total - passed;
        
        return {
            total,
            passed,
            failed,
            passRate: total > 0 ? (passed / total * 100).toFixed(2) + '%' : '0%',
            results: this.testResults
        };
    }
    
    // Generate detailed report
    generateReport() {
        const summary = this.getTestSummary();
        
        console.log('\n=== Graph Algorithm Unit Test Report ===');
        console.log(`Total Tests: ${summary.total}`);
        console.log(`Passed: ${summary.passed}`);
        console.log(`Failed: ${summary.failed}`);
        console.log(`Pass Rate: ${summary.passRate}`);
        console.log('\n=== Test Details ===');
        
        this.testResults.forEach((test, index) => {
            console.log(`\n${index + 1}. ${test.name}`);
            console.log(`   Status: ${test.passed ? '✅ PASSED' : '❌ FAILED'}`);
            
            if (test.error) {
                console.log(`   Error: ${test.error}`);
            }
            
            if (test.details && Object.keys(test.details).length > 0) {
                console.log('   Details:');
                Object.entries(test.details).forEach(([key, value]) => {
                    console.log(`     ${key}: ${value}`);
                });
            }
        });
        
        return summary;
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GraphAlgorithmTests;
}

// Make available globally for browser testing
if (typeof window !== 'undefined') {
    window.GraphAlgorithmTests = GraphAlgorithmTests;
}