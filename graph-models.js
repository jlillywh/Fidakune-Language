/**
 * Graph-Based Conceptual Search - Data Models
 * Defines the core data structures for nodes and edges in the lexical graph
 */

/**
 * GraphNode represents a single concept in the lexical network
 */
class GraphNode {
    constructor(data) {
        // Validate required fields
        if (!data.id || !data.label || !data.type) {
            throw new Error('GraphNode requires id, label, and type fields');
        }
        
        this.id = data.id;
        this.label = data.label;
        this.type = data.type; // fidakune_root, fidakune_word, english_keyword
        this.definition = data.definition || '';
        this.domain = data.domain || 'General';
        this.pronunciation = data.pronunciation || '';
        this.metadata = data.metadata || {};
        
        // Validate node type
        this.validateType();
    }
    
    /**
     * Validate that the node type is one of the allowed values
     */
    validateType() {
        const validTypes = ['fidakune_root', 'fidakune_word', 'english_keyword'];
        if (!validTypes.includes(this.type)) {
            throw new Error(`Invalid node type: ${this.type}. Must be one of: ${validTypes.join(', ')}`);
        }
    }
    
    /**
     * Check if this is a Fidakune root morpheme
     */
    isRoot() {
        return this.type === 'fidakune_root';
    }
    
    /**
     * Check if this is a complete Fidakune word
     */
    isWord() {
        return this.type === 'fidakune_word';
    }
    
    /**
     * Check if this is an English keyword
     */
    isEnglishKeyword() {
        return this.type === 'english_keyword';
    }
    
    /**
     * Check if this is any type of Fidakune concept
     */
    isFidakune() {
        return this.isRoot() || this.isWord();
    }
    
    /**
     * Get display information for UI
     */
    getDisplayInfo() {
        return {
            id: this.id,
            label: this.label,
            type: this.type,
            definition: this.definition,
            domain: this.domain,
            pronunciation: this.pronunciation,
            typeLabel: this.getTypeLabel()
        };
    }
    
    /**
     * Get human-readable type label
     */
    getTypeLabel() {
        const typeLabels = {
            'fidakune_root': 'Fidakune Root',
            'fidakune_word': 'Fidakune Word',
            'english_keyword': 'English Concept'
        };
        return typeLabels[this.type] || this.type;
    }
    
    /**
     * Check if this node matches a search query
     */
    matchesQuery(query) {
        const normalizedQuery = query.toLowerCase().trim();
        return this.label.toLowerCase().includes(normalizedQuery) ||
               this.definition.toLowerCase().includes(normalizedQuery);
    }
    
    /**
     * Get similarity score with a query (0-1)
     */
    getSimilarityScore(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const normalizedLabel = this.label.toLowerCase();
        const normalizedDefinition = this.definition.toLowerCase();
        
        // Exact label match
        if (normalizedLabel === normalizedQuery) {
            return 1.0;
        }
        
        // Exact definition match
        if (normalizedDefinition === normalizedQuery) {
            return 0.9;
        }
        
        // Label contains query
        if (normalizedLabel.includes(normalizedQuery)) {
            return 0.8;
        }
        
        // Definition contains query
        if (normalizedDefinition.includes(normalizedQuery)) {
            return 0.6;
        }
        
        // Query contains label (for shorter roots)
        if (normalizedQuery.includes(normalizedLabel) && normalizedLabel.length >= 3) {
            return 0.5;
        }
        
        return 0.0;
    }
    
    /**
     * Convert to JSON for serialization
     */
    toJSON() {
        return {
            id: this.id,
            label: this.label,
            type: this.type,
            definition: this.definition,
            domain: this.domain,
            pronunciation: this.pronunciation,
            metadata: this.metadata
        };
    }
    
    /**
     * Create GraphNode from JSON data
     */
    static fromJSON(data) {
        return new GraphNode(data);
    }
    
    /**
     * Validate an array of node data objects
     */
    static validateNodeArray(nodes) {
        const errors = [];
        const seenIds = new Set();
        
        if (!Array.isArray(nodes)) {
            errors.push('Nodes must be an array');
            return { valid: false, errors };
        }
        
        nodes.forEach((nodeData, index) => {
            try {
                // Check for duplicate IDs
                if (seenIds.has(nodeData.id)) {
                    errors.push(`Duplicate node ID at index ${index}: ${nodeData.id}`);
                } else {
                    seenIds.add(nodeData.id);
                }
                
                // Validate node structure
                new GraphNode(nodeData);
            } catch (error) {
                errors.push(`Node validation error at index ${index}: ${error.message}`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

/**
 * GraphEdge represents a typed relationship between two nodes
 */
class GraphEdge {
    constructor(data) {
        // Validate required fields
        if (!data.source || !data.target || !data.relationship) {
            throw new Error('GraphEdge requires source, target, and relationship fields');
        }
        
        this.source = data.source;
        this.target = data.target;
        this.relationship = data.relationship; // is_a, has_root, is_related_to
        this.strength = data.strength || 1.0;
        this.description = data.description || '';
        this.metadata = data.metadata || {};
        
        // Validate relationship type and strength
        this.validateRelationship();
        this.validateStrength();
    }
    
    /**
     * Validate that the relationship type is allowed
     */
    validateRelationship() {
        const validRelationships = ['is_a', 'has_root', 'is_related_to'];
        if (!validRelationships.includes(this.relationship)) {
            throw new Error(`Invalid relationship: ${this.relationship}. Must be one of: ${validRelationships.join(', ')}`);
        }
    }
    
    /**
     * Validate that strength is between 0 and 1
     */
    validateStrength() {
        if (typeof this.strength !== 'number' || this.strength < 0 || this.strength > 1) {
            throw new Error(`Invalid strength: ${this.strength}. Must be a number between 0 and 1`);
        }
    }
    
    /**
     * Check if this is a direct semantic relationship
     */
    isDirectRelation() {
        return this.relationship === 'is_a';
    }
    
    /**
     * Check if this is a morphological root relationship
     */
    isRootRelation() {
        return this.relationship === 'has_root';
    }
    
    /**
     * Check if this is a conceptual association
     */
    isConceptualRelation() {
        return this.relationship === 'is_related_to';
    }
    
    /**
     * Get human-readable relationship label
     */
    getRelationshipLabel() {
        const relationshipLabels = {
            'is_a': 'is equivalent to',
            'has_root': 'contains root',
            'is_related_to': 'is related to'
        };
        return relationshipLabels[this.relationship] || this.relationship;
    }
    
    /**
     * Get category for UI display
     */
    getCategory() {
        const categories = {
            'is_a': 'Directly Related Concepts',
            'has_root': 'Component Roots to Consider',
            'is_related_to': 'Related Ideas'
        };
        return categories[this.relationship] || 'Other Relationships';
    }
    
    /**
     * Get display information for UI
     */
    getDisplayInfo() {
        return {
            source: this.source,
            target: this.target,
            relationship: this.relationship,
            relationshipLabel: this.getRelationshipLabel(),
            category: this.getCategory(),
            strength: this.strength,
            description: this.description
        };
    }
    
    /**
     * Check if this edge connects two specific nodes
     */
    connects(sourceId, targetId) {
        return this.source === sourceId && this.target === targetId;
    }
    
    /**
     * Check if this edge involves a specific node (as source or target)
     */
    involves(nodeId) {
        return this.source === nodeId || this.target === nodeId;
    }
    
    /**
     * Get the other node ID in this relationship
     */
    getOtherNode(nodeId) {
        if (this.source === nodeId) {
            return this.target;
        } else if (this.target === nodeId) {
            return this.source;
        }
        return null;
    }
    
    /**
     * Convert to JSON for serialization
     */
    toJSON() {
        return {
            source: this.source,
            target: this.target,
            relationship: this.relationship,
            strength: this.strength,
            description: this.description,
            metadata: this.metadata
        };
    }
    
    /**
     * Create GraphEdge from JSON data
     */
    static fromJSON(data) {
        return new GraphEdge(data);
    }
    
    /**
     * Validate an array of edge data objects
     */
    static validateEdgeArray(edges, nodeIds) {
        const errors = [];
        
        if (!Array.isArray(edges)) {
            errors.push('Edges must be an array');
            return { valid: false, errors };
        }
        
        const nodeIdSet = new Set(nodeIds);
        
        edges.forEach((edgeData, index) => {
            try {
                // Validate edge structure
                new GraphEdge(edgeData);
                
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
                
            } catch (error) {
                errors.push(`Edge validation error at index ${index}: ${error.message}`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

/**
 * Custom error classes for graph operations
 */
class GraphValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GraphValidationError';
    }
}

class GraphLoadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GraphLoadError';
    }
}

class GraphSearchError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GraphSearchError';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GraphNode,
        GraphEdge,
        GraphValidationError,
        GraphLoadError,
        GraphSearchError
    };
}