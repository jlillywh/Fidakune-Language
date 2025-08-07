/**
 * Interactive Tutorial System for Fidakune Conceptual Explorer
 * Provides guided tours and first-time user onboarding
 */

class InteractiveTutorial {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.tutorialData = this.initializeTutorials();
        this.overlay = null;
        this.tooltip = null;
        this.userProgress = this.loadUserProgress();
        
        this.init();
    }
    
    init() {
        this.createTutorialElements();
        this.setupEventListeners();
        this.checkFirstTimeUser();
        
        console.log('Interactive Tutorial System initialized');
    }
    
    initializeTutorials() {
        return {
            'first-time': {
                name: 'First Time User Tour',
                description: 'Learn the basics of conceptual exploration',
                steps: [
                    {
                        target: '#graph-search-input',
                        title: 'Welcome to Conceptual Explorer! 🌐',
                        content: 'This is where you start your journey. Try searching for "kore-pet" or "water" to explore relationships.',
                        position: 'bottom',
                        action: 'highlight'
                    },
                    {
                        target: '.search-form__button',
                        title: 'Start Exploring',
                        content: 'Click here or press Enter to begin your search and discover conceptual connections.',
                        position: 'bottom',
                        action: 'pulse'
                    },
                    {
                        target: '#directly-related',
                        title: 'Directly Related Concepts 🎯',
                        content: 'These are exact translations and direct meanings. Perfect for learning core vocabulary.',
                        position: 'right',
                        action: 'highlight',
                        waitFor: 'search-results'
                    },
                    {
                        target: '#component-roots',
                        title: 'Component Roots 🔗',
                        content: 'Discover the building blocks of compound words. This shows how Fidakune constructs meaning.',
                        position: 'right',
                        action: 'highlight'
                    },
                    {
                        target: '#related-ideas',
                        title: 'Related Ideas 💭',
                        content: 'Explore conceptually connected words and semantic associations.',
                        position: 'right',
                        action: 'highlight'
                    },
                    {
                        target: '.concept-item:first-child',
                        title: 'Click to Explore Further',
                        content: 'Click any concept to start exploring from that word. Each click reveals new connections!',
                        position: 'top',
                        action: 'pulse'
                    },
                    {
                        target: '#breadcrumbs',
                        title: 'Track Your Journey',
                        content: 'Breadcrumbs show your exploration path. Click any breadcrumb to return to that concept.',
                        position: 'bottom',
                        action: 'highlight',
                        waitFor: 'navigation'
                    }
                ]
            },
            'advanced-features': {
                name: 'Advanced Features Tour',
                description: 'Discover powerful features for deeper exploration',
                steps: [
                    {
                        target: '#search-transfer',
                        title: 'Cross-App Integration',
                        content: 'Switch between conceptual and traditional search to get different perspectives.',
                        position: 'bottom',
                        action: 'highlight'
                    },
                    {
                        target: '.propose-relationship-btn',
                        title: 'Contribute to Fidakune',
                        content: 'Found a missing connection? Propose new relationships to help expand the language.',
                        position: 'top',
                        action: 'pulse'
                    },
                    {
                        target: '.concept-item__strength',
                        title: 'Connection Strength',
                        content: 'These indicators show how closely concepts are related. Strong connections are more direct.',
                        position: 'top',
                        action: 'highlight'
                    }
                ]
            },
            'accessibility': {
                name: 'Accessibility Features',
                description: 'Learn about keyboard navigation and accessibility features',
                steps: [
                    {
                        target: 'body',
                        title: 'Keyboard Navigation',
                        content: 'Use Tab to navigate, Enter to activate, and Escape to close. Press Ctrl+K to focus search.',
                        position: 'center',
                        action: 'none'
                    },
                    {
                        target: '.skip-link',
                        title: 'Skip Links',
                        content: 'Press Tab when the page loads to access skip links for faster navigation.',
                        position: 'bottom',
                        action: 'highlight'
                    }
                ]
            }
        };
    }