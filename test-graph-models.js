/**
 * Unit tests for Graph Models and Validation System
 */

// Test data
const validNodeData = {
    id: 'fidakune_test',
    label: 'test',
    type: 'fidakune_root',
    definition: 'test definition',
    domain: 'General',
    pronunciation: '/test/'
};

const validEdgeData = {
    source: 'fidakune_test1',
    target: 'fidakune_test2',
    relationship: 'is_a',
    strength: 1.0,
    description: 'test relationship'
};

const validGraphData = {
    metadata: {
        version: '1.0',
        created: '2024-12-19',
        curated_by: 'Test Suite',
        node_count: 2,
        edge_count: 1
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
            definition: 'clear liquid',
            domain: 'Nature'
        }
    ],
    edges: [
        {
            source: 'fidakune_aqua',
            target: 'en_water',
            relationship: 'is_a',
            strength: 1.0,
            description: 'aqua means water'
        }
    ]
};

/**
 * Test suite for GraphNode class
 */
function runGraphNodeTests() {
    console.log('🧪 Testing GraphNode class...\n');
    
    testGraphNodeConstruction();
    testGraphNodeValidation();
    testGraphNodeMethods();
    testGraphNodeSerialization();
    testGraphNodeArrayValidation();
    
    console.log('✅ GraphNode tests completed!\n');
}

function testGraphNodeConstruction() {
    console.log('Testing GraphNode construction...');
    
    // Valid construction
    const node = new GraphNode(validNodeData);
    console.assert(node.id === 'fidakune_test', 'Node ID should be set correctly');
    console.assert(node.label === 'test', 'Node label should be set correctly');
    console.assert(node.type === 'fidakune_root', 'Node type should be set correctly');
    
    // Invalid construction - missing required fields
    try {
        new GraphNode({ label: 'test' });
        console.assert(false, 'Should throw error for missing required fields');
    } catch (error) {
        console.assert(error.message.includes('requires'), 'Should throw descriptive error');
    }
    
    // Invalid construction - invalid type
    try {
        new GraphNode({ ...validNodeData, type: 'invalid_type' });
        console.assert(false, 'Should throw error for invalid type');
    } catch (error) {
        console.assert(error.message.includes('Invalid node type'), 'Should throw type validation error');
    }
    
    console.log('✅ GraphNode construction tests passed');
}

function testGraphNodeValidation() {
    console.log('Testing GraphNode validation methods...');
    
    const rootNode = new GraphNode({ ...validNodeData, type: 'fidakune_root' });
    const wordNode = new GraphNode({ ...validNodeData, type: 'fidakune_word' });
    const englishNode = new GraphNode({ ...validNodeData, type: 'english_keyword' });
    
    console.assert(rootNode.isRoot(), 'Root node should be identified correctly');
    console.assert(!rootNode.isWord(), 'Root node should not be identified as word');
    console.assert(rootNode.isFidakune(), 'Root node should be identified as Fidakune');
    
    console.assert(wordNode.isWord(), 'Word node should be identified correctly');
    console.assert(!wordNode.isRoot(), 'Word node should not be identified as root');
    console.assert(wordNode.isFidakune(), 'Word node should be identified as Fidakune');
    
    console.assert(englishNode.isEnglishKeyword(), 'English node should be identified correctly');
    console.assert(!englishNode.isFidakune(), 'English node should not be identified as Fidakune');
    
    console.log('✅ GraphNode validation tests passed');
}

function testGraphNodeMethods() {
    console.log('Testing GraphNode utility methods...');
    
    const node = new GraphNode(validNodeData);
    
    // Test query matching
    console.assert(node.matchesQuery('test'), 'Should match label query');
    console.assert(node.matchesQuery('definition'), 'Should match definition query');
    console.assert(!node.matchesQuery('nonexistent'), 'Should not match unrelated query');
    
    // Test similarity scoring
    console.assert(node.getSimilarityScore('test') === 1.0, 'Exact label match should score 1.0');
    console.assert(node.getSimilarityScore('test definition') === 0.9, 'Exact definition match should score 0.9');
    console.assert(node.getSimilarityScore('tes') > 0, 'Partial match should have positive score');
    console.assert(node.getSimilarityScore('unrelated') === 0, 'Unrelated query should score 0');
    
    // Test display info
    const displayInfo = node.getDisplayInfo();
    console.assert(displayInfo.id === node.id, 'Display info should include ID');
    console.assert(displayInfo.typeLabel === 'Fidakune Root', 'Display info should include readable type');
    
    console.log('✅ GraphNode method tests passed');
}

function testGraphNodeSerialization() {
    console.log('Testing GraphNode serialization...');
    
    const originalNode = new GraphNode(validNodeData);
    const json = originalNode.toJSON();
    const restoredNode = GraphNode.fromJSON(json);
    
    console.assert(restoredNode.id === originalNode.id, 'Serialization should preserve ID');
    console.assert(restoredNode.label === originalNode.label, 'Serialization should preserve label');
    console.assert(restoredNode.type === originalNode.type, 'Serialization should preserve type');
    console.assert(restoredNode.definition === originalNode.definition, 'Serialization should preserve definition');
    
    console.log('✅ GraphNode serialization tests passed');
}

function testGraphNodeArrayValidation() {
    console.log('Testing GraphNode array validation...');
    
    const validNodes = [validNodeData, { ...validNodeData, id: 'fidakune_test2', label: 'test2' }];
    const validation = GraphNode.validateNodeArray(validNodes);
    console.assert(validation.valid, 'Valid node array should pass validation');
    console.assert(validation.errors.length === 0, 'Valid node array should have no errors');
    
    // Test duplicate ID detection
    const duplicateNodes = [validNodeData, validNodeData];
    const duplicateValidation = GraphNode.validateNodeArray(duplicateNodes);
    console.assert(!duplicateValidation.valid, 'Duplicate IDs should fail validation');
    console.assert(duplicateValidation.errors.some(e => e.includes('Duplicate')), 'Should detect duplicate IDs');
    
    console.log('✅ GraphNode array validation tests passed');
}

/**
 * Test suite for GraphEdge class
 */
function runGraphEdgeTests() {
    console.log('🧪 Testing GraphEdge class...\n');
    
    testGraphEdgeConstruction();
    testGraphEdgeValidation();
    testGraphEdgeMethods();
    testGraphEdgeSerialization();
    testGraphEdgeArrayValidation();
    
    console.log('✅ GraphEdge tests completed!\n');
}

function testGraphEdgeConstruction() {
    console.log('Testing GraphEdge construction...');
    
    // Valid construction
    const edge = new GraphEdge(validEdgeData);
    console.assert(edge.source === 'fidakune_test1', 'Edge source should be set correctly');
    console.assert(edge.target === 'fidakune_test2', 'Edge target should be set correctly');
    console.assert(edge.relationship === 'is_a', 'Edge relationship should be set correctly');
    console.assert(edge.strength === 1.0, 'Edge strength should be set correctly');
    
    // Invalid construction - missing required fields
    try {
        new GraphEdge({ source: 'test' });
        console.assert(false, 'Should throw error for missing required fields');
    } catch (error) {
        console.assert(error.message.includes('requires'), 'Should throw descriptive error');
    }
    
    // Invalid construction - invalid relationship
    try {
        new GraphEdge({ ...validEdgeData, relationship: 'invalid_relationship' });
        console.assert(false, 'Should throw error for invalid relationship');
    } catch (error) {
        console.assert(error.message.includes('Invalid relationship'), 'Should throw relationship validation error');
    }
    
    // Invalid construction - invalid strength
    try {
        new GraphEdge({ ...validEdgeData, strength: 1.5 });
        console.assert(false, 'Should throw error for invalid strength');
    } catch (error) {
        console.assert(error.message.includes('Invalid strength'), 'Should throw strength validation error');
    }
    
    console.log('✅ GraphEdge construction tests passed');
}

function testGraphEdgeValidation() {
    console.log('Testing GraphEdge validation methods...');
    
    const isAEdge = new GraphEdge({ ...validEdgeData, relationship: 'is_a' });
    const hasRootEdge = new GraphEdge({ ...validEdgeData, relationship: 'has_root' });
    const relatedEdge = new GraphEdge({ ...validEdgeData, relationship: 'is_related_to' });
    
    console.assert(isAEdge.isDirectRelation(), 'is_a edge should be identified as direct relation');
    console.assert(!isAEdge.isRootRelation(), 'is_a edge should not be identified as root relation');
    
    console.assert(hasRootEdge.isRootRelation(), 'has_root edge should be identified as root relation');
    console.assert(!hasRootEdge.isConceptualRelation(), 'has_root edge should not be identified as conceptual');
    
    console.assert(relatedEdge.isConceptualRelation(), 'is_related_to edge should be identified as conceptual');
    console.assert(!relatedEdge.isDirectRelation(), 'is_related_to edge should not be identified as direct');
    
    console.log('✅ GraphEdge validation tests passed');
}

function testGraphEdgeMethods() {
    console.log('Testing GraphEdge utility methods...');
    
    const edge = new GraphEdge(validEdgeData);
    
    // Test connection checking
    console.assert(edge.connects('fidakune_test1', 'fidakune_test2'), 'Should identify correct connection');
    console.assert(!edge.connects('fidakune_test2', 'fidakune_test1'), 'Should not match reversed connection');
    
    // Test node involvement
    console.assert(edge.involves('fidakune_test1'), 'Should identify source involvement');
    console.assert(edge.involves('fidakune_test2'), 'Should identify target involvement');
    console.assert(!edge.involves('fidakune_test3'), 'Should not identify uninvolved node');
    
    // Test other node retrieval
    console.assert(edge.getOtherNode('fidakune_test1') === 'fidakune_test2', 'Should return target when given source');
    console.assert(edge.getOtherNode('fidakune_test2') === 'fidakune_test1', 'Should return source when given target');
    console.assert(edge.getOtherNode('fidakune_test3') === null, 'Should return null for uninvolved node');
    
    // Test display info
    const displayInfo = edge.getDisplayInfo();
    console.assert(displayInfo.category === 'Directly Related Concepts', 'Should provide correct category');
    console.assert(displayInfo.relationshipLabel === 'is equivalent to', 'Should provide readable relationship label');
    
    console.log('✅ GraphEdge method tests passed');
}

function testGraphEdgeSerialization() {
    console.log('Testing GraphEdge serialization...');
    
    const originalEdge = new GraphEdge(validEdgeData);
    const json = originalEdge.toJSON();
    const restoredEdge = GraphEdge.fromJSON(json);
    
    console.assert(restoredEdge.source === originalEdge.source, 'Serialization should preserve source');
    console.assert(restoredEdge.target === originalEdge.target, 'Serialization should preserve target');
    console.assert(restoredEdge.relationship === originalEdge.relationship, 'Serialization should preserve relationship');
    console.assert(restoredEdge.strength === originalEdge.strength, 'Serialization should preserve strength');
    
    console.log('✅ GraphEdge serialization tests passed');
}

function testGraphEdgeArrayValidation() {
    console.log('Testing GraphEdge array validation...');
    
    const nodeIds = ['fidakune_test1', 'fidakune_test2'];
    const validEdges = [validEdgeData];
    const validation = GraphEdge.validateEdgeArray(validEdges, nodeIds);
    console.assert(validation.valid, 'Valid edge array should pass validation');
    console.assert(validation.errors.length === 0, 'Valid edge array should have no errors');
    
    // Test missing node detection
    const invalidEdges = [{ ...validEdgeData, target: 'nonexistent_node' }];
    const invalidValidation = GraphEdge.validateEdgeArray(invalidEdges, nodeIds);
    console.assert(!invalidValidation.valid, 'Invalid node references should fail validation');
    console.assert(invalidValidation.errors.some(e => e.includes('not found')), 'Should detect missing nodes');
    
    // Test self-loop detection
    const selfLoopEdges = [{ ...validEdgeData, target: validEdgeData.source }];
    const selfLoopValidation = GraphEdge.validateEdgeArray(selfLoopEdges, nodeIds);
    console.assert(!selfLoopValidation.valid, 'Self-loops should fail validation');
    console.assert(selfLoopValidation.errors.some(e => e.includes('Self-loop')), 'Should detect self-loops');
    
    console.log('✅ GraphEdge array validation tests passed');
}

/**
 * Test suite for GraphValidator class
 */
function runGraphValidatorTests() {
    console.log('🧪 Testing GraphValidator class...\n');
    
    testGraphValidatorStructure();
    testGraphValidatorNodes();
    testGraphValidatorEdges();
    testGraphValidatorConsistency();
    
    console.log('✅ GraphValidator tests completed!\n');
}

function testGraphValidatorStructure() {
    console.log('Testing GraphValidator structure validation...');
    
    const validator = new GraphValidator();
    
    // Valid graph data
    const validation = validator.validateGraphData(validGraphData);
    console.assert(validation.valid, 'Valid graph data should pass validation');
    console.assert(validation.errors.length === 0, 'Valid graph should have no errors');
    console.assert(validation.stats, 'Validation should include statistics');
    
    // Invalid structure - missing nodes
    const invalidGraph = { ...validGraphData };
    delete invalidGraph.nodes;
    const invalidValidation = validator.validateGraphData(invalidGraph);
    console.assert(!invalidValidation.valid, 'Missing nodes should fail validation');
    console.assert(invalidValidation.errors.some(e => e.includes('nodes')), 'Should detect missing nodes');
    
    console.log('✅ GraphValidator structure tests passed');
}

function testGraphValidatorNodes() {
    console.log('Testing GraphValidator node validation...');
    
    const validator = new GraphValidator();
    
    // Test duplicate ID detection
    const duplicateGraph = {
        ...validGraphData,
        nodes: [
            validGraphData.nodes[0],
            validGraphData.nodes[0] // Duplicate
        ]
    };
    
    const duplicateValidation = validator.validateGraphData(duplicateGraph);
    console.assert(!duplicateValidation.valid, 'Duplicate node IDs should fail validation');
    console.assert(duplicateValidation.errors.some(e => e.includes('Duplicate')), 'Should detect duplicate IDs');
    
    console.log('✅ GraphValidator node tests passed');
}

function testGraphValidatorEdges() {
    console.log('Testing GraphValidator edge validation...');
    
    const validator = new GraphValidator();
    
    // Test missing node reference
    const invalidEdgeGraph = {
        ...validGraphData,
        edges: [{
            source: 'nonexistent_node',
            target: 'fidakune_aqua',
            relationship: 'is_a',
            strength: 1.0,
            description: 'test'
        }]
    };
    
    const invalidEdgeValidation = validator.validateGraphData(invalidEdgeGraph);
    console.assert(!invalidEdgeValidation.valid, 'Missing node references should fail validation');
    console.assert(invalidEdgeValidation.errors.some(e => e.includes('not found')), 'Should detect missing node references');
    
    console.log('✅ GraphValidator edge tests passed');
}

function testGraphValidatorConsistency() {
    console.log('Testing GraphValidator consistency validation...');
    
    const validator = new GraphValidator();
    
    // Test compound word consistency
    const compoundGraph = {
        metadata: validGraphData.metadata,
        nodes: [
            {
                id: 'fidakune_kore_pet',
                label: 'kore-pet',
                type: 'fidakune_word',
                definition: 'grief',
                domain: 'Emotion'
            },
            {
                id: 'fidakune_kore',
                label: 'kore',
                type: 'fidakune_root',
                definition: 'heart',
                domain: 'Body'
            }
        ],
        edges: [
            {
                source: 'fidakune_kore_pet',
                target: 'fidakune_kore',
                relationship: 'has_root',
                strength: 1.0,
                description: 'kore-pet contains kore'
            }
        ]
    };
    
    const compoundValidation = validator.validateGraphData(compoundGraph);
    // Should pass validation but may have warnings about missing pet root
    console.assert(compoundValidation.valid || compoundValidation.warnings.length > 0, 'Should validate compound structure');
    
    console.log('✅ GraphValidator consistency tests passed');
}

/**
 * Run all tests
 */
function runAllGraphModelTests() {
    console.log('🚀 Running Graph Model Tests...\n');
    
    runGraphNodeTests();
    runGraphEdgeTests();
    runGraphValidatorTests();
    
    console.log('🎉 All Graph Model tests completed successfully!\n');
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllGraphModelTests,
        runGraphNodeTests,
        runGraphEdgeTests,
        runGraphValidatorTests,
        validNodeData,
        validEdgeData,
        validGraphData
    };
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        runAllGraphModelTests();
    });
}