#!/usr/bin/env python3
"""
Helper script to make manual integration of approved words easier.

Usage:
    python scripts/manual_integration_helper.py

This script helps you:
1. Find issues labeled 'ready-for-council' or 'approved'
2. Extract word data from issue forms
3. Generate the JSON entry for lexicon_enhanced.json
4. Provide copy-paste ready content
"""

import json
import re
from pathlib import Path

def parse_github_issue_form(issue_body):
    """Parse GitHub issue form to extract word proposal data."""
    
    # Extract form fields using regex patterns
    patterns = {
        'word': r'### Proposed Word\s*\n\s*(.+)',
        'definition': r'### Definition\s*\n\s*(.+)',
        'domain': r'### Semantic Domain\s*\n\s*(.+)',
        'justification': r'### Justification & Etymology\s*\n\s*(.*?)(?=\n###|\n---|\Z)',
    }
    
    extracted = {}
    for field, pattern in patterns.items():
        match = re.search(pattern, issue_body, re.MULTILINE | re.DOTALL)
        if match:
            extracted[field] = match.group(1).strip()
    
    return extracted

def generate_lexicon_entry(word_data):
    """Generate a lexicon entry from parsed word data."""
    
    # Determine if it's a compound word
    is_compound = '-' in word_data.get('word', '')
    
    entry = {
        "word": word_data.get('word', ''),
        "pronunciation": f"/{word_data.get('word', '')}/",  # Basic pronunciation
        "definition": word_data.get('definition', ''),
        "domain": word_data.get('domain', 'General'),
        "pos_type": "noun",  # Default, can be manually adjusted
        "word_type": "Compound" if is_compound else "Root",
        "roots": word_data.get('word', '').split('-') if is_compound else None,
        "derived_words": [],
        "etymology_note": word_data.get('justification', '')
    }
    
    return entry

def main():
    print("🤖 Fidakune Manual Integration Helper")
    print("=" * 50)
    
    print("\n1. Copy the GitHub issue body and paste it below.")
    print("2. Press Enter twice when done.\n")
    
    # Get issue body from user input
    lines = []
    print("Paste issue body (press Enter twice to finish):")
    while True:
        line = input()
        if line == "" and len(lines) > 0 and lines[-1] == "":
            break
        lines.append(line)
    
    issue_body = "\n".join(lines)
    
    # Parse the issue
    word_data = parse_github_issue_form(issue_body)
    
    if not word_data.get('word'):
        print("❌ Could not extract word data from issue body.")
        print("Please check the format and try again.")
        return
    
    # Generate lexicon entry
    entry = generate_lexicon_entry(word_data)
    
    print(f"\n✅ Extracted word: '{entry['word']}'")
    print(f"📝 Definition: {entry['definition']}")
    print(f"🏷️  Domain: {entry['domain']}")
    
    print("\n" + "=" * 50)
    print("📋 COPY THIS JSON ENTRY:")
    print("=" * 50)
    print(json.dumps(entry, indent=2, ensure_ascii=False))
    
    print("\n" + "=" * 50)
    print("📖 INTEGRATION STEPS:")
    print("=" * 50)
    print("1. Copy the JSON entry above")
    print("2. Open lexicon_enhanced.json")
    print("3. Add the entry in alphabetical order")
    print("4. Save the file")
    print("5. Commit with message: f'Add approved word: {entry['word']}'")
    print("6. Close the GitHub issue with 'Approved and integrated' comment")

if __name__ == "__main__":
    main()