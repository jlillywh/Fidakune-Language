"""
Fidakune Digital Lexicon Schema

This module defines the enhanced data structure for the Fidakune lexicon,
supporting bidirectional linking between compound words and their roots.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Set
from enum import Enum
import json
import re


class WordType(Enum):
    """Enumeration for word types in the Fidakune lexicon."""
    ROOT = "Root"
    COMPOUND = "Compound"


@dataclass
class LexiconEntry:
    """
    Enhanced data structure for Fidakune lexicon entries.
    
    This structure supports the core functional requirements:
    - Standard fields for all entries
    - Mandatory roots field for compound words
    - Bidirectional linking capabilities
    """
    word: str
    pronunciation: str
    definition: str
    domain: str
    pos_type: str  # part of speech (noun, verb, etc.)
    word_type: WordType
    roots: Optional[List[str]] = None  # Required for compound words
    derived_words: Set[str] = field(default_factory=set)  # Bidirectional linking
    etymology_note: Optional[str] = None  # For compound explanation
    
    def __post_init__(self):
        """Validate entry consistency after initialization."""
        if self.word_type == WordType.COMPOUND and not self.roots:
            raise ValueError(f"Compound word '{self.word}' must have roots defined")
        
        if self.word_type == WordType.ROOT and self.roots:
            raise ValueError(f"Root word '{self.word}' should not have roots defined")
    
    def to_dict(self) -> Dict:
        """Convert entry to dictionary format for JSON serialization."""
        return {
            "word": self.word,
            "pronunciation": self.pronunciation,
            "definition": self.definition,
            "domain": self.domain,
            "pos_type": self.pos_type,
            "word_type": self.word_type.value,
            "roots": self.roots,
            "derived_words": list(self.derived_words) if self.derived_words else [],
            "etymology_note": self.etymology_note
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'LexiconEntry':
        """Create entry from dictionary data."""
        return cls(
            word=data["word"],
            pronunciation=data["pronunciation"],
            definition=data["definition"],
            domain=data["domain"],
            pos_type=data["pos_type"],
            word_type=WordType(data["word_type"]),
            roots=data.get("roots"),
            derived_words=set(data.get("derived_words", [])),
            etymology_note=data.get("etymology_note")
        )


def detect_compound_structure(word: str) -> Optional[List[str]]:
    """
    Automatically detect if a word is compound based on Fidakune conventions.
    
    Args:
        word: The word to analyze
        
    Returns:
        List of root components if compound, None if not compound
    """
    # Fidakune uses hyphens to separate compound elements
    if '-' in word:
        return word.split('-')
    
    # Could be extended to detect other compound patterns
    return None


def migrate_legacy_entry(legacy_data: Dict) -> LexiconEntry:
    """
    Convert legacy lexicon format to enhanced schema.
    
    Args:
        legacy_data: Dictionary from existing lexicon.json format
        
    Returns:
        Enhanced LexiconEntry with proper classification and relationships
    """
    word = legacy_data["word"]
    
    # Detect if word is compound
    compound_roots = detect_compound_structure(word)
    
    if compound_roots:
        word_type = WordType.COMPOUND
        # Extract etymology note from meaning if present
        meaning = legacy_data["meaning"]
        etymology_match = re.search(r'\((?:compound|idiom):\s*([^)]+)\)', meaning)
        etymology_note = etymology_match.group(1) if etymology_match else None
        # Clean definition by removing etymology note
        clean_definition = re.sub(r'\s*\((?:compound|idiom):[^)]+\)', '', meaning).strip()
    else:
        word_type = WordType.ROOT
        compound_roots = None
        etymology_note = None
        clean_definition = legacy_data["meaning"]
    
    return LexiconEntry(
        word=word,
        pronunciation=legacy_data["pronunciation"],
        definition=clean_definition,
        domain=legacy_data["domain"],
        pos_type=legacy_data["type"],
        word_type=word_type,
        roots=compound_roots,
        etymology_note=etymology_note
    )
