"""
Flask Web API for Fidakune Digital Lexicon

This module provides the web interface and API endpoints for the Fidakune lexicon,
implementing the hyperlinking functionality and user-facing features.
"""

from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_cors import CORS
from typing import Dict, List
import json

from .lexicon import FidakuneLexicon
from .schema import LexiconEntry, WordType


def create_app(lexicon_path: str = None) -> Flask:
    """
    Create and configure the Flask application.
    
    Args:
        lexicon_path: Path to the lexicon data file
        
    Returns:
        Configured Flask application
    """
    app = Flask(__name__)
    CORS(app)  # Enable cross-origin requests
    
    # Initialize lexicon
    lexicon = FidakuneLexicon()
    if lexicon_path:
        lexicon.load_from_legacy_json(lexicon_path)
    
    @app.route('/')
    def index():
        """Main lexicon interface."""
        stats = lexicon.get_lexicon_statistics()
        return render_template('index.html', stats=stats)
    
    @app.route('/word/<word>')
    def word_detail(word: str):
        """
        Display detailed information for a specific word.
        
        This is the core hyperlinking functionality - each word gets its own page
        with interactive links to related words.
        """
        entry = lexicon.get_entry(word)
        if not entry:
            return render_template('404.html', word=word), 404
        
        # Get related words for navigation
        related_data = {
            'roots': [],
            'derived_words': list(entry.derived_words),
            'derivation_chains': lexicon.get_compound_chain(word)
        }
        
        if entry.word_type == WordType.COMPOUND and entry.roots:
            related_data['roots'] = [
                {
                    'word': root,
                    'entry': lexicon.get_entry(root)
                }
                for root in entry.roots
            ]
        
        return render_template('word_detail.html', entry=entry, related=related_data)
    
    @app.route('/api/word/<word>')
    def api_word_detail(word: str):
        """JSON API endpoint for word details."""
        entry = lexicon.get_entry(word)
        if not entry:
            return jsonify({'error': 'Word not found'}), 404
        
        return jsonify({
            'entry': entry.to_dict(),
            'roots': lexicon.get_roots(word),
            'derived_words': list(lexicon.get_derived_words(word)),
            'derivation_chains': lexicon.get_compound_chain(word)
        })
    
    @app.route('/api/search')
    def api_search():
        """Search API endpoint."""
        query = request.args.get('q', '').strip()
        search_type = request.args.get('type', 'word')  # word, domain, pattern
        
        if not query:
            return jsonify({'error': 'Query parameter required'}), 400
        
        results = []
        
        if search_type == 'word':
            # Exact word search
            entry = lexicon.get_entry(query)
            if entry:
                results = [entry.to_dict()]
        
        elif search_type == 'domain':
            # Domain search
            entries = lexicon.find_words_by_domain(query)
            results = [entry.to_dict() for entry in entries]
        
        elif search_type == 'pattern':
            # Pattern/phonological search
            entries = lexicon.find_words_by_pattern(query)
            results = [entry.to_dict() for entry in entries[:20]]  # Limit results
        
        return jsonify({
            'query': query,
            'type': search_type,
            'results': results,
            'count': len(results)
        })
    
    @app.route('/api/stats')
    def api_stats():
        """Get lexicon statistics."""
        return jsonify(lexicon.get_lexicon_statistics())
    
    @app.route('/api/graph')
    def api_graph_data():
        """Export graph data for visualization."""
        return jsonify(lexicon.export_graph_data())
    
    @app.route('/browse')
    def browse():
        """Browse interface for the lexicon."""
        domain = request.args.get('domain')
        word_type = request.args.get('type')
        
        entries = list(lexicon.entries.values())
        
        # Apply filters
        if domain:
            entries = [e for e in entries if e.domain == domain]
        if word_type:
            entries = [e for e in entries if e.word_type.value == word_type]
        
        # Sort by word
        entries.sort(key=lambda x: x.word)
        
        # Get unique domains for filter dropdown
        all_domains = sorted(set(e.domain for e in lexicon.entries.values()))
        
        return render_template('browse.html', 
                             entries=entries, 
                             domains=all_domains,
                             selected_domain=domain,
                             selected_type=word_type)
    
    @app.route('/compound/<word>')
    def compound_analysis(word: str):
        """Special page for analyzing compound word structure."""
        entry = lexicon.get_entry(word)
        if not entry or entry.word_type != WordType.COMPOUND:
            return redirect(url_for('word_detail', word=word))
        
        # Detailed compound analysis
        analysis = {
            'word': word,
            'roots': [],
            'semantic_analysis': [],
            'related_compounds': []
        }
        
        if entry.roots:
            for root in entry.roots:
                root_entry = lexicon.get_entry(root)
                if root_entry:
                    analysis['roots'].append({
                        'word': root,
                        'entry': root_entry,
                        'other_compounds': list(root_entry.derived_words - {word})
                    })
        
        return render_template('compound_analysis.html', 
                             entry=entry, 
                             analysis=analysis)
    
    # Store lexicon reference for access in other functions
    app.lexicon = lexicon
    
    return app


def run_development_server(lexicon_path: str, host: str = '127.0.0.1', port: int = 5000):
    """
    Run the development server.
    
    Args:
        lexicon_path: Path to the lexicon JSON file
        host: Server host
        port: Server port
    """
    app = create_app(lexicon_path)
    app.run(host=host, port=port, debug=True)


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Usage: python -m lexicon_system.webapp <lexicon_path>")
        sys.exit(1)
    
    lexicon_path = sys.argv[1]
    run_development_server(lexicon_path)
