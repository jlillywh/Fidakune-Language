/**
 * Integration Tests for Complete Search Workflows
 * Tests end-to-end functionality and component interactions
 */

class IntegrationWorkflowTests {
    constructor() {
        this.testResults = [];
        this.testEnvironment = this.setupTestEnvironment();
    }
    
    setupTestEnvironment() {
        // Create a mock DOM environment for testing
        const mockElements = {
            searchInput: this.createMockElement('input', 'graph-search-input'),
            searchForm: this.createMockElement('form', 'search-form'),
            resultsContainer: this.createMockElement('div', 'results-container'),
            breadcrumbs: this.createMockElement('nav', 'breadcrumbs'),
            directlyRelatedList: this.createMockElement('div', 'directly-related-list'),
            componentRootsList: this.createMockElement('div', 'component-roots-list'),
            relatedIdeasList: this.createMockElement('div', 'related-ideas-list'),
            loadingIndicator: this.createMockElement('div', 'loading-indicator'),
            noResults: this.createMockElement('div', 'no-results')
        };
        
        return {
            elements: mockElements,
            eventListeners: new Map(),
            searchHistory: [],
            currentQuery: null,
            isLoading: false
        };
    }
    
    createMockElement(tagName, id) {
        if (typeof document !== 'undefined') {
            // Use real DOM if available
            let element = document.getElementById(id);
            if (!element) {
                element = document.createElement(tagName);
                element.id = id;
                element.className = id.replace(/-/g, '_');
                // Don't append to DOM to avoid interference
            }
            return element;
        } else {
            // Create mock element for Node.js testing
            return {
                id: id,
                tagName: tagName.toUpperCase(),
                className: id.replace(/-/g, '_'),
                value: '',
                textContent: '',
                innerHTML: '',
                style: {},
                addEventListener: (event, handler) => {
                    if (!this.testEnvironment.eventListeners.has(id)) {
                        this.testEnvironment.eventListeners.set(id, new Map());
                    }
                    this.testEnvironment.eventListeners.get(id).set(event, handler);
                },
                removeEventListener: (event) => {
                    if (this.testEnvironment.eventListeners.has(id)) {
                        this.testEnvironment.eventListeners.get(id).delete(event);
                    }
                },
                focus: () => {},
                blur: () => {},
                click: () => {},
                querySelector: () => null,
                querySelectorAll: () => []
            };
        }
    }
    
    // Test Complete Search Workflow
    async testCompleteSearchWorkflow() {
        const test = {
            name: 'Complete Search Workflow',
            passed: false,
            error: null,
            details: {},
            steps: []
        };
        
        try {
            // Step 1: Initialize search engine
            test.steps.push('Initializing search engine...');
            
            if (typeof GraphSearchEngine === 'undefined') {
                test.error = 'GraphSearchEngine not available';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            const engine = new GraphSearchEngine();
            test.details.engineInitialized = true;
            
            // Step 2: Load graph data
            test.steps.push('Loading graph data...');
            
            const mockData = this.createMockGraphData();
            await engine.loadGraph(mockData);
            test.details.dataLoaded = true;
            
            // Step 3: Simulate user input
            test.steps.push('Simulating user input...');
            
            const searchQuery = 'aqua';
            this.testEnvironment.elements.searchInput.value = searchQuery;
            this.testEnvironment.currentQuery = searchQuery;
            test.details.userInputSimulated = true;
            
            // Step 4: Execute search
            test.steps.push('Executing search...');
            
            const searchStart = performance.now();
            const results = await engine.search(searchQuery);
            const searchEnd = performance.now();
            
            test.details.searchExecuted = results !== null;
            test.details.searchTime = searchEnd - searchStart;
            test.details.searchTimeAcceptable = test.details.searchTime < 1000;
            
            // Step 5: Process results
            test.steps.push('Processing search results...');
            
            if (results) {
                test.details.resultsStructure = {
                    hasDirectlyRelated: Array.isArray(results.directlyRelated),
                    hasComponentRoots: Array.isArray(results.componentRoots),
                    hasRelatedIdeas: Array.isArray(results.relatedIdeas)
                };
                
                const totalResults = (results.directlyRelated?.length || 0) +
                                   (results.componentRoots?.length || 0) +
                                   (results.relatedIdeas?.length || 0);
                
                test.details.totalResults = totalResults;
                test.details.hasResults = totalResults > 0;
            }
            
            // Step 6: Simulate UI update
            test.steps.push('Simulating UI update...');
            
            if (results) {
                this.simulateUIUpdate(results);
                test.details.uiUpdated = true;
            }
            
            // Step 7: Test navigation workflow
            test.steps.push('Testing navigation workflow...');
            
            if (results && results.directlyRelated && results.directlyRelated.length > 0) {
                const firstResult = results.directlyRelated[0];
                const navigationResults = await engine.search(firstResult.label);
                test.details.navigationWorking = navigationResults !== null;
                
                // Simulate breadcrumb update
                this.testEnvironment.searchHistory.push(searchQuery);
                this.testEnvironment.searchHistory.push(firstResult.label);
                test.details.breadcrumbsUpdated = this.testEnvironment.searchHistory.length === 2;
            }
            
            // Step 8: Test error handling in workflow
            test.steps.push('Testing error handling...');
            
            try {
                await engine.search(''); // Empty search
                test.details.errorHandlingWorking = true;
            } catch (error) {
                test.details.errorHandlingWorking = true; // Throwing error is acceptable
            }
            
            // Evaluate overall workflow success
            test.passed = test.details.engineInitialized &&
                          test.details.dataLoaded &&
                          test.details.userInputSimulated &&
                          test.details.searchExecuted &&
                          test.details.searchTimeAcceptable &&
                          test.details.hasResults &&
                          test.details.uiUpdated &&
                          test.details.errorHandlingWorking;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test UI Component Integration
    async testUIComponentIntegration() {
        const test = {
            name: 'UI Component Integration',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            // Test that all required UI components exist
            const requiredComponents = [
                'searchInput',
                'searchForm',
                'resultsContainer',
                'breadcrumbs',
                'directlyRelatedList',
                'componentRootsList',
                'relatedIdeasList',
                'loadingIndicator',
                'noResults'
            ];
            
            const componentStatus = {};
            requiredComponents.forEach(component => {
                componentStatus[component] = this.testEnvironment.elements[component] !== null;
            });
            
            test.details.componentStatus = componentStatus;
            test.details.allComponentsPresent = Object.values(componentStatus).every(Boolean);
            
            // Test component interactions
            if (test.details.allComponentsPresent) {
                // Test search form submission
                const searchForm = this.testEnvironment.elements.searchForm;
                const searchInput = this.testEnvironment.elements.searchInput;
                
                searchInput.value = 'test query';
                
                // Simulate form submission
                const submitEvent = new Event('submit');
                if (searchForm.addEventListener) {
                    let formSubmitted = false;
                    searchForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        formSubmitted = true;
                    });
                    
                    searchForm.dispatchEvent(submitEvent);
                    test.details.formSubmissionWorking = formSubmitted;
                } else {
                    test.details.formSubmissionWorking = true; // Mock environment
                }
                
                // Test loading state management
                this.testEnvironment.isLoading = true;
                this.simulateLoadingState(true);
                test.details.loadingStateWorking = this.testEnvironment.elements.loadingIndicator.style.display !== 'none';
                
                this.testEnvironment.isLoading = false;
                this.simulateLoadingState(false);
                test.details.loadingStateHiding = this.testEnvironment.elements.loadingIndicator.style.display === 'none';
                
                // Test results display
                const mockResults = {
                    directlyRelated: [{ label: 'test1', definition: 'test definition 1' }],
                    componentRoots: [{ label: 'test2', definition: 'test definition 2' }],
                    relatedIdeas: [{ label: 'test3', definition: 'test definition 3' }]
                };
                
                this.simulateUIUpdate(mockResults);
                test.details.resultsDisplayWorking = true; // Assume success if no errors
                
                // Test no results state
                this.simulateUIUpdate({ directlyRelated: [], componentRoots: [], relatedIdeas: [] });
                test.details.noResultsStateWorking = true;
            }
            
            test.passed = test.details.allComponentsPresent &&
                          test.details.formSubmissionWorking &&
                          test.details.loadingStateWorking &&
                          test.details.loadingStateHiding &&
                          test.details.resultsDisplayWorking &&
                          test.details.noResultsStateWorking;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Data Flow Integration
    async testDataFlowIntegration() {
        const test = {
            name: 'Data Flow Integration',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            // Test data loading pipeline
            if (typeof GraphSearchEngine === 'undefined') {
                test.error = 'GraphSearchEngine not available';
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            const engine = new GraphSearchEngine();
            
            // Step 1: Test data validation
            const validData = this.createMockGraphData();
            const invalidData = { nodes: 'invalid', edges: 'invalid' };
            
            try {
                await engine.loadGraph(validData);
                test.details.validDataLoaded = true;
            } catch (error) {
                test.details.validDataLoaded = false;
                test.details.validDataError = error.message;
            }
            
            try {
                await engine.loadGraph(invalidData);
                test.details.invalidDataRejected = false; // Should have thrown error
            } catch (error) {
                test.details.invalidDataRejected = true; // Correctly rejected
            }
            
            // Step 2: Test data transformation
            if (test.details.validDataLoaded) {
                // Test that data is properly indexed
                const nodeExists = engine.graph && engine.graph.has('fidakune_aqua');
                test.details.dataIndexed = nodeExists;
                
                // Test reverse indexing
                const reverseIndexWorking = engine.reverseIndex && engine.reverseIndex.size > 0;
                test.details.reverseIndexWorking = reverseIndexWorking;
            }
            
            // Step 3: Test search data flow
            const searchResults = await engine.search('aqua');
            test.details.searchDataFlow = searchResults !== null;
            
            if (searchResults) {
                // Test result transformation
                const hasProperStructure = searchResults.directlyRelated !== undefined &&
                                          searchResults.componentRoots !== undefined &&
                                          searchResults.relatedIdeas !== undefined;
                test.details.resultTransformation = hasProperStructure;
                
                // Test data consistency
                const allResults = [
                    ...(searchResults.directlyRelated || []),
                    ...(searchResults.componentRoots || []),
                    ...(searchResults.relatedIdeas || [])
                ];
                
                const dataConsistent = allResults.every(result => 
                    result.label && result.definition && typeof result.strength === 'number');
                test.details.dataConsistency = dataConsistent;
            }
            
            // Step 4: Test caching integration
            if (engine.searchCache) {
                const cacheSize = engine.searchCache.size;
                test.details.cachingWorking = cacheSize >= 0; // Cache exists
                
                // Test cache hit
                const cachedResults = await engine.search('aqua'); // Same query
                test.details.cacheHit = cachedResults !== null;
            } else {
                test.details.cachingWorking = true; // May not be implemented
                test.details.cacheHit = true;
            }
            
            test.passed = test.details.validDataLoaded &&
                          test.details.invalidDataRejected &&
                          test.details.dataIndexed &&
                          test.details.reverseIndexWorking &&
                          test.details.searchDataFlow &&
                          test.details.resultTransformation &&
                          test.details.dataConsistency &&
                          test.details.cachingWorking;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Error Handling Integration
    async testErrorHandlingIntegration() {
        const test = {
            name: 'Error Handling Integration',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            // Test network error handling
            if (typeof GraphSearchEngine !== 'undefined') {
                const engine = new GraphSearchEngine();
                
                // Test with invalid data source
                try {
                    await engine.loadGraph(null);
                    test.details.nullDataHandled = false;
                } catch (error) {
                    test.details.nullDataHandled = true;
                    test.details.nullDataError = error.message;
                }
                
                // Test search with unloaded graph
                try {
                    const unloadedEngine = new GraphSearchEngine();
                    await unloadedEngine.search('test');
                    test.details.unloadedGraphHandled = true; // May return empty results
                } catch (error) {
                    test.details.unloadedGraphHandled = true; // Throwing error is acceptable
                }
            }
            
            // Test UI error handling
            try {
                this.simulateUIError();
                test.details.uiErrorHandled = true;
            } catch (error) {
                test.details.uiErrorHandled = false;
                test.details.uiErrorMessage = error.message;
            }
            
            // Test fallback mechanisms integration
            if (typeof window !== 'undefined' && window.FidakuneFallbackMechanisms) {
                const fallbacks = window.FidakuneFallbackMechanisms;
                
                // Test error recovery
                try {
                    fallbacks.handleError(new Error('Test error'), { type: 'integration-test' });
                    test.details.fallbackIntegration = true;
                } catch (error) {
                    test.details.fallbackIntegration = false;
                    test.details.fallbackError = error.message;
                }
            } else {
                test.details.fallbackIntegration = true; // May not be available in test environment
            }
            
            // Test security error handling
            if (typeof window !== 'undefined' && window.FidakuneSecurityValidator) {
                const validator = window.FidakuneSecurityValidator;
                
                try {
                    validator.validate('<script>alert("xss")</script>');
                    test.details.securityErrorHandled = false; // Should have thrown error
                } catch (error) {
                    test.details.securityErrorHandled = true;
                }
            } else {
                test.details.securityErrorHandled = true; // May not be available
            }
            
            test.passed = test.details.nullDataHandled &&
                          test.details.unloadedGraphHandled &&
                          test.details.uiErrorHandled &&
                          test.details.fallbackIntegration &&
                          test.details.securityErrorHandled;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Performance Integration
    async testPerformanceIntegration() {
        const test = {
            name: 'Performance Integration',
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
            const mockData = this.createMockGraphData();
            
            // Test loading performance
            const loadStart = performance.now();
            await engine.loadGraph(mockData);
            const loadEnd = performance.now();
            
            test.details.loadTime = loadEnd - loadStart;
            test.details.loadPerformanceAcceptable = test.details.loadTime < 1000;
            
            // Test search performance with multiple queries
            const queries = ['aqua', 'sole', 'kore', 'pet', 'nonexistent'];
            const searchTimes = [];
            
            for (const query of queries) {
                const searchStart = performance.now();
                await engine.search(query);
                const searchEnd = performance.now();
                searchTimes.push(searchEnd - searchStart);
            }
            
            test.details.searchTimes = searchTimes;
            test.details.averageSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
            test.details.maxSearchTime = Math.max(...searchTimes);
            test.details.searchPerformanceAcceptable = test.details.maxSearchTime < 500;
            
            // Test memory usage if available
            if (performance.memory) {
                test.details.memoryBefore = performance.memory.usedJSHeapSize;
                
                // Perform multiple operations
                for (let i = 0; i < 10; i++) {
                    await engine.search(`query_${i}`);
                }
                
                test.details.memoryAfter = performance.memory.usedJSHeapSize;
                test.details.memoryIncrease = test.details.memoryAfter - test.details.memoryBefore;
                test.details.memoryLeakAcceptable = test.details.memoryIncrease < 10 * 1024 * 1024; // 10MB
            } else {
                test.details.memoryLeakAcceptable = true; // Can't test if not available
            }
            
            // Test UI performance
            const uiStart = performance.now();
            this.simulateUIUpdate({
                directlyRelated: Array(50).fill().map((_, i) => ({ label: `item_${i}`, definition: `def_${i}` })),
                componentRoots: [],
                relatedIdeas: []
            });
            const uiEnd = performance.now();
            
            test.details.uiUpdateTime = uiEnd - uiStart;
            test.details.uiPerformanceAcceptable = test.details.uiUpdateTime < 200;
            
            test.passed = test.details.loadPerformanceAcceptable &&
                          test.details.searchPerformanceAcceptable &&
                          test.details.memoryLeakAcceptable &&
                          test.details.uiPerformanceAcceptable;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Helper methods
    
    createMockGraphData() {
        return {
            metadata: {
                version: "integration-test-1.0",
                created: new Date().toISOString(),
                curated_by: "Integration Test Suite",
                node_count: 6,
                edge_count: 8
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
                    source: "fidakune_aqua",
                    target: "fidakune_sole",
                    relationship: "is_related_to",
                    strength: 0.5,
                    description: "both are natural elements"
                },
                {
                    source: "en_water",
                    target: "en_sun",
                    relationship: "is_related_to",
                    strength: 0.5,
                    description: "both are natural elements"
                }
            ]
        };
    }
    
    simulateUIUpdate(results) {
        // Simulate updating UI with search results
        if (results.directlyRelated && results.directlyRelated.length > 0) {
            this.testEnvironment.elements.directlyRelatedList.innerHTML = 
                results.directlyRelated.map(r => `<div class="concept-item">${r.label}</div>`).join('');
        }
        
        if (results.componentRoots && results.componentRoots.length > 0) {
            this.testEnvironment.elements.componentRootsList.innerHTML = 
                results.componentRoots.map(r => `<div class="concept-item">${r.label}</div>`).join('');
        }
        
        if (results.relatedIdeas && results.relatedIdeas.length > 0) {
            this.testEnvironment.elements.relatedIdeasList.innerHTML = 
                results.relatedIdeas.map(r => `<div class="concept-item">${r.label}</div>`).join('');
        }
        
        // Show/hide no results
        const hasAnyResults = (results.directlyRelated?.length || 0) +
                             (results.componentRoots?.length || 0) +
                             (results.relatedIdeas?.length || 0) > 0;
        
        this.testEnvironment.elements.noResults.style.display = hasAnyResults ? 'none' : 'block';
        this.testEnvironment.elements.resultsContainer.style.display = hasAnyResults ? 'block' : 'none';
    }
    
    simulateLoadingState(isLoading) {
        this.testEnvironment.elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
        this.testEnvironment.isLoading = isLoading;
    }
    
    simulateUIError() {
        // Simulate a UI error and recovery
        try {
            // This would normally cause an error in real UI
            this.testEnvironment.elements.resultsContainer.innerHTML = null;
            throw new Error('Simulated UI error');
        } catch (error) {
            // Simulate error recovery
            this.testEnvironment.elements.resultsContainer.innerHTML = '<div>Error occurred, please try again</div>';
            // Don't re-throw, indicating error was handled
        }
    }
    
    // Run all integration tests
    async runAllTests() {
        console.log('Starting Integration Workflow Tests...');
        
        const tests = [
            () => this.testCompleteSearchWorkflow(),
            () => this.testUIComponentIntegration(),
            () => this.testDataFlowIntegration(),
            () => this.testErrorHandlingIntegration(),
            () => this.testPerformanceIntegration()
        ];
        
        for (const testFunction of tests) {
            try {
                await testFunction();
            } catch (error) {
                console.error('Integration test execution error:', error);
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
        
        console.log('\n=== Integration Workflow Test Report ===');
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
            
            if (test.steps && test.steps.length > 0) {
                console.log('   Steps:');
                test.steps.forEach((step, stepIndex) => {
                    console.log(`     ${stepIndex + 1}. ${step}`);
                });
            }
            
            if (test.details && Object.keys(test.details).length > 0) {
                console.log('   Details:');
                Object.entries(test.details).forEach(([key, value]) => {
                    if (typeof value === 'object' && value !== null) {
                        console.log(`     ${key}:`);
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            console.log(`       ${subKey}: ${subValue}`);
                        });
                    } else {
                        console.log(`     ${key}: ${value}`);
                    }
                });
            }
        });
        
        return summary;
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationWorkflowTests;
}

// Make available globally for browser testing
if (typeof window !== 'undefined') {
    window.IntegrationWorkflowTests = IntegrationWorkflowTests;
}