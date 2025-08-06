#!/usr/bin/env python3
"""Unit tests for root word verification system."""

import sys
sys.path.append('scripts')

from analyze_proposal import ProposalAnalyzer

def test_root_verification():
    """Test root word verification for compound words."""
    analyzer = ProposalAnalyzer()
    analyzer.load_lexicon()
    analyzer.load_phonology()
    
    test_cases = [
        # Valid compounds with existing roots (new words)
        ("ami-lum", "Emotion", True, "Valid compound with existing roots"),
        ("kor-aqua", "Emotion", True, "Valid compound with existing roots"),
        ("amor-lum", "Emotion", True, "Love-light compound"),
        
        # Existing compounds (should fail duplicate check but pass root check)
        ("aqua-kor", "Emotion", False, "Existing compound - should fail duplicate check"),
        
        # Invalid compounds with missing roots
        ("fake-word", "General", False, "Compound with non-existent roots"),
        ("ami-xyz", "General", False, "One valid root, one invalid"),
        ("xyz-abc", "General", False, "Both roots invalid"),
        
        # Domain consistency tests
        ("ami-lum", "Technology", True, "Valid roots but questionable domain"),
    ]
    
    print("Testing Root Word Verification:")
    print("=" * 50)
    
    for word, domain, expected_valid, description in test_cases:
        # Create test issue
        test_issue = f"""### Proposed Word
{word}

### Definition
Test compound word.

### Semantic Domain
{domain}

### Justification & Etymology
Test case: {description}"""
        
        fields = analyzer.parse_issue_body(test_issue)
        analyzer.analysis_results = {
            'phonotactics': {'status': 'PENDING', 'messages': []},
            'lexicon': {'status': 'PENDING', 'messages': []},
            'semantics': {'status': 'PENDING', 'messages': []},
            'recommendation': 'PENDING'
        }
        
        analyzer._analyze_lexicon_basic(word, domain)
        
        # Check if lexicon analysis passed (ignoring warnings for domain consistency)
        is_valid = analyzer.analysis_results['lexicon']['status'] in ['PASS', 'WARNING']
        status = "✅ PASS" if is_valid == expected_valid else "❌ FAIL"
        
        print(f"{status} {word:15} - {description}")
        if is_valid != expected_valid:
            print(f"     Expected: {'VALID' if expected_valid else 'INVALID'}")
            print(f"     Got: {'VALID' if is_valid else 'INVALID'}")
            print(f"     Status: {analyzer.analysis_results['lexicon']['status']}")
            print(f"     Messages: {analyzer.analysis_results['lexicon']['messages']}")
        else:
            # Show successful analysis details
            print(f"     Status: {analyzer.analysis_results['lexicon']['status']}")
            for msg in analyzer.analysis_results['lexicon']['messages']:
                if msg.startswith('✅'):
                    print(f"     {msg}")

if __name__ == "__main__":
    test_root_verification()