"""
Migration Script for Fidakune Lexicon Enhancement

This script migrates the existing lexicon.json to the enhanced format
with bidirectional linking support.
"""

import json
import sys
from pathlib import Path

# Add the parent directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

from lexicon_system.lexicon import FidakuneLexicon
from lexicon_system.schema import LexiconEntry, WordType


def migrate_lexicon(input_path: str, output_path: str):
    """
    Migrate the legacy lexicon format to the enhanced format.
    
    Args:
        input_path: Path to the existing lexicon.json
        output_path: Path where to save the enhanced lexicon
    """
    print(f"Loading legacy lexicon from: {input_path}")
    
    # Initialize lexicon system
    lexicon = FidakuneLexicon()
    
    # Load legacy data
    lexicon.load_from_legacy_json(input_path)
    
    # Display migration statistics
    stats = lexicon.get_lexicon_statistics()
    print(f"\nMigration completed!")
    print(f"Total words processed: {stats['total_words']}")
    print(f"Root words: {stats['root_words']}")
    print(f"Compound words: {stats['compound_words']}")
    print(f"Average compound length: {stats['average_compound_length']:.1f}")
    
    # Display most productive roots
    print(f"\nMost productive roots:")
    for root, count in stats['most_productive_roots'][:5]:
        print(f"  {root}: {count} derived words")
    
    # Save enhanced format
    print(f"\nSaving enhanced lexicon to: {output_path}")
    lexicon.save_to_json(output_path)
    
    # Save graph data for visualization
    graph_path = output_path.replace('.json', '_graph.json')
    print(f"Saving graph data to: {graph_path}")
    with open(graph_path, 'w', encoding='utf-8') as f:
        json.dump(lexicon.export_graph_data(), f, ensure_ascii=False, indent=2)
    
    return lexicon


def demonstrate_functionality(lexicon: FidakuneLexicon):
    """
    Demonstrate the key functionality of the enhanced lexicon system.
    """
    print("\n" + "="*60)
    print("FUNCTIONALITY DEMONSTRATION")
    print("="*60)
    
    # Test word: sole-lum (hope)
    test_word = "sole-lum"
    print(f"\n1. Analyzing compound word: {test_word}")
    
    entry = lexicon.get_entry(test_word)
    if entry:
        print(f"   Definition: {entry.definition}")
        print(f"   Pronunciation: {entry.pronunciation}")
        print(f"   Type: {entry.word_type.value}")
        
        if entry.roots:
            print(f"   Roots: {', '.join(entry.roots)}")
            
            # Show root definitions
            for root in entry.roots:
                root_entry = lexicon.get_entry(root)
                if root_entry:
                    print(f"     - {root}: {root_entry.definition}")
    
    # Test bidirectional linking
    print(f"\n2. Finding words derived from 'lum' (light):")
    derived = lexicon.get_derived_words("lum")
    for word in sorted(derived):
        entry = lexicon.get_entry(word)
        if entry:
            print(f"   - {word}: {entry.definition}")
    
    # Test derivation chains
    print(f"\n3. Derivation chains for '{test_word}':")
    chains = lexicon.get_compound_chain(test_word)
    for chain in chains:
        print(f"   {' → '.join(reversed(chain))}")
    
    # Test domain analysis
    print(f"\n4. Words in 'Emotion' domain:")
    emotion_words = lexicon.find_words_by_domain("Emotion")
    for entry in sorted(emotion_words, key=lambda x: x.word)[:5]:
        print(f"   - {entry.word}: {entry.definition}")
    
    print(f"\n5. Compound words containing 'aqua':")
    aqua_derived = lexicon.get_derived_words("aqua")
    for word in sorted(aqua_derived):
        entry = lexicon.get_entry(word)
        if entry:
            print(f"   - {word}: {entry.definition}")


if __name__ == "__main__":
    # Configuration
    input_file = "lexicon.json"
    output_file = "lexicon_enhanced.json"
    
    # Check if input file exists
    if not Path(input_file).exists():
        print(f"Error: Input file '{input_file}' not found!")
        print(f"Current directory: {Path.cwd()}")
        sys.exit(1)
    
    try:
        # Perform migration
        lexicon = migrate_lexicon(input_file, output_file)
        
        # Demonstrate functionality
        demonstrate_functionality(lexicon)
        
        print(f"\n✅ Migration successful!")
        print(f"Enhanced lexicon saved to: {output_file}")
        print(f"Graph data saved to: {output_file.replace('.json', '_graph.json')}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
