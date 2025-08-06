"""
Test Suite for Fidakune Digital Lexicon System

This module provides comprehensive tests for the lexicon functionality,
ensuring the bidirectional linking and core features work correctly.
"""

import pytest
import json
import tempfile
import os
from pathlib import Path

# Import our lexicon system
import sys
sys.path.append(str(Path(__file__).parent.parent))

from lexicon_system.lexicon import FidakuneLexicon
from lexicon_system.schema import LexiconEntry, WordType, migrate_legacy_entry


class TestLexiconSchema:
    """Test the lexicon data schema and entry validation."""
    
    def test_root_word_creation(self):
        """Test creating a valid root word entry."""
        entry = LexiconEntry(
            word="lum",
            pronunciation="/lum/",
            definition="light",
            domain="Nature",
            pos_type="noun",
            word_type=WordType.ROOT
        )
        
        assert entry.word == "lum"
        assert entry.word_type == WordType.ROOT
        assert entry.roots is None
        assert len(entry.derived_words) == 0
    
    def test_compound_word_creation(self):
        """Test creating a valid compound word entry."""
        entry = LexiconEntry(
            word="sole-lum",
            pronunciation="/ˈso.le.lum/",
            definition="hope",
            domain="Emotion",
            pos_type="noun",
            word_type=WordType.COMPOUND,
            roots=["sole", "lum"],
            etymology_note="sun-light"
        )
        
        assert entry.word == "sole-lum"
        assert entry.word_type == WordType.COMPOUND
        assert entry.roots == ["sole", "lum"]
        assert entry.etymology_note == "sun-light"
    
    def test_compound_validation_error(self):
        """Test that compound words must have roots defined."""
        with pytest.raises(ValueError, match="Compound word .* must have roots"):
            LexiconEntry(
                word="test-word",
                pronunciation="/test/",
                definition="test",
                domain="Test",
                pos_type="noun",
                word_type=WordType.COMPOUND
                # Missing roots!
            )
    
    def test_root_validation_error(self):
        """Test that root words should not have roots defined."""
        with pytest.raises(ValueError, match="Root word .* should not have roots"):
            LexiconEntry(
                word="test",
                pronunciation="/test/",
                definition="test",
                domain="Test",
                pos_type="noun",
                word_type=WordType.ROOT,
                roots=["invalid"]  # Root shouldn't have roots!
            )
    
    def test_entry_serialization(self):
        """Test converting entries to/from dictionary format."""
        entry = LexiconEntry(
            word="sole-lum",
            pronunciation="/ˈso.le.lum/",
            definition="hope",
            domain="Emotion",
            pos_type="noun",
            word_type=WordType.COMPOUND,
            roots=["sole", "lum"]
        )
        
        # Test to_dict
        data = entry.to_dict()
        assert data["word"] == "sole-lum"
        assert data["word_type"] == "Compound"
        assert data["roots"] == ["sole", "lum"]
        
        # Test from_dict
        reconstructed = LexiconEntry.from_dict(data)
        assert reconstructed.word == entry.word
        assert reconstructed.word_type == entry.word_type
        assert reconstructed.roots == entry.roots


class TestLexiconMigration:
    """Test migration from legacy format."""
    
    def test_legacy_compound_detection(self):
        """Test automatic detection of compound words."""
        legacy_data = {
            "word": "sole-lum",
            "pronunciation": "/ˈso.le.lum/",
            "meaning": "hope (idiom: sun-light)",
            "domain": "Emotion",
            "type": "noun"
        }
        
        entry = migrate_legacy_entry(legacy_data)
        
        assert entry.word_type == WordType.COMPOUND
        assert entry.roots == ["sole", "lum"]
        assert "hope" in entry.definition
        assert "sun-light" in entry.etymology_note
    
    def test_legacy_root_word(self):
        """Test migration of root words."""
        legacy_data = {
            "word": "lum",
            "pronunciation": "/lum/",
            "meaning": "light",
            "domain": "Nature",
            "type": "noun"
        }
        
        entry = migrate_legacy_entry(legacy_data)
        
        assert entry.word_type == WordType.ROOT
        assert entry.roots is None
        assert entry.definition == "light"


class TestFidakuneLexicon:
    """Test the main lexicon management system."""
    
    def setup_method(self):
        """Set up test lexicon with sample data."""
        self.lexicon = FidakuneLexicon()
        
        # Add root words
        self.lexicon.add_entry(LexiconEntry(
            word="sole",
            pronunciation="/ˈso.le/",
            definition="sun",
            domain="Nature",
            pos_type="noun",
            word_type=WordType.ROOT
        ))
        
        self.lexicon.add_entry(LexiconEntry(
            word="lum",
            pronunciation="/lum/",
            definition="light",
            domain="Nature",
            pos_type="noun",
            word_type=WordType.ROOT
        ))
        
        # Add compound word
        self.lexicon.add_entry(LexiconEntry(
            word="sole-lum",
            pronunciation="/ˈso.le.lum/",
            definition="hope",
            domain="Emotion",
            pos_type="noun",
            word_type=WordType.COMPOUND,
            roots=["sole", "lum"],
            etymology_note="sun-light"
        ))
    
    def test_entry_retrieval(self):
        """Test basic entry retrieval."""
        entry = self.lexicon.get_entry("sole-lum")
        assert entry is not None
        assert entry.definition == "hope"
        assert entry.word_type == WordType.COMPOUND
    
    def test_roots_retrieval(self):
        """Test getting roots for compound words."""
        roots = self.lexicon.get_roots("sole-lum")
        assert roots == ["sole", "lum"]
        
        # Root words should return empty list
        assert self.lexicon.get_roots("sole") == []
    
    def test_bidirectional_linking(self):
        """Test that bidirectional links are created correctly."""
        # Check that root words know about their derived words
        sole_derived = self.lexicon.get_derived_words("sole")
        lum_derived = self.lexicon.get_derived_words("lum")
        
        assert "sole-lum" in sole_derived
        assert "sole-lum" in lum_derived
    
    def test_compound_chain_analysis(self):
        """Test derivation chain analysis."""
        chains = self.lexicon.get_compound_chain("sole-lum")
        
        # Should find paths back to roots
        assert len(chains) > 0
        # Each chain should end with the compound word
        for chain in chains:
            assert chain[-1] == "sole-lum"
    
    def test_domain_search(self):
        """Test searching by domain."""
        nature_words = self.lexicon.find_words_by_domain("Nature")
        nature_word_names = [entry.word for entry in nature_words]
        
        assert "sole" in nature_word_names
        assert "lum" in nature_word_names
        assert "sole-lum" not in nature_word_names  # This is in Emotion domain
    
    def test_statistics_generation(self):
        """Test lexicon statistics."""
        stats = self.lexicon.get_lexicon_statistics()
        
        assert stats["total_words"] == 3
        assert stats["root_words"] == 2
        assert stats["compound_words"] == 1
        assert stats["average_compound_length"] == 2.0
        
        # Check most productive roots
        productivity = dict(stats["most_productive_roots"])
        assert productivity.get("sole", 0) >= 1
        assert productivity.get("lum", 0) >= 1
    
    def test_graph_export(self):
        """Test graph data export for visualization."""
        graph_data = self.lexicon.export_graph_data()
        
        assert "nodes" in graph_data
        assert "edges" in graph_data
        
        # Should have nodes for all words
        node_ids = [node["id"] for node in graph_data["nodes"]]
        assert "sole" in node_ids
        assert "lum" in node_ids
        assert "sole-lum" in node_ids
        
        # Should have edges for relationships
        assert len(graph_data["edges"]) > 0
    
    def test_json_persistence(self):
        """Test saving and loading lexicon data."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            temp_path = f.name
        
        try:
            # Save lexicon
            self.lexicon.save_to_json(temp_path)
            
            # Load into new lexicon
            new_lexicon = FidakuneLexicon()
            new_lexicon.load_from_legacy_json(temp_path)  # Will work with enhanced format too
            
            # Verify data integrity
            assert new_lexicon.get_entry("sole-lum") is not None
            assert new_lexicon.get_roots("sole-lum") == ["sole", "lum"]
            assert "sole-lum" in new_lexicon.get_derived_words("sole")
            
        finally:
            # Clean up
            os.unlink(temp_path)


class TestAcceptanceCriteria:
    """
    Test suite specifically for the acceptance criteria defined in requirements.
    """
    
    def setup_method(self):
        """Set up a realistic test scenario."""
        self.lexicon = FidakuneLexicon()
        
        # Create a small but representative lexicon
        test_words = [
            ("aqua", "/ˈa.kwa/", "water", "Nature", "noun", WordType.ROOT),
            ("kor", "/kor/", "heart", "Body", "noun", WordType.ROOT),
            ("sole", "/ˈso.le/", "sun", "Nature", "noun", WordType.ROOT),
            ("lum", "/lum/", "light", "Nature", "noun", WordType.ROOT),
        ]
        
        for word, pron, defn, domain, pos, wtype in test_words:
            self.lexicon.add_entry(LexiconEntry(
                word=word, pronunciation=pron, definition=defn,
                domain=domain, pos_type=pos, word_type=wtype
            ))
        
        # Add compound words
        compounds = [
            ("aqua-kor", "/ˈa.kwa.kor/", "emotions", "Emotion", "noun", 
             ["aqua", "kor"], "water-heart"),
            ("sole-lum", "/ˈso.le.lum/", "hope", "Emotion", "noun", 
             ["sole", "lum"], "sun-light"),
        ]
        
        for word, pron, defn, domain, pos, roots, etym in compounds:
            self.lexicon.add_entry(LexiconEntry(
                word=word, pronunciation=pron, definition=defn,
                domain=domain, pos_type=pos, word_type=WordType.COMPOUND,
                roots=roots, etymology_note=etym
            ))
    
    def test_acceptance_data_schema_established(self):
        """✓ A data schema for lexicon entries is established and documented."""
        # Test that all required fields are present and properly typed
        entry = self.lexicon.get_entry("sole-lum")
        
        assert hasattr(entry, 'word')
        assert hasattr(entry, 'pronunciation') 
        assert hasattr(entry, 'definition')
        assert hasattr(entry, 'word_type')
        assert hasattr(entry, 'roots')
        assert isinstance(entry.word_type, WordType)
    
    def test_acceptance_compound_roots_display(self):
        """✓ All compound word entries correctly display their root words."""
        entry = self.lexicon.get_entry("sole-lum")
        
        assert entry.word_type == WordType.COMPOUND
        assert entry.roots == ["sole", "lum"]
        
        # Verify roots exist and are accessible
        for root in entry.roots:
            root_entry = self.lexicon.get_entry(root)
            assert root_entry is not None
            assert root_entry.word_type == WordType.ROOT
    
    def test_acceptance_navigation_functionality(self):
        """✓ A user can successfully navigate from compound to roots via links."""
        # This tests the underlying data structure that enables navigation
        compound = self.lexicon.get_entry("sole-lum")
        
        # Can get to each root
        for root_word in compound.roots:
            root_entry = self.lexicon.get_entry(root_word)
            assert root_entry is not None
            
            # Can navigate back via derived words
            assert compound.word in root_entry.derived_words
    
    def test_acceptance_bidirectional_identification(self):
        """✓ System can programmatically identify all words derived from a root."""
        # Test bidirectional linking
        sole_derived = self.lexicon.get_derived_words("sole")
        lum_derived = self.lexicon.get_derived_words("lum")
        aqua_derived = self.lexicon.get_derived_words("aqua")
        
        assert "sole-lum" in sole_derived
        assert "sole-lum" in lum_derived
        assert "aqua-kor" in aqua_derived
        
        # Verify derived words are actually compounds that use the root
        for derived_word in sole_derived:
            derived_entry = self.lexicon.get_entry(derived_word)
            assert "sole" in derived_entry.roots
    
    def test_acceptance_scalability(self):
        """✓ Solution is scalable to handle ~1,200 words."""
        # Test performance characteristics that indicate scalability
        import time
        
        # Time the addition of entries (should be fast)
        start_time = time.time()
        
        # Add a moderate number of test entries
        for i in range(100):
            self.lexicon.add_entry(LexiconEntry(
                word=f"test{i}",
                pronunciation=f"/test{i}/",
                definition=f"test word {i}",
                domain="Test",
                pos_type="noun",
                word_type=WordType.ROOT
            ))
        
        add_time = time.time() - start_time
        
        # Time retrieval operations (should be very fast)
        start_time = time.time()
        
        for i in range(50):
            entry = self.lexicon.get_entry(f"test{i}")
            assert entry is not None
        
        retrieval_time = time.time() - start_time
        
        # Basic performance assertions (generous thresholds)
        assert add_time < 1.0  # Should add 100 entries in under 1 second
        assert retrieval_time < 0.1  # Should retrieve 50 entries in under 0.1 seconds
        
        # Test graph operations remain efficient
        start_time = time.time()
        stats = self.lexicon.get_lexicon_statistics()
        stats_time = time.time() - start_time
        
        assert stats_time < 0.5  # Statistics should be computed quickly
        assert stats["total_words"] >= 106  # Original + test words


def run_acceptance_tests():
    """Run the acceptance criteria tests and generate a report."""
    print("="*70)
    print("FIDAKUNE LEXICON ACCEPTANCE CRITERIA TEST REPORT")
    print("="*70)
    
    pytest.main([
        __file__ + "::TestAcceptanceCriteria",
        "-v",
        "--tb=short"
    ])


if __name__ == "__main__":
    # Run all tests
    pytest.main([__file__, "-v"])
