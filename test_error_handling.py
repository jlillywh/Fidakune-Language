#!/usr/bin/env python3
"""Comprehensive tests for error handling and edge cases."""

import sys
import os
import json
import tempfile
import shutil
sys.path.append('scripts')

from analyze_proposal import ProposalAnalyzer

def test_parsing_edge_cases():
    """Test edge cases in issue body parsing."""
    analyzer = ProposalAnalyzer()
    
    test_cases = [
        {
            'name': 'Empty issue body',
            'body': '',
            'expected_word': ''
        },
        {
            'name': 'None issue body',
            'body': None,
            'expected_word': ''
        },
        {
            'name': 'Malformed markdown',
            'body': 'This is not proper markdown format',
            'expected_word': ''
        },
        {
            'name': 'Missing sections',
            'body': '### Proposed Word\ntest-word',
            'expected_word': 'test-word'
        },
        {
            'name': 'Extra whitespace and formatting',
            'body': '''### Proposed Word

    test-word    

### Definition

    A test word with extra spaces.    

### Semantic Domain

    General    

### Justification & Etymology

    This is a test.    ''',
            'expected_word': 'test-word'
        },
        {
            'name': 'Unicode characters',
            'body': '''### Proposed Word
tëst-wörd

### Definition
A test with unicode characters: café, naïve, résumé

### Semantic Domain
General

### Justification & Etymology
Testing unicode handling''',
            'expected_word': 'tëst-wörd'
        }
    ]
    
    print("Testing Issue Body Parsing Edge Cases:")
    print("=" * 50)
    
    for test_case in test_cases:
        try:
            fields = analyzer.parse_issue_body(test_case['body'])
            actual_word = fields.get('word', '')
            
            status = "✅ PASS" if actual_word == test_case['expected_word'] else "❌ FAIL"
            print(f"{status} {test_case['name']}")
            
            if actual_word != test_case['expected_word']:
                print(f"     Expected: '{test_case['expected_word']}'")
                print(f"     Got: '{actual_word}'")
                
        except Exception as e:
            print(f"❌ ERROR {test_case['name']}: {e}")

def test_analysis_edge_cases():
    """Test edge cases in analysis logic."""
    analyzer = ProposalAnalyzer()
    analyzer.load_lexicon()
    analyzer.load_phonology()
    
    test_cases = [
        {
            'name': 'Empty word',
            'fields': {'word': '', 'definition': 'test', 'domain': 'General', 'justification': 'test'},
            'should_error': True
        },
        {
            'name': 'Very long word',
            'fields': {'word': 'a' * 100, 'definition': 'test', 'domain': 'General', 'justification': 'test'},
            'should_error': True
        },
        {
            'name': 'Invalid characters',
            'fields': {'word': 'test@word!', 'definition': 'test', 'domain': 'General', 'justification': 'test'},
            'should_error': True
        },
        {
            'name': 'Numbers in word',
            'fields': {'word': 'test123', 'definition': 'test', 'domain': 'General', 'justification': 'test'},
            'should_error': True
        },
        {
            'name': 'Only hyphens',
            'fields': {'word': '---', 'definition': 'test', 'domain': 'General', 'justification': 'test'},
            'should_error': False  # Will fail phonotactic analysis instead
        },
        {
            'name': 'Single character',
            'fields': {'word': 'a', 'definition': 'test', 'domain': 'General', 'justification': 'test'},
            'should_error': False
        },
        {
            'name': 'Multiple hyphens',
            'fields': {'word': 'test-word-more', 'definition': 'test', 'domain': 'General', 'justification': 'test'},
            'should_error': False
        }
    ]
    
    print("\n\nTesting Analysis Edge Cases:")
    print("=" * 50)
    
    for test_case in test_cases:
        try:
            # Reset analysis results
            analyzer.analysis_results = {
                'phonotactics': {'status': 'PENDING', 'messages': []},
                'lexicon': {'status': 'PENDING', 'messages': []},
                'homophones': {'status': 'PENDING', 'messages': []},
                'semantics': {'status': 'PENDING', 'messages': []},
                'recommendation': 'PENDING'
            }
            
            results = analyzer.analyze_proposal(test_case['fields'])
            recommendation = results.get('recommendation', 'UNKNOWN')
            
            has_error = recommendation == 'ERROR'
            status = "✅ PASS" if has_error == test_case['should_error'] else "❌ FAIL"
            
            print(f"{status} {test_case['name']} - Recommendation: {recommendation}")
            
            if has_error != test_case['should_error']:
                print(f"     Expected error: {test_case['should_error']}")
                print(f"     Got error: {has_error}")
                
        except Exception as e:
            print(f"❌ EXCEPTION {test_case['name']}: {e}")

def test_file_handling_errors():
    """Test error handling for missing or corrupted files."""
    print("\n\nTesting File Handling Errors:")
    print("=" * 50)
    
    # Create temporary directory for tests
    with tempfile.TemporaryDirectory() as temp_dir:
        original_cwd = os.getcwd()
        
        try:
            # Change to temp directory
            os.chdir(temp_dir)
            
            # Test 1: Missing lexicon file
            analyzer1 = ProposalAnalyzer()
            result1 = analyzer1.load_lexicon()
            print(f"{'✅ PASS' if not result1 else '❌ FAIL'} Missing lexicon file")
            
            # Test 2: Invalid JSON file
            with open('lexicon_enhanced.json', 'w') as f:
                f.write('{ invalid json content }')
            
            analyzer2 = ProposalAnalyzer()
            result2 = analyzer2.load_lexicon()
            print(f"{'✅ PASS' if not result2 else '❌ FAIL'} Invalid JSON file")
            
            # Test 3: Empty JSON array
            with open('lexicon_enhanced.json', 'w') as f:
                json.dump([], f)
            
            analyzer3 = ProposalAnalyzer()
            result3 = analyzer3.load_lexicon()
            print(f"{'✅ PASS' if result3 else '❌ FAIL'} Empty JSON array (should succeed)")
            
            # Test 4: Invalid data structure
            with open('lexicon_enhanced.json', 'w') as f:
                json.dump({"not": "an array"}, f)
            
            analyzer4 = ProposalAnalyzer()
            result4 = analyzer4.load_lexicon()
            print(f"{'✅ PASS' if not result4 else '❌ FAIL'} Invalid data structure")
            
            # Test 5: Corrupted entries
            with open('lexicon_enhanced.json', 'w') as f:
                json.dump([
                    {"word": "valid", "definition": "test", "domain": "General"},
                    "invalid_entry",
                    {"no_word_field": "test"},
                    {"word": 123, "definition": "invalid word type"}
                ], f)
            
            analyzer5 = ProposalAnalyzer()
            result5 = analyzer5.load_lexicon()
            print(f"{'✅ PASS' if result5 else '❌ FAIL'} Corrupted entries (should load valid ones)")
            print(f"     Loaded {len(analyzer5.lexicon)} words")
            
        finally:
            # Restore original directory
            os.chdir(original_cwd)

def test_recommendation_logic():
    """Test the recommendation generation logic."""
    analyzer = ProposalAnalyzer()
    
    test_scenarios = [
        {
            'name': 'All pass',
            'results': {
                'phonotactics': {'status': 'PASS'},
                'lexicon': {'status': 'PASS'},
                'homophones': {'status': 'PASS'},
                'semantics': {'status': 'PASS'}
            },
            'expected': 'APPROVE'
        },
        {
            'name': 'One warning',
            'results': {
                'phonotactics': {'status': 'PASS'},
                'lexicon': {'status': 'WARNING'},
                'homophones': {'status': 'PASS'},
                'semantics': {'status': 'PASS'}
            },
            'expected': 'REVIEW'
        },
        {
            'name': 'Multiple warnings',
            'results': {
                'phonotactics': {'status': 'WARNING'},
                'lexicon': {'status': 'WARNING'},
                'homophones': {'status': 'WARNING'},
                'semantics': {'status': 'PASS'}
            },
            'expected': 'REVIEW'
        },
        {
            'name': 'One failure',
            'results': {
                'phonotactics': {'status': 'FAIL'},
                'lexicon': {'status': 'PASS'},
                'homophones': {'status': 'PASS'},
                'semantics': {'status': 'PASS'}
            },
            'expected': 'REJECT'
        },
        {
            'name': 'One error',
            'results': {
                'phonotactics': {'status': 'ERROR'},
                'lexicon': {'status': 'PASS'},
                'homophones': {'status': 'PASS'},
                'semantics': {'status': 'PASS'}
            },
            'expected': 'ERROR'
        }
    ]
    
    print("\n\nTesting Recommendation Logic:")
    print("=" * 50)
    
    for scenario in test_scenarios:
        analyzer.analysis_results = scenario['results'].copy()
        analyzer.analysis_results['recommendation'] = 'PENDING'
        
        analyzer._generate_recommendation()
        actual = analyzer.analysis_results['recommendation']
        
        status = "✅ PASS" if actual == scenario['expected'] else "❌ FAIL"
        print(f"{status} {scenario['name']} - Expected: {scenario['expected']}, Got: {actual}")

if __name__ == "__main__":
    test_parsing_edge_cases()
    test_analysis_edge_cases()
    test_file_handling_errors()
    test_recommendation_logic()