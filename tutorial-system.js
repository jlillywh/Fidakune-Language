/**
 * Tutorial System for Fidakune Conceptual Explorer
 * Provides guided tours and interactive help
 */

class TutorialSystem {
    constructor() {
        this.isActive = false;
        this.currentStep = 0;
        this.currentTutorial = null;
        this.overlay = null;
        this.tooltip = null;
        
        this.tutorials = {
            'first-time': {
                name: 'First Time User Tour',
                steps: [
                    {
                        target: '#graph-search-input',
                        title: 'Welcome! 🌐',
                        content: 'Start by searching for a word like "kore-pet" or "water"',
                        position: 'bottom'
                    },
                    {
                        target: '#directly-related',
                        title: 'Direct Translations 🎯',
                        content: 'These show exact meanings between languages',
                        position: 'right'
                    },
                    {
                        target: '#component-roots',
                        title: 'Word Building Blocks 🔗',
                        content: 'See how compound words are constructed',
                        position: 'right'
                    },
                    {
                        target: '#related-ideas',
                        title: 'Related Concepts 💭',
                        content: 'Discover conceptually connected words',
                        position: 'right'
                    }
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.createElements();
        this.setupEventListeners();
        this.checkFirstTimeUser();
    }
    
    createElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.5); z-index: 9998; display: none;
        `;
        
        // Create tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: fixed; background: white; border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3); padding: 1.5rem;
            z-index: 9999; display: none; max-width: 350px;
        `;
        
        // Create help button
        const helpButton = document.createElement('button');
        helpButton.innerHTML = '?';
        helpButton.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px;
            border-radius: 50%; background: #667eea; color: white; border: none;
            font-size: 20px; cursor: pointer; z-index: 1000;
        `;
        helpButton.onclick = () => this.showTutorialMenu();
        
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.tooltip);
        document.body.appendChild(helpButton);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.endTutorial();
            }
        });
    }
    
    checkFirstTimeUser() {
        const hasSeenTutorial = localStorage.getItem('fidakune-tutorial-seen');
        if (!hasSeenTutorial) {
            setTimeout(() => this.showWelcome(), 2000);
        }
    }
    
    showWelcome() {
        const welcome = document.createElement('div');
        welcome.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; border-radius: 16px; padding: 2rem; z-index: 10000;
            box-shadow: 0 12px 48px rgba(0,0,0,0.3); text-align: center; max-width: 500px;
        `;
        
        welcome.innerHTML = `
            <h2>Welcome to Fidakune Conceptual Explorer! 🌐</h2>
            <p>Discover the beautiful network of relationships in the Fidakune language.</p>
            <div style="margin-top: 2rem;">
                <button id="start-tour" style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; margin-right: 1rem; cursor: pointer;">Take the Tour</button>
                <button id="skip-tour" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Skip</button>
            </div>
        `;
        
        document.body.appendChild(welcome);
        
        document.getElementById('start-tour').onclick = () => {
            welcome.remove();
            this.startTutorial('first-time');
        };
        
        document.getElementById('skip-tour').onclick = () => {
            welcome.remove();
            localStorage.setItem('fidakune-tutorial-seen', 'true');
        };
    }
    
    showTutorialMenu() {
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed; bottom: 80px; right: 20px; background: white;
            border-radius: 12px; padding: 1rem; z-index: 1001; min-width: 250px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        `;
        
        menu.innerHTML = `
            <h3 style="margin: 0 0 1rem 0;">Interactive Tutorials</h3>
            <button onclick="window.tutorialSystem.startTutorial('first-time')" style="display: block; width: 100%; padding: 0.75rem; margin-bottom: 0.5rem; background: #f8f9ff; border: 2px solid #e3e7ff; border-radius: 8px; cursor: pointer;">
                <div style="font-weight: 600;">First Time User Tour</div>
                <div style="font-size: 0.85rem; color: #6c757d;">Learn the basics of conceptual exploration</div>
            </button>
            <button onclick="this.parentElement.remove()" style="width: 100%; padding: 0.5rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Close</button>
        `;
        
        document.body.appendChild(menu);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (menu.parentElement) menu.remove();
        }, 10000);
    }
    
    startTutorial(tutorialKey) {
        this.currentTutorial = this.tutorials[tutorialKey];
        this.currentStep = 0;
        this.isActive = true;
        
        this.overlay.style.display = 'block';
        this.showCurrentStep();
        
        localStorage.setItem('fidakune-tutorial-seen', 'true');
    }
    
    showCurrentStep() {
        const step = this.currentTutorial.steps[this.currentStep];
        if (!step) {
            this.endTutorial();
            return;
        }
        
        this.positionTooltip(step);
        this.updateTooltipContent(step);
        this.highlightTarget(step);
        
        this.tooltip.style.display = 'block';
    }
    
    positionTooltip(step) {
        const target = document.querySelector(step.target);
        if (!target) {
            this.nextStep();
            return;
        }
        
        const rect = target.getBoundingClientRect();
        
        let top = rect.bottom + 10;
        let left = rect.left;
        
        // Keep tooltip in viewport
        if (top + 200 > window.innerHeight) {
            top = rect.top - 200;
        }
        if (left + 350 > window.innerWidth) {
            left = window.innerWidth - 360;
        }
        
        this.tooltip.style.top = Math.max(10, top) + 'px';
        this.tooltip.style.left = Math.max(10, left) + 'px';
    }
    
    updateTooltipContent(step) {
        const isLastStep = this.currentStep === this.currentTutorial.steps.length - 1;
        
        this.tooltip.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <h3 style="margin: 0 0 0.5rem 0; color: #2c3e50;">${step.title}</h3>
                <p style="margin: 0; color: #495057;">${step.content}</p>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #6c757d; font-size: 0.9rem;">Step ${this.currentStep + 1} of ${this.currentTutorial.steps.length}</span>
                <div>
                    ${this.currentStep > 0 ? '<button onclick="window.tutorialSystem.previousStep()" style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; margin-right: 0.5rem; cursor: pointer;">Previous</button>' : ''}
                    <button onclick="window.tutorialSystem.${isLastStep ? 'endTutorial' : 'nextStep'}()" style="background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">${isLastStep ? 'Finish' : 'Next'}</button>
                </div>
            </div>
        `;
    }
    
    highlightTarget(step) {
        // Remove previous highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        const target = document.querySelector(step.target);
        if (target) {
            target.classList.add('tutorial-highlight');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight styles
            if (!document.getElementById('tutorial-styles')) {
                const style = document.createElement('style');
                style.id = 'tutorial-styles';
                style.textContent = `
                    .tutorial-highlight {
                        position: relative;
                        z-index: 9997;
                        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.5) !important;
                        border-radius: 8px !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    nextStep() {
        this.currentStep++;
        this.showCurrentStep();
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showCurrentStep();
        }
    }
    
    endTutorial() {
        this.isActive = false;
        this.overlay.style.display = 'none';
        this.tooltip.style.display = 'none';
        
        // Remove highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tutorialSystem = new TutorialSystem();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialSystem;
}