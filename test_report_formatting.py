#!/usr/bin/env python3
"""Test the enhanced analysis report formatting."""

import sys
sys.path.append('scripts')

from analyze_proposal import ProposalAnalyzer

def test_report_scenarios():
    """Test different report scenarios."""
    analyzer = ProposalAnalyzer()
    analyzer.load_lexicon()
    analyzer.load_phonology()
    
    test_scenarios = [
        {
            'name': 'APPROVED Proposal',
            'issue': """### Proposed Word
ami-lum

### Definition
Friendly light; the warm glow of companionship.

### Semantic Domain
Emotion

### Justification & Etymology
This compound word combines 'ami' (friend) with 'lum' (light), representing the warm, illuminating feeling of true friendship."""
        },
        {
            'name': 'REJECTED Proposal (Invalid Phonemes)',
            'issue': """### Proposed Word
xyz-qua

### Definition
Something impossible.

### Semantic Domain
Quality

### Justification & Etymology
This word uses invalid phonemes to test the validation system."""
        },
        {
            'name': 'REVIEW Proposal (Homophone Warning)',
            'issue': """### Proposed Word
amie-lum

### Definition
Friend-light; the warm glow of companionship.

### Semantic Domain
Technology

### Justification & Etymology
This compound combines 'amie' (similar to friend) with 'lum' (light), but the domain might not be appropriate."""
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n{'='*60}")
        print(f"TESTING: {scenario['name']}")
        print('='*60)
        
        # Parse and analyze
        fields = analyzer.parse_issue_body(scenario['issue'])
        
        # Reset analysis results
        analyzer.analysis_results = {
            'phonotactics': {'status': 'PENDING', 'messages': []},
            'lexicon': {'status': 'PENDING', 'messages': []},
            'homophones': {'status': 'PENDING', 'messages': []},
            'semantics': {'status': 'PENDING', 'messages': []},
            'recommendation': 'PENDING'
        }
        
        # Run analysis
        results = analyzer.analyze_proposal(fields)
        
        # Generate and display report
        report = analyzer.format_analysis_report()
        print(report)
        print("\n" + "="*60)

if __name__ == "__main__":
    test_report_scenarios()