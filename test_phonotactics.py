#!/usr/bin/env python3
"""Unit tests for phonotactic validation system."""

import sys
sys.path.append('scripts')

from analyze_proposal import ProposalAnalyzer

def test_phonotactic_validation():
    """Test various phonotactic scenarios."""
    analyzer = ProposalAnalyzer()
    analyzer.load_lexicon()
    analyzer.load_phonology()
    
    test_cases = [
        # Valid cases
        ("ami", True, "Simple CV word"),
        ("kore", True, "CVCV word"),
        ("ami-lum", True, "Valid compound"),
        ("sole-lum", True, "Compound with existing words"),
        
        # Invalid phonemes
        ("xyz", False, "Invalid phonemes"),
        ("ami-qux", False, "Invalid phoneme in compound"),
        
        # Invalid clusters
        ("spami", False, "Invalid cluster at start"),
        ("ami-xyz", False, "Invalid phonemes"),
        
        # Valid clusters in correct position
        ("a-sta", True, "Valid cluster st in second syllable"),
        ("e-spa", True, "Valid cluster sp in second syllable"),
    ]
    
    print("Testing Phonotactic Validation:")
    print("=" * 50)
    
    for word, expected_valid, description in test_cases:
        # Create test issue
        test_issue = f"""### Proposed Word
{word}

### Definition
Test word.

### Semantic Domain
General

### Justification & Etymology
Test case: {description}"""
        
        fields = analyzer.parse_issue_body(test_issue)
        analyzer.analysis_results = {
            'phonotactics': {'status': 'PENDING', 'messages': []},
            'lexicon': {'status': 'PENDING', 'messages': []},
            'semantics': {'status': 'PENDING', 'messages': []},
            'recommendation': 'PENDING'
        }
        
        analyzer._analyze_phonotactics_basic(word)
        
        is_valid = analyzer.analysis_results['phonotactics']['status'] in ['PASS', 'WARNING']
        status = "✅ PASS" if is_valid == expected_valid else "❌ FAIL"
        
        print(f"{status} {word:12} - {description}")
        if is_valid != expected_valid:
            print(f"     Expected: {'VALID' if expected_valid else 'INVALID'}")
            print(f"     Got: {'VALID' if is_valid else 'INVALID'}")
            print(f"     Messages: {analyzer.analysis_results['phonotactics']['messages']}")

if __name__ == "__main__":
    test_phonotactic_validation()