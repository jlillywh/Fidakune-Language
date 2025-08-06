"""
HTML Templates for Fidakune Lexicon Web Interface

This module provides template generation functions for the web interface.
In a full implementation, these would be separate Jinja2 template files.
"""

# Base template for the lexicon interface
BASE_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Fidakune Digital Lexicon{% endblock %}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #007acc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007acc;
            margin: 0;
        }
        .word-link {
            color: #007acc;
            text-decoration: none;
            font-weight: 500;
            border-bottom: 1px dotted #007acc;
        }
        .word-link:hover {
            background-color: #e6f3ff;
            text-decoration: none;
        }
        .pronunciation {
            font-style: italic;
            color: #666;
            font-family: 'Courier New', monospace;
        }
        .definition {
            margin: 10px 0;
        }
        .metadata {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .roots-section, .derived-section {
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #007acc;
            background-color: #f8f9fa;
        }
        .word-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        .word-tag {
            background-color: #007acc;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            text-decoration: none;
            font-size: 0.9em;
        }
        .word-tag:hover {
            background-color: #005999;
            color: white;
        }
        .search-box {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #007acc;
        }
        .nav-links {
            margin: 20px 0;
        }
        .nav-links a {
            margin-right: 20px;
            color: #007acc;
            text-decoration: none;
        }
        .nav-links a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌍 Fidakune Digital Lexicon</h1>
            <div class="nav-links">
                <a href="/">Home</a>
                <a href="/browse">Browse</a>
                <a href="/api/stats">Statistics</a>
            </div>
        </div>
        {% block content %}{% endblock %}
    </div>
    
    <script>
        // Enable interactive word linking
        function navigateToWord(word) {
            window.location.href = '/word/' + encodeURIComponent(word);
        }
        
        // Search functionality
        function performSearch() {
            const query = document.getElementById('search').value.trim();
            if (query) {
                fetch('/api/search?q=' + encodeURIComponent(query))
                    .then(response => response.json())
                    .then(data => {
                        displaySearchResults(data);
                    });
            }
        }
        
        function displaySearchResults(data) {
            // Implementation would display search results
            console.log('Search results:', data);
        }
    </script>
</body>
</html>
"""

# Word detail template
WORD_DETAIL_TEMPLATE = """
{% extends "base.html" %}

{% block title %}{{ entry.word }} - Fidakune Lexicon{% endblock %}

{% block content %}
<div class="word-detail">
    <h1>{{ entry.word }}</h1>
    
    <div class="pronunciation">{{ entry.pronunciation }}</div>
    
    <div class="definition">
        <strong>Definition:</strong> {{ entry.definition }}
    </div>
    
    <div class="metadata">
        <p><strong>Domain:</strong> {{ entry.domain }}</p>
        <p><strong>Type:</strong> {{ entry.pos_type }} ({{ entry.word_type.value }})</p>
        {% if entry.etymology_note %}
        <p><strong>Etymology:</strong> {{ entry.etymology_note }}</p>
        {% endif %}
    </div>
    
    {% if entry.word_type.value == "Compound" and related.roots %}
    <div class="roots-section">
        <h3>🧱 Root Words</h3>
        <p>This compound word is formed from:</p>
        <div class="word-list">
            {% for root_info in related.roots %}
                {% if root_info.entry %}
                <a href="/word/{{ root_info.word }}" class="word-tag">
                    {{ root_info.word }} - {{ root_info.entry.definition }}
                </a>
                {% else %}
                <span class="word-tag" style="background-color: #999;">
                    {{ root_info.word }} (not found)
                </span>
                {% endif %}
            {% endfor %}
        </div>
    </div>
    {% endif %}
    
    {% if related.derived_words %}
    <div class="derived-section">
        <h3>🌱 Derived Words</h3>
        <p>Words that use "{{ entry.word }}" as a root:</p>
        <div class="word-list">
            {% for derived in related.derived_words %}
            <a href="/word/{{ derived }}" class="word-tag">{{ derived }}</a>
            {% endfor %}
        </div>
    </div>
    {% endif %}
    
    {% if related.derivation_chains %}
    <div class="derived-section">
        <h3>🔗 Derivation Chains</h3>
        {% for chain in related.derivation_chains %}
        <p>{{ " → ".join(chain) }}</p>
        {% endfor %}
    </div>
    {% endif %}
</div>
{% endblock %}
"""

# Browse template
BROWSE_TEMPLATE = """
{% extends "base.html" %}

{% block title %}Browse - Fidakune Lexicon{% endblock %}

{% block content %}
<h2>Browse Lexicon</h2>

<div style="margin-bottom: 20px;">
    <select onchange="filterByDomain(this.value)" style="padding: 8px; margin-right: 10px;">
        <option value="">All Domains</option>
        {% for domain in domains %}
        <option value="{{ domain }}" {% if domain == selected_domain %}selected{% endif %}>
            {{ domain }}
        </option>
        {% endfor %}
    </select>
    
    <select onchange="filterByType(this.value)" style="padding: 8px;">
        <option value="">All Types</option>
        <option value="Root" {% if selected_type == "Root" %}selected{% endif %}>Root Words</option>
        <option value="Compound" {% if selected_type == "Compound" %}selected{% endif %}>Compound Words</option>
    </select>
</div>

<div class="entries-grid">
    {% for entry in entries %}
    <div class="entry-card" style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3><a href="/word/{{ entry.word }}" class="word-link">{{ entry.word }}</a></h3>
        <p class="pronunciation">{{ entry.pronunciation }}</p>
        <p>{{ entry.definition }}</p>
        <div style="font-size: 0.9em; color: #666;">
            {{ entry.domain }} • {{ entry.pos_type }} • {{ entry.word_type.value }}
        </div>
    </div>
    {% endfor %}
</div>

<script>
function filterByDomain(domain) {
    const url = new URL(window.location);
    if (domain) {
        url.searchParams.set('domain', domain);
    } else {
        url.searchParams.delete('domain');
    }
    window.location = url;
}

function filterByType(type) {
    const url = new URL(window.location);
    if (type) {
        url.searchParams.set('type', type);
    } else {
        url.searchParams.delete('type');
    }
    window.location = url;
}
</script>
{% endblock %}
"""


def create_templates_directory():
    """
    Create the templates directory structure for Flask.
    This function demonstrates how the templates would be organized.
    """
    templates = {
        'base.html': BASE_TEMPLATE,
        'word_detail.html': WORD_DETAIL_TEMPLATE,
        'browse.html': BROWSE_TEMPLATE,
        'index.html': """
{% extends "base.html" %}
{% block content %}
<h2>Welcome to the Fidakune Digital Lexicon</h2>
<p>An interconnected vocabulary system with dynamic bidirectional linking.</p>

<input type="text" id="search" placeholder="Search words..." class="search-box" 
       onkeypress="if(event.key==='Enter') performSearch()">

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-number">{{ stats.total_words }}</div>
        <div>Total Words</div>
    </div>
    <div class="stat-card">
        <div class="stat-number">{{ stats.root_words }}</div>
        <div>Root Words</div>
    </div>
    <div class="stat-card">
        <div class="stat-number">{{ stats.compound_words }}</div>
        <div>Compound Words</div>
    </div>
    <div class="stat-card">
        <div class="stat-number">{{ "%.1f"|format(stats.average_compound_length) }}</div>
        <div>Avg. Compound Length</div>
    </div>
</div>

<h3>Most Productive Roots</h3>
<div class="word-list">
    {% for root, count in stats.most_productive_roots %}
    <a href="/word/{{ root }}" class="word-tag">{{ root }} ({{ count }})</a>
    {% endfor %}
</div>
{% endblock %}
        """,
        '404.html': """
{% extends "base.html" %}
{% block content %}
<h2>Word Not Found</h2>
<p>The word "{{ word }}" was not found in the lexicon.</p>
<a href="/">Return to home</a>
{% endblock %}
        """
    }
    
    return templates
