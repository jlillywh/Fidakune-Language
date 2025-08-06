#!/usr/bin/env python3
"""Test input sanitization functionality."""

import sys
sys.path.append('scripts')

from analyze_proposal import ProposalAnalyzer

def test_input_sanitization():
    """Test that malicious input is properly sanitized."""
    analyzer = ProposalAnalyzer()
    
    test_cases = [
        {
            'name': 'Script injection',
            'input': '<script>alert("xss")</script>test-word',
            'should_contain': 'test-word',
            'should_not_contain': '<script>'
        },
        {
            'name': 'HTML comments',
            'input': '<!-- malicious comment -->test-word',
            'should_contain': 'test-word',
            'should_not_contain': '<!--'
        },
        {
            'name': 'Markdown injection',
            'input': 'test-word`malicious code`',
            'should_contain': 'test-word',
            'should_not_contain': '`malicious'  # Should be escaped as \`malicious
        },
        {
            'name': 'Link injection',
            'input': 'test-word[malicious](http://evil.com)',
            'should_contain': 'test-word',
            'should_not_contain': '[malicious]'
        },
        {
            'name': 'Very long input',
            'input': 'a' * 2000,
            'should_contain': '...',
            'should_not_contain': None
        },
        {
            'name': 'Normal compound word',
            'input': 'ami-lum',
            'should_contain': 'ami-lum',
            'should_not_contain': None
        }
    ]
    
    print("Testing Input Sanitization:")
    print("=" * 50)
    
    for test_case in test_cases:
        sanitized = analyzer._sanitize_input(test_case['input'])
        
        contains_check = test_case['should_contain'] in sanitized if test_case['should_contain'] else True
        # For markdown injection test, check that backticks are escaped
        if test_case['name'] == 'Markdown injection':
            not_contains_check = '\\`' in sanitized  # Should contain escaped backticks
        else:
            not_contains_check = test_case['should_not_contain'] not in sanitized if test_case['should_not_contain'] else True
        
        status = "✅ PASS" if contains_check and not_contains_check else "❌ FAIL"
        print(f"{status} {test_case['name']}")
        
        if not contains_check:
            print(f"     Should contain '{test_case['should_contain']}' but got: '{sanitized}'")
        if not not_contains_check:
            print(f"     Should not contain '{test_case['should_not_contain']}' but got: '{sanitized}'")
        
        print(f"     Input: {test_case['input'][:50]}{'...' if len(test_case['input']) > 50 else ''}")
        print(f"     Output: {sanitized[:50]}{'...' if len(sanitized) > 50 else ''}")

def test_end_to_end_sanitization():
    """Test that sanitization works in the full analysis pipeline."""
    analyzer = ProposalAnalyzer()
    analyzer.load_lexicon()
    analyzer.load_phonology()
    
    malicious_issue = """### Proposed Word
test`injection`word

### Definition
A definition with <script>alert('xss')</script> malicious content

### Semantic Domain
General

### Justification & Etymology
<!-- This is a comment --> Normal justification [with link](http://evil.com)"""
    
    print("\n\nTesting End-to-End Sanitization:")
    print("=" * 50)
    
    fields = analyzer.parse_issue_body(malicious_issue)
    
    # Check that dangerous content was sanitized
    checks = [
        ('word field', '`injection`' not in fields['word']),  # Should be escaped
        ('definition field', '<script>' not in fields['definition']),
        ('justification field', '<!--' not in fields['justification']),
        ('justification field', '[with link]' not in fields['justification'])
    ]
    
    for check_name, passed in checks:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {check_name} sanitized")
    
    print(f"\nSanitized fields:")
    for field, value in fields.items():
        print(f"  {field}: {value}")

if __name__ == "__main__":
    test_input_sanitization()
    test_end_to_end_sanitization()