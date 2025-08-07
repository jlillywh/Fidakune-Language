/**
 * Unit tests for LexiconEntry data model
 */

// Test data
const testEntries = [
    { word: 'aqua', definition: 'water', domain: 'Nature' },
    { word: 'kore-pet', definition: 'grief', domain: 'Emotion', roots: ['kore', 'pet'] },
    { word: 'sole-lum', definition: 'hope', domain: 'Emotion', roots: ['sole', 'lum'] },
    { word: 'ami', definition: 'friend', domain: 'Society' }
];

/**
 * Test suite for LexiconEntry class
 */
function runLexiconEntryTests() {
    console.log('🧪 Running LexiconEntry Tests...\n');
    
    testBasicConstruction();
    testCompoundWordDetection();
    testPhonologicalValidation();
    testPronunciationGeneration();
    testQueryMatching();
    testSemanticScoring();
    testJSONSerialization();
    testValidation();
    testConflictDetection();
    
    console.log('\n✅ All LexiconEntry tests completed!');
}

function testBasicConstruction() {
    console.log('Testing basic construction...');
    
    const entry = new LexiconEntry({
        word: 'aqua',
        definition: 'water',
        domain: 'Nature'
    });
    
    console.assert(entry.word === 'aqua', 'Word should be set correctly');
    console.assert(entry.definition === 'water', 'Definition should be set correctly');
    console.assert(entry.domain === 'Nature', 'Domain should be set correctly');
    console.assert(entry.type === 'simple', 'Type should be inferred as simple');
    console.assert(entry.roots.length === 0, 'Simple words should have no roots');
    
    console.log('✅ Basic construction tests passed');
}

function testCompoundWordDetection() {
    console.log('Testing compound word detection...');
    
    const compound = new LexiconEntry({
        word: 'kore-pet',
        definition: 'grief',
        domain: 'Emotion'
    });
    
    console.assert(compound.isCompound(), 'Should detect compound words');
    console.assert(compound.type === 'compound', 'Type should be compound');
    console.assert(compound.roots.length === 2, 'Should extract 2 roots');
    console.assert(compound.roots[0] === 'kore', 'First root should be kore');
    console.assert(compound.roots[1] === 'pet', 'Second root should be pet');
    
    const simple = new LexiconEntry({
        word: 'aqua',
        definition: 'water'
    });
    
    console.assert(!simple.isCompound(), 'Should not detect simple words as compound');
    
    console.log('✅ Compound word detection tests passed');
}

function testPhonologicalValidation() {
    console.log('Testing phonological validation...');
    
    const validEntry = new LexiconEntry({
        word: 'aqua',
        definition: 'water'
    });
    
    const invalidEntry = new LexiconEntry({
        word: 'xyz123',
        definition: 'invalid'
    });
    
    console.assert(validEntry.isPhonologicallyValid(), 'Valid Fidakune word should pass validation');
    console.assert(!invalidEntry.isPhonologicallyValid(), 'Invalid word should fail validation');
    
    console.log('✅ Phonological validation tests passed');
}

function testPronunciationGeneration() {
    console.log('Testing pronunciation generation...');
    
    const entry = new LexiconEntry({
        word: 'aqua',
        definition: 'water'
    });
    
    console.assert(entry.pronunciation.startsWith('/'), 'Pronunciation should start with /');
    console.assert(entry.pronunciation.endsWith('/'), 'Pronunciation should end with /');
    console.assert(entry.pronunciation.includes('kw'), 'Should map qu to kw');
    
    const compound = new LexiconEntry({
        word: 'kore-pet',
        definition: 'grief'
    });
    
    console.assert(compound.pronunciation.includes('.'), 'Compound pronunciation should have syllable separator');
    
    console.log('✅ Pronunciation generation tests passed');
}

function testQueryMatching() {
    console.log('Testing query matching...');
    
    const entry = new LexiconEntry({
        word: 'aqua',
        definition: 'water',
        domain: 'Nature'
    });
    
    console.assert(entry.matchesQuery('aqua'), 'Should match exact word');
    console.assert(entry.matchesQuery('water'), 'Should match definition');
    console.assert(entry.matchesQuery('AQUA'), 'Should be case insensitive');
    console.assert(!entry.matchesQuery('fire'), 'Should not match unrelated terms');
    
    const compound = new LexiconEntry({
        word: 'kore-pet',
        definition: 'grief',
        roots: ['kore', 'pet']
    });
    
    console.assert(compound.matchesQuery('kore'), 'Should match root words');
    console.assert(compound.matchesQuery('pet'), 'Should match second root');
    
    console.log('✅ Query matching tests passed');
}

function testSemanticScoring() {
    console.log('Testing semantic scoring...');
    
    const entry = new LexiconEntry({
        word: 'aqua',
        definition: 'water liquid substance',
        domain: 'Nature'
    });
    
    const exactScore = entry.getSemanticScore('water');
    const partialScore = entry.getSemanticScore('liquid');
    const noScore = entry.getSemanticScore('fire');
    
    console.assert(exactScore > partialScore, 'Exact matches should score higher');
    console.assert(partialScore > noScore, 'Partial matches should score higher than no matches');
    console.assert(noScore === 0, 'Unrelated terms should score 0');
    
    console.log('✅ Semantic scoring tests passed');
}

function testJSONSerialization() {
    console.log('Testing JSON serialization...');
    
    const original = new LexiconEntry({
        word: 'aqua',
        definition: 'water',
        domain: 'Nature',
        examples: ['mi drink aqua']
    });
    
    const json = original.toJSON();
    const restored = LexiconEntry.fromJSON(json);
    
    console.assert(restored.word === original.word, 'Word should be preserved');
    console.assert(restored.definition === original.definition, 'Definition should be preserved');
    console.assert(restored.domain === original.domain, 'Domain should be preserved');
    console.assert(restored.examples.length === original.examples.length, 'Examples should be preserved');
    
    console.log('✅ JSON serialization tests passed');
}

function testValidation() {
    console.log('Testing entry validation...');
    
    const validEntry = new LexiconEntry({
        word: 'aqua',
        definition: 'water',
        domain: 'Nature'
    });
    
    const invalidEntry = new LexiconEntry({
        word: '',
        definition: 'water'
    });
    
    console.assert(validEntry.isValid(), 'Complete entry should be valid');
    console.assert(!invalidEntry.isValid(), 'Incomplete entry should be invalid');
    
    console.log('✅ Entry validation tests passed');
}

function testConflictDetection() {
    console.log('Testing conflict detection...');
    
    const entries = [
        new LexiconEntry({ word: 'aqua', definition: 'water', pronunciation: '/ˈa.kwa/' }),
        new LexiconEntry({ word: 'aqua', definition: 'liquid', pronunciation: '/ˈa.kwa/' }), // Duplicate
        new LexiconEntry({ word: 'akwa', definition: 'water', pronunciation: '/ˈa.kwa/' })  // Homophone
    ];
    
    const conflicts = LexiconEntry.validateEntries(entries);
    
    console.assert(conflicts.length > 0, 'Should detect conflicts');
    console.assert(conflicts.some(c => c.type === 'duplicate'), 'Should detect duplicates');
    console.assert(conflicts.some(c => c.type === 'homophone'), 'Should detect homophones');
    
    console.log('✅ Conflict detection tests passed');
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runLexiconEntryTests, LexiconEntry };
}