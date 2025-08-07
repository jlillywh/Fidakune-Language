/**
 * Comprehensive test suite for the new SearchEngine class
 */

// Test data using LexiconEntry format
const testLexiconData = [
    new LexiconEntry({ word: 'aqua', definition: 'water', domain: 'Nature', pronunciation: '/ˈa.kwa/' }),
    new LexiconEntry({ word: 'sole', definition: 'sun', domain: 'Nature', pronunciation: '/ˈso.le/' }),
    new LexiconEntry({ word: 'ami', definition: 'friend', domain: 'Society', pronunciation: '/ˈa.mi/' }),
    new LexiconEntry({ word: 'lei', definition: 'law', domain: 'Society', pronunciation: '/lei/' }),
    new LexiconEntry({ word: 'kore-pet', definition: 'grief', domain: 'Emotion', pronunciation: '/ˈko.ɾe.pet/', roots: ['kore', 'pet'] }),
    new LexiconEntry({ word: 'sole-lum', definition: 'hope', domain: 'Emotion', pronunciation: '/ˈso.le.lum/', roots: ['sole', 'lum'] }),
    new LexiconEntry({ word: 'kore', definition: 'heart', domain: 'Body', pronunciation: '/ˈko.ɾe/' }),
    new LexiconEntry({ word: 'pet', definition: 'stone', domain: 'Nature', pronunciation: '/pet/' }),
    new LexiconEntry({ word: 'lum', definition: 'light', domain: 'Nature', pronunciation: '/lum/' }),
    new LexiconEntry({ word: 'mun-lum', definition: 'inspiration', domain: 'Emotion', pronunciation: '/ˈmun.lum/', roots: ['mun', 'lum'] })
];

/**
 * Run comprehensive search engine tests
 */
function runSearchEngineTests() {
    console.log('🔍 Running SearchEngine Tests...\n');
    
    const searchEngine = new SearchEngine(testLexiconData);
    
    testExactMatchSearch(searchEngine);
    testRootAnalysisSearch(searchEngine);
    testSemanticAnalysisSearch(searchEngine);
    testSearchPerformance(searchEngine);
    testSearchCaching(searchEngine);
    testQueryValidation(searchEngine);
    testSearchHistory(searchEngine);
    testIntegrationWithLexiconEntry(searchEngine);
    
    console.log('\n✅ All SearchEngine tests completed!');
}

function testExactMatchSearch(searchEngine) {
    console.log('Testing Tier 1: Exact Match Search...');
    
    // Test exact word match
    const waterResult = searchEngine.search('aqua');
    console.assert(waterResult.exactMatches.length === 1, 'Should find exact word match for "aqua"');
    console.assert(waterResult.exactMatches[0].entry.word === 'aqua', 'Should match correct entry');
    console.assert(waterResult.searchTier === 'exact', 'Should identify as exact match tier');
    
    // Test exact definition match
    const friendResult = searchEngine.search('friend');
    console.assert(friendResult.exactMatches.length === 1, 'Should find exact definition match for "friend"');
    console.assert(friendResult.exactMatches[0].entry.word === 'ami', 'Should match ami for friend');
    
    // Test case insensitivity
    const caseResult = searchEngine.search('AQUA');
    console.assert(caseResult.exactMatches.length === 1, 'Should be case insensitive');
    
    console.log('✅ Exact match search tests passed');
}

function testRootAnalysisSearch(searchEngine) {
    console.log('Testing Tier 2: Root Analysis Search...');
    
    // Test compound word root matching
    const heartStoneResult = searchEngine.search('heart-stone');
    console.assert(heartStoneResult.relatedWords.length > 0, 'Should find related words for "heart-stone"');
    console.assert(heartStoneResult.searchTier === 'root', 'Should identify as root analysis tier');
    
    // Check if kore-pet is found (grief = heart-stone metaphorically)
    const hasKorePet = heartStoneResult.relatedWords.some(match => match.entry.word === 'kore-pet');
    console.assert(hasKorePet, 'Should find kore-pet for heart-stone query');
    
    // Test single root matching
    const lightResult = searchEngine.search('light');
    const hasLightCompounds = lightResult.relatedWords.some(match => 
        match.entry.roots && match.entry.roots.includes('lum')
    );
    console.assert(hasLightCompounds, 'Should find compounds containing light root');
    
    // Test confidence scoring
    const rootMatch = heartStoneResult.relatedWords[0];
    console.assert(rootMatch.confidence > 0, 'Root matches should have confidence scores');
    console.assert(rootMatch.confidence <= 1.0, 'Confidence should not exceed 1.0');
    
    console.log('✅ Root analysis search tests passed');
}

function testSemanticAnalysisSearch(searchEngine) {
    console.log('Testing Tier 3: Semantic Analysis Search...');
    
    // Test semantic keyword matching
    const emotionResult = searchEngine.search('emotional feeling');
    console.assert(emotionResult.semanticMatches.length > 0, 'Should find semantic matches for emotional concepts');
    
    // Check if emotion domain words are found
    const hasEmotionWords = emotionResult.semanticMatches.some(match => 
        match.entry.domain === 'Emotion'
    );
    console.assert(hasEmotionWords, 'Should find words in Emotion domain');
    
    // Test domain relevance
    const natureResult = searchEngine.search('natural environment');
    const hasNatureWords = natureResult.semanticMatches.some(match => 
        match.entry.domain === 'Nature'
    );
    console.assert(hasNatureWords, 'Should find words in Nature domain for nature-related query');
    
    // Test semantic scoring
    const semanticMatch = emotionResult.semanticMatches[0];
    console.assert(semanticMatch.semanticScore >= 0, 'Semantic matches should have semantic scores');
    console.assert(semanticMatch.matchedKeywords.length > 0, 'Should identify matched keywords');
    
    console.log('✅ Semantic analysis search tests passed');
}

function testSearchPerformance(searchEngine) {
    console.log('Testing search performance...');
    
    const startTime = performance.now();
    
    // Run multiple searches
    for (let i = 0; i < 100; i++) {
        searchEngine.search('test query ' + i);
    }
    
    const endTime = performance.now();
    const averageTime = (endTime - startTime) / 100;
    
    console.assert(averageTime < 10, 'Average search time should be under 10ms');
    
    const metrics = searchEngine.getPerformanceMetrics();
    console.assert(metrics.totalSearches >= 100, 'Should track total searches');
    console.assert(metrics.averageTime > 0, 'Should calculate average time');
    
    console.log('✅ Search performance tests passed');
}

function testSearchCaching(searchEngine) {
    console.log('Testing search caching...');
    
    // First search
    const result1 = searchEngine.search('aqua');
    const metrics1 = searchEngine.getPerformanceMetrics();
    
    // Second identical search (should hit cache)
    const result2 = searchEngine.search('aqua');
    const metrics2 = searchEngine.getPerformanceMetrics();
    
    console.assert(metrics2.cacheHits > metrics1.cacheHits, 'Should register cache hit');
    console.assert(JSON.stringify(result1) === JSON.stringify(result2), 'Cached results should be identical');
    
    // Clear cache and verify
    searchEngine.clearCache();
    const result3 = searchEngine.search('aqua');
    // Should work but not be a cache hit
    console.assert(result3.exactMatches.length > 0, 'Should still work after cache clear');
    
    console.log('✅ Search caching tests passed');
}

function testQueryValidation(searchEngine) {
    console.log('Testing query validation...');
    
    // Test empty query
    const emptyResult = searchEngine.search('');
    console.assert(emptyResult.totalResults === 0, 'Empty query should return no results');
    console.assert(emptyResult.error, 'Empty query should have error message');
    
    // Test invalid characters
    const invalidResult = searchEngine.search('test@#$%');
    console.assert(invalidResult.totalResults === 0, 'Invalid characters should return no results');
    
    // Test very long query
    const longQuery = 'a'.repeat(200);
    const longResult = searchEngine.search(longQuery);
    console.assert(longResult.totalResults === 0, 'Overly long query should be rejected');
    
    // Test valid query
    const validResult = searchEngine.search('aqua');
    console.assert(validResult.totalResults > 0, 'Valid query should return results');
    console.assert(!validResult.error, 'Valid query should not have error');
    
    console.log('✅ Query validation tests passed');
}

function testSearchHistory(searchEngine) {
    console.log('Testing search history...');
    
    // Perform several searches
    searchEngine.search('aqua');
    searchEngine.search('ami');
    searchEngine.search('kore-pet');
    
    const history = searchEngine.getSearchHistory();
    console.assert(history.length >= 3, 'Should track search history');
    console.assert(history[0].query === 'kore-pet', 'Most recent search should be first');
    console.assert(history.every(entry => entry.timestamp), 'All history entries should have timestamps');
    console.assert(history.every(entry => typeof entry.resultCount === 'number'), 'All entries should have result counts');
    
    console.log('✅ Search history tests passed');
}

function testIntegrationWithLexiconEntry(searchEngine) {
    console.log('Testing integration with LexiconEntry...');
    
    // Test that search works with LexiconEntry methods
    const result = searchEngine.search('aqua');
    const entry = result.exactMatches[0].entry;
    
    console.assert(entry instanceof LexiconEntry, 'Results should contain LexiconEntry instances');
    console.assert(typeof entry.isCompound === 'function', 'Should have LexiconEntry methods');
    console.assert(typeof entry.getSemanticScore === 'function', 'Should have semantic scoring method');
    console.assert(entry.isValid(), 'Entry should be valid');
    
    // Test compound word integration
    const compoundResult = searchEngine.search('kore-pet');
    const compoundEntry = compoundResult.exactMatches[0].entry;
    console.assert(compoundEntry.isCompound(), 'Should correctly identify compound words');
    console.assert(compoundEntry.roots.length > 0, 'Compound words should have roots');
    
    console.log('✅ LexiconEntry integration tests passed');
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runSearchEngineTests, SearchEngine };
}