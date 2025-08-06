#!/usr/bin/env python3
"""Unit tests for homophone detection system."""

import sys
sys.path.append('scripts')

from analyze_proposal import ProposalAnalyzer

def test_homophone_detection():
    """Test homophone detection for various word similarities."""
    analyzer = ProposalAnalyzer()
    analyzer.load_lexicon()
    analyzer.load_phonology()
    
    test_cases = [
        # Similar sounding words
        ("amie", "Should detect similarity to 'ami'"),
        ("kora", "Should detect similarity to 'kor'"),
        ("aquae", "Should detect similarity to 'aqua'"),
        
        # Dissimilar words
        ("zyx", "Should not detect similarities (if it had valid phonemes)"),
        ("completely-different", "Should not detect similarities"),
        
        # Exact matches (should be caught by lexicon analysis, not homophone)
        ("ami", "Exact match - should be handled by lexicon analysis"),
    ]
    
    print("Testing Homophone Detection:")
    print("=" * 50)
    
    for word, description in test_cases:
        # Create test issue
        test_issue = f"""### Proposed Word
{word}

### Definition
Test word for homophone detection.

### Semantic Domain
General

### Justification & Etymology
Test case: {description}"""
        
        fields = analyzer.parse_issue_body(test_issue)
        analyzer.analysis_results = {
            'phonotactics': {'status': 'PENDING', 'messages': []},
            'lexicon': {'status': 'PENDING', 'messages': []},
            'homophones': {'status': 'PENDING', 'messages': []},
            'semantics': {'status': 'PENDING', 'messages': []},
            'recommendation': 'PENDING'
        }
        
        # Only test homophone detection
        analyzer._analyze_homophones(word)
        
        status = analyzer.analysis_results['homophones']['status']
        messages = analyzer.analysis_results['homophones']['messages']
        
        print(f"\n{word:20} - {description}")
        print(f"Status: {status}")
        for msg in messages:
            print(f"  {msg}")

def test_pronunciation_similarity():
    """Test the pronunciation similarity calculation."""
    analyzer = ProposalAnalyzer()
    analyzer.load_lexicon()
    analyzer.load_phonology()
    
    test_pairs = [
        ("ami", "amie", "Should be very similar"),
        ("kor", "kora", "Should be similar"),
        ("aqua", "aquae", "Should be similar"),
        ("ami", "xyz", "Should be dissimilar"),
        ("hello", "world", "Should be dissimilar"),
    ]
    
    print("\n\nTesting Pronunciation Similarity:")
    print("=" * 50)
    
    for word1, word2, description in test_pairs:
        pron1 = analyzer._generate_pronunciation(word1)
        pron2 = analyzer._generate_pronunciation(word2)
        similarity = analyzer._calculate_pronunciation_similarity(pron1, pron2)
        
        print(f"{word1:8} vs {word2:8} - Similarity: {similarity:.3f} - {description}")

if __name__ == "__main__":
    test_homophone_detection()
    test_pronunciation_similarity()