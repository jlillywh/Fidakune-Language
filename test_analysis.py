#!/usr/bin/env python3
"""Test script for the analysis functionality."""

import sys
sys.path.append('scripts')

from analyze_proposal import ProposalAnalyzer

# Test issue body
test_issue = """### Proposed Word
amie-lum

### Definition
Friendly light; the warm glow of friendship.

### Semantic Domain
Emotion

### Justification & Etymology
This compound word combines 'amie' (similar to friend) with 'lum' (light), representing the warm, illuminating feeling of friendship."""

def main():
    analyzer = ProposalAnalyzer()
    
    # Load data
    lexicon_loaded = analyzer.load_lexicon()
    phonology_loaded = analyzer.load_phonology()
    
    if not lexicon_loaded or not phonology_loaded:
        print("Failed to load data")
        return
    
    # Parse and analyze
    fields = analyzer.parse_issue_body(test_issue)
    print(f"Parsed fields: {fields}")
    
    results = analyzer.analyze_proposal(fields)
    report = analyzer.format_analysis_report()
    print("\n" + "="*50)
    print("ANALYSIS REPORT")
    print("="*50)
    print(report)

if __name__ == "__main__":
    main()