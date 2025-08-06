"""
Fidakune Lexicon Graph Manager

This module implements the core lexicon management system using NetworkX
for modeling vocabulary relationships and enabling efficient bidirectional linking.
"""

import networkx as nx
from typing import Dict, List, Set, Optional, Tuple
import json
from pathlib import Path

from .schema import LexiconEntry, WordType, migrate_legacy_entry


class FidakuneLexicon:
    """
    Core lexicon management system with graph-based relationship modeling.
    
    Uses NetworkX to efficiently manage and query word relationships,
    supporting the bidirectional linking requirements.
    """
    
    def __init__(self):
        """Initialize the lexicon with an empty directed graph."""
        self.graph = nx.DiGraph()
        self.entries: Dict[str, LexiconEntry] = {}
    
    def add_entry(self, entry: LexiconEntry) -> None:
        """
        Add a lexicon entry and establish graph relationships.
        
        Args:
            entry: The lexicon entry to add
        """
        self.entries[entry.word] = entry
        self.graph.add_node(entry.word, entry=entry)
        
        # For compound words, create edges to root words
        if entry.word_type == WordType.COMPOUND and entry.roots:
            for root in entry.roots:
                # Add edge from compound to root
                self.graph.add_edge(entry.word, root, relationship="derives_from")
                # Add reverse edge for bidirectional navigation
                self.graph.add_edge(root, entry.word, relationship="derives_to")
                
                # Update derived_words in root entry if it exists
                if root in self.entries:
                    self.entries[root].derived_words.add(entry.word)
    
    def get_entry(self, word: str) -> Optional[LexiconEntry]:
        """Retrieve a lexicon entry by word."""
        return self.entries.get(word)
    
    def get_roots(self, compound_word: str) -> List[str]:
        """
        Get the root words for a compound word.
        
        Args:
            compound_word: The compound word to analyze
            
        Returns:
            List of root words that form the compound
        """
        entry = self.get_entry(compound_word)
        if entry and entry.word_type == WordType.COMPOUND:
            return entry.roots or []
        return []
    
    def get_derived_words(self, root_word: str) -> Set[str]:
        """
        Get all compound words that use a given root.
        
        Args:
            root_word: The root word to query
            
        Returns:
            Set of compound words derived from the root
        """
        entry = self.get_entry(root_word)
        if entry:
            return entry.derived_words
        return set()
    
    def get_compound_chain(self, word: str, max_depth: int = 3) -> List[List[str]]:
        """
        Get the full derivation chain for a word.
        
        Args:
            word: Starting word
            max_depth: Maximum depth to traverse
            
        Returns:
            List of derivation paths
        """
        paths = []
        
        def dfs_paths(current_word: str, path: List[str], depth: int):
            if depth >= max_depth:
                return
            
            # Get words this derives from
            predecessors = [n for n in self.graph.predecessors(current_word) 
                          if self.graph[current_word][n].get('relationship') == 'derives_from']
            
            if not predecessors:
                # This is a terminal (root) word
                paths.append(path + [current_word])
            else:
                for pred in predecessors:
                    dfs_paths(pred, path + [current_word], depth + 1)
        
        dfs_paths(word, [], 0)
        return paths
    
    def find_words_by_domain(self, domain: str) -> List[LexiconEntry]:
        """Find all words in a specific domain."""
        return [entry for entry in self.entries.values() if entry.domain == domain]
    
    def find_words_by_pattern(self, pattern: str) -> List[LexiconEntry]:
        """Find words matching a pattern (useful for phonological searches)."""
        import re
        regex = re.compile(pattern, re.IGNORECASE)
        return [entry for entry in self.entries.values() 
                if regex.search(entry.word) or regex.search(entry.pronunciation)]
    
    def get_lexicon_statistics(self) -> Dict:
        """Generate comprehensive lexicon statistics."""
        total_words = len(self.entries)
        root_words = sum(1 for e in self.entries.values() if e.word_type == WordType.ROOT)
        compound_words = sum(1 for e in self.entries.values() if e.word_type == WordType.COMPOUND)
        
        # Domain distribution
        domains = {}
        for entry in self.entries.values():
            domains[entry.domain] = domains.get(entry.domain, 0) + 1
        
        # Most productive roots (roots with most derived words)
        root_productivity = {
            word: len(entry.derived_words) 
            for word, entry in self.entries.items() 
            if entry.word_type == WordType.ROOT
        }
        most_productive = sorted(root_productivity.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "total_words": total_words,
            "root_words": root_words,
            "compound_words": compound_words,
            "domain_distribution": domains,
            "most_productive_roots": most_productive,
            "average_compound_length": sum(len(e.roots or []) for e in self.entries.values() 
                                         if e.word_type == WordType.COMPOUND) / max(compound_words, 1)
        }
    
    def load_from_legacy_json(self, file_path: str) -> None:
        """
        Load lexicon data from the existing legacy JSON format.
        
        Args:
            file_path: Path to the legacy lexicon.json file
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            legacy_data = json.load(f)
        
        # Convert legacy entries to enhanced format
        for item in legacy_data:
            try:
                entry = migrate_legacy_entry(item)
                self.add_entry(entry)
            except Exception as e:
                print(f"Warning: Failed to migrate entry {item.get('word', 'unknown')}: {e}")
        
        # Second pass: ensure all root references are valid
        self._validate_root_references()
    
    def _validate_root_references(self) -> None:
        """Validate that all root references in compound words exist."""
        missing_roots = set()
        
        for entry in self.entries.values():
            if entry.word_type == WordType.COMPOUND and entry.roots:
                for root in entry.roots:
                    if root not in self.entries:
                        missing_roots.add(root)
        
        if missing_roots:
            print(f"Warning: Missing root words referenced by compounds: {missing_roots}")
    
    def save_to_json(self, file_path: str) -> None:
        """
        Save the enhanced lexicon to JSON format.
        
        Args:
            file_path: Path where to save the enhanced lexicon
        """
        data = []
        for word in sorted(self.entries.keys()):
            entry = self.entries[word]
            data.append(entry.to_dict())
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def export_graph_data(self) -> Dict:
        """Export graph data for visualization tools."""
        return {
            "nodes": [
                {
                    "id": word,
                    "label": word,
                    "type": entry.word_type.value,
                    "domain": entry.domain,
                    "definition": entry.definition
                }
                for word, entry in self.entries.items()
            ],
            "edges": [
                {
                    "source": u,
                    "target": v,
                    "relationship": data.get("relationship", "unknown")
                }
                for u, v, data in self.graph.edges(data=True)
            ]
        }
