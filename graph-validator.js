/**
 * Graph-Based Conceptual Search - Validation System
 * Ensures data integrity and relationship consistency in the lexical graph
 */

/**
 * GraphValidator provides comprehensive validation for lexical graph data
 */
class GraphValidator {
    constructor() {
        this.validNodeTypes = ['fidakune_root', 'fidakune_word', 'english_keyword'];
        this.validRelationships = ['is_a', 'has_root', 'is_related_to'];
        this.validDomains = [
            'Nature', 'Society', 'Emotion', 'Body', 'Technology',
            'Action', 'Quality', 'Grammar', 'General'
        ];
    }

    /**
     * Validate complete graph data structure
     */
    validateGraphData(graphData) {
        const errors = [];
        const warnings = [];

        try {
            // Validate top-level structure
            this.validateStructure(graphData, errors);

            if (errors.length > 0) {
                return { valid: false, errors, warnings };
            }

            // Validate metadata
            this.validateMetadata(graphData.metadata, errors, warnings);

            // Validate nodes
            const nodeValidation = this.validateNodes(graphData.nodes);
            errors.push(...nodeValidation.errors);
            warnings.push(...nodeValidation.warnings);

            // Validate edges
            const nodeIds = graphData.nodes.map(node => node.id);
            const edgeValidation = this.validateEdges(graphData.edges, nodeIds);
            errors.push(...edgeValidation.errors);
            warnings.push(...edgeValidation.warnings);

            // Validate graph consistency
            const consistencyValidation = this.validateConsistency(graphData.nodes, graphData.edges);
            errors.push(...consistencyValidation.errors);
            warnings.push(...consistencyValidation.warnings);

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                stats: this.generateStats(graphData)
            };

        } catch (error) {
            errors.push(`Validation error: ${error.message}`);
            return { valid: false, errors, warnings };
        }
    }

    /**
     * Validate top-level graph structure
     */
    validateStructure(graphData, errors) {
        if (!graphData || typeof graphData !== 'object') {
            errors.push('Graph data must be an object');
            return;
        }

        if (!graphData.nodes || !Array.isArray(graphData.nodes)) {
            errors.push('Graph data must contain a "nodes" array');
        }

        if (!graphData.edges || !Array.isArray(graphData.edges)) {
            errors.push('Graph data must contain an "edges" array');
        }

        if (!graphData.metadata || typeof graphData.metadata !== 'object') {
            errors.push('Graph data must contain a "metadata" object');
        }
    }

    /**
     * Validate metadata section
     */
    validateMetadata(metadata, errors, warnings) {
        const requiredFields = ['version', 'created', 'curated_by'];

        requiredFields.forEach(field => {
            if (!metadata[field]) {
                errors.push(`Metadata missing required field: ${field}`);
            }
        });

        // Validate version format
        if (metadata.version && !/^\d+\.\d+(\.\d+)?$/.test(metadata.version)) {
            warnings.push('Version should follow semantic versioning (e.g., "1.0.0")');
        }

        // Validate date format
        if (metadata.created && !this.isValidDate(metadata.created)) {
            warnings.push('Created date should be in YYYY-MM-DD format');
        }

        // Validate counts if present
        if (metadata.node_count && typeof metadata.node_count !== 'number') {
            warnings.push('node_count should be a number');
        }

        if (metadata.edge_count && typeof metadata.edge_count !== 'number') {
            warnings.push('edge_count should be a number');
        }
    }

    /**
     * Validate all nodes in the graph
     */
    validateNodes(nodes) {
        const errors = [];
        const warnings = [];
        const seenIds = new Set();
        const seenLabels = new Map(); // Track labels by type for duplicate detection

        nodes.forEach((nodeData, index) => {
            try {
                // Validate basic node structure
                this.validateNodeStructure(nodeData, index, errors);

                // Check for duplicate IDs
                if (seenIds.has(nodeData.id)) {
                    errors.push(`Duplicate node ID at index ${index}: "${nodeData.id}"`);
                } else {
                    seenIds.add(nodeData.id);
                }

                // Check for duplicate labels within same type
                const labelKey = `${nodeData.type}:${nodeData.label}`;
                if (seenLabels.has(labelKey)) {
                    warnings.push(`Duplicate label "${nodeData.label}" for type "${nodeData.type}" at index ${index}`);
                } else {
                    seenLabels.set(labelKey, index);
                }

                // Validate node-specific rules
                this.validateNodeRules(nodeData, index, errors, warnings);

            } catch (error) {
                errors.push(`Node validation error at index ${index}: ${error.message}`);
            }
        });

        return { errors, warnings };
    }

    /**
     * Validate individual node structure
     */
    validateNodeStructure(nodeData, index, errors) {
        const requiredFields = ['id', 'label', 'type'];

        requiredFields.forEach(field => {
            if (!nodeData[field]) {
                errors.push(`Node at index ${index}: Missing required field "${field}"`);
            }
        });

        // Validate node type
        if (nodeData.type && !this.validNodeTypes.includes(nodeData.type)) {
            errors.push(`Node at index ${index}: Invalid type "${nodeData.type}". Must be one of: ${this.validNodeTypes.join(', ')}`);
        }

        // Validate domain if present
        if (nodeData.domain && !this.validDomains.includes(nodeData.domain)) {
            errors.push(`Node at index ${index}: Invalid domain "${nodeData.domain}". Must be one of: ${this.validDomains.join(', ')}`);
        }

        // Validate ID format
        if (nodeData.id && !this.isValidNodeId(nodeData.id)) {
            errors.push(`Node at index ${index}: Invalid ID format "${nodeData.id}". Should match pattern: type_label`);
        }
    }

    /**
     * Validate node-specific business rules
     */
    validateNodeRules(nodeData, index, errors, warnings) {
        // Fidakune nodes should have pronunciation
        if ((nodeData.type === 'fidakune_root' || nodeData.type === 'fidakune_word') && !nodeData.pronunciation) {
            warnings.push(`Fidakune node at index ${index}: Missing pronunciation for "${nodeData.label}"`);
        }

        // Compound words should follow naming convention
        if (nodeData.type === 'fidakune_word' && nodeData.label.includes('-')) {
            if (!nodeData.id.includes('_')) {
                warnings.push(`Compound word at index ${index}: ID should reflect compound structure`);
            }
        }

        // English keywords should not have pronunciation
        if (nodeData.type === 'english_keyword' && nodeData.pronunciation) {
            warnings.push(`English keyword at index ${index}: Should not have pronunciation field`);
        }

        // Validate pronunciation format if present
        if (nodeData.pronunciation && !this.isValidPronunciation(nodeData.pronunciation)) {
            warnings.push(`Node at index ${index}: Pronunciation should be in IPA format with forward slashes`);
        }
    }

    /**
     * Validate all edges in the graph
     */
    validateEdges(edges, nodeIds) {
        const errors = [];
        const warnings = [];
        const nodeIdSet = new Set(nodeIds);
        const seenEdges = new Set(); // Track unique edge combinations

        edges.forEach((edgeData, index) => {
            try {
                // Validate basic edge structure
                this.validateEdgeStructure(edgeData, index, errors);

                // Check that source and target nodes exist
                if (!nodeIdSet.has(edgeData.source)) {
                    errors.push(`Edge at index ${index}: Source node "${edgeData.source}" not found`);
                }

                if (!nodeIdSet.has(edgeData.target)) {
                    errors.push(`Edge at index ${index}: Target node "${edgeData.target}" not found`);
                }

                // Check for self-loops
                if (edgeData.source === edgeData.target) {
                    errors.push(`Edge at index ${index}: Self-loop detected (${edgeData.source})`);
                }

                // Check for duplicate edges
                const edgeKey = `${edgeData.source}->${edgeData.target}:${edgeData.relationship}`;
                if (seenEdges.has(edgeKey)) {
                    warnings.push(`Duplicate edge at index ${index}: ${edgeKey}`);
                } else {
                    seenEdges.add(edgeKey);
                }

                // Validate edge-specific rules
                this.validateEdgeRules(edgeData, index, errors, warnings);

            } catch (error) {
                errors.push(`Edge validation error at index ${index}: ${error.message}`);
            }
        });

        return { errors, warnings };
    }

    /**
     * Validate individual edge structure
     */
    validateEdgeStructure(edgeData, index, errors) {
        const requiredFields = ['source', 'target', 'relationship'];

        requiredFields.forEach(field => {
            if (!edgeData[field]) {
                errors.push(`Edge at index ${index}: Missing required field "${field}"`);
            }
        });

        // Validate relationship type
        if (edgeData.relationship && !this.validRelationships.includes(edgeData.relationship)) {
            errors.push(`Edge at index ${index}: Invalid relationship "${edgeData.relationship}". Must be one of: ${this.validRelationships.join(', ')}`);
        }

        // Validate strength
        if (edgeData.strength !== undefined) {
            if (typeof edgeData.strength !== 'number' || edgeData.strength < 0 || edgeData.strength > 1) {
                errors.push(`Edge at index ${index}: Strength must be a number between 0 and 1`);
            }
        }
    }

    /**
     * Validate edge-specific business rules
     */
    validateEdgeRules(edgeData, index, errors, warnings) {
        // has_root relationships should have strength 1.0
        if (edgeData.relationship === 'has_root' && edgeData.strength !== 1.0) {
            warnings.push(`Edge at index ${index}: has_root relationships should have strength 1.0`);
        }

        // is_a relationships should have high strength
        if (edgeData.relationship === 'is_a' && edgeData.strength < 0.8) {
            warnings.push(`Edge at index ${index}: is_a relationships should have high strength (≥0.8)`);
        }

        // All edges should have descriptions
        if (!edgeData.description) {
            warnings.push(`Edge at index ${index}: Missing description for relationship`);
        }
    }

    /**
     * Validate graph consistency and semantic rules
     */
    validateConsistency(nodes, edges) {
        const errors = [];
        const warnings = [];

        // Create lookup maps
        const nodeMap = new Map(nodes.map(node => [node.id, node]));
        const edgesBySource = new Map();
        const edgesByTarget = new Map();

        // Group edges by source and target
        edges.forEach(edge => {
            if (!edgesBySource.has(edge.source)) {
                edgesBySource.set(edge.source, []);
            }
            edgesBySource.get(edge.source).push(edge);

            if (!edgesByTarget.has(edge.target)) {
                edgesByTarget.set(edge.target, []);
            }
            edgesByTarget.get(edge.target).push(edge);
        });

        // Validate compound word consistency
        this.validateCompoundWords(nodes, edges, nodeMap, errors, warnings);

        // Validate relationship consistency
        this.validateRelationshipConsistency(nodes, edges, nodeMap, errors, warnings);

        // Check for orphaned nodes
        this.checkOrphanedNodes(nodes, edges, warnings);

        return { errors, warnings };
    }

    /**
     * Validate compound word structure consistency
     */
    validateCompoundWords(nodes, edges, nodeMap, errors, warnings) {
        const compoundWords = nodes.filter(node =>
            node.type === 'fidakune_word' && node.label.includes('-')
        );

        compoundWords.forEach(compound => {
            const roots = compound.label.split('-');
            const hasRootEdges = edges.filter(edge =>
                edge.source === compound.id && edge.relationship === 'has_root'
            );

            // Check that compound has has_root edges for each component
            if (hasRootEdges.length !== roots.length) {
                warnings.push(`Compound word "${compound.label}" should have has_root edges for all components`);
            }

            // Check that root nodes exist
            roots.forEach(rootLabel => {
                const rootId = `fidakune_${rootLabel}`;
                if (!nodeMap.has(rootId)) {
                    warnings.push(`Root "${rootLabel}" for compound "${compound.label}" not found in graph`);
                }
            });
        });
    }

    /**
     * Validate relationship consistency
     */
    validateRelationshipConsistency(nodes, edges, nodeMap, errors, warnings) {
        // Check for bidirectional relationships that should be unidirectional
        const relationshipPairs = new Map();

        edges.forEach(edge => {
            const reverseKey = `${edge.target}->${edge.source}:${edge.relationship}`;
            if (relationshipPairs.has(reverseKey)) {
                warnings.push(`Bidirectional ${edge.relationship} relationship between "${edge.source}" and "${edge.target}"`);
            }

            const forwardKey = `${edge.source}->${edge.target}:${edge.relationship}`;
            relationshipPairs.set(forwardKey, edge);
        });
    }

    /**
     * Check for orphaned nodes (nodes with no connections)
     */
    checkOrphanedNodes(nodes, edges, warnings) {
        const connectedNodes = new Set();

        edges.forEach(edge => {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
        });

        nodes.forEach(node => {
            if (!connectedNodes.has(node.id)) {
                warnings.push(`Orphaned node: "${node.label}" (${node.id}) has no connections`);
            }
        });
    }

    /**
     * Generate statistics about the graph
     */
    generateStats(graphData) {
        const nodesByType = {};
        const edgesByRelationship = {};
        const domainCounts = {};

        // Count nodes by type
        graphData.nodes.forEach(node => {
            nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
            domainCounts[node.domain] = (domainCounts[node.domain] || 0) + 1;
        });

        // Count edges by relationship
        graphData.edges.forEach(edge => {
            edgesByRelationship[edge.relationship] = (edgesByRelationship[edge.relationship] || 0) + 1;
        });

        return {
            totalNodes: graphData.nodes.length,
            totalEdges: graphData.edges.length,
            nodesByType: nodesByType,
            edgesByRelationship: edgesByRelationship,
            domainCounts: domainCounts,
            averageConnections: graphData.edges.length / graphData.nodes.length
        };
    }

    /**
     * Utility methods for validation
     */

    isValidDate(dateString) {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(Date.parse(dateString));
    }

    isValidNodeId(id) {
        return /^(fidakune_|en_)[a-z_]+$/.test(id);
    }

    isValidPronunciation(pronunciation) {
        return /^\/[^\/]+\/$/.test(pronunciation);
    }
}

/**
 * GraphSchema defines the expected structure of graph data
 */
class GraphSchema {
    constructor() {
        this.schema = {
            type: 'object',
            required: ['metadata', 'nodes', 'edges'],
            properties: {
                metadata: {
                    type: 'object',
                    required: ['version', 'created', 'curated_by'],
                    properties: {
                        version: { type: 'string' },
                        created: { type: 'string' },
                        curated_by: { type: 'string' },
                        description: { type: 'string' },
                        node_count: { type: 'number' },
                        edge_count: { type: 'number' }
                    }
                },
                nodes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'label', 'type'],
                        properties: {
                            id: { type: 'string' },
                            label: { type: 'string' },
                            type: {
                                type: 'string',
                                enum: ['fidakune_root', 'fidakune_word', 'english_keyword']
                            },
                            definition: { type: 'string' },
                            domain: { type: 'string' },
                            pronunciation: { type: 'string' },
                            metadata: { type: 'object' }
                        }
                    }
                },
                edges: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['source', 'target', 'relationship'],
                        properties: {
                            source: { type: 'string' },
                            target: { type: 'string' },
                            relationship: {
                                type: 'string',
                                enum: ['is_a', 'has_root', 'is_related_to']
                            },
                            strength: {
                                type: 'number',
                                minimum: 0,
                                maximum: 1
                            },
                            description: { type: 'string' },
                            metadata: { type: 'object' }
                        }
                    }
                }
            }
        };
    }

    getSchema() {
        return this.schema;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GraphValidator,
        GraphSchema
    };
}