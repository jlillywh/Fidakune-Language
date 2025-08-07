/**
 * GitHub Integration for Relationship Proposals
 * Handles proposing new conceptual relationships through GitHub issues
 */

class GitHubRelationshipProposals {
    constructor() {
        this.githubRepo = 'jlillywh/Fidakune-Language';
        this.issueTemplate = 'relationship-proposal';
        this.currentSearchContext = null;
        this.validationRules = this.initializeValidationRules();
        
        this.init();
    }
    
    init() {
        this.setupProposalButtons();
        this.setupContextCapture();
        this.setupValidation();
        
        console.log('GitHub Relationship Proposals initialized');
    }
    
    initializeValidationRules() {
        return {
            nodeTypes: ['fidakune_root', 'fidakune_word', 'english_keyword'],
            relationshipTypes: ['is_a', 'has_root', 'is_related_to'],
            strengthRange: [0.1, 1.0],
            requiredFields: ['source', 'target', 'relationship', 'description'],
            maxDescriptionLength: 500,
            minDescriptionLength: 10
        };
    }
    
    setupProposalButtons() {
        // Add proposal buttons to concept items
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('propose-relationship-btn')) {
                const conceptItem = e.target.closest('.concept-item');
                if (conceptItem) {
                    this.handleRelationshipProposal(conceptItem);
                }
            }
            
            // Handle general relationship proposal button
            if (e.target.classList.contains('propose-general-relationship-btn')) {
                this.handleGeneralRelationshipProposal();
            }
        });
        
        // Add proposal buttons to UI
        this.addProposalButtonsToUI();
    }
    
    addProposalButtonsToUI() {
        // Add general proposal button to search section
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            const proposalButton = this.createGeneralProposalButton();
            searchSection.appendChild(proposalButton);
        }
        
        // Add proposal buttons to concept items (will be added dynamically)
        this.addProposalButtonsToConceptItems();
    }
    
    createGeneralProposalButton() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'relationship-proposal-container';
        buttonContainer.innerHTML = `
            <div class="relationship-proposal-section">
                <h3 class="relationship-proposal__title">
                    <span class="relationship-proposal__icon" aria-hidden="true">💡</span>
                    Suggest New Relationships
                </h3>
                <p class="relationship-proposal__description">
                    Help expand the Fidakune conceptual network by proposing new word relationships.
                </p>
                <button class="propose-general-relationship-btn" 
                        aria-label="Propose a new conceptual relationship">
                    <span class="proposal-btn__icon" aria-hidden="true">🔗</span>
                    <span class="proposal-btn__text">Propose Relationship</span>
                </button>
            </div>
        `;
        
        return buttonContainer;
    }
    
    addProposalButtonsToConceptItems() {
        // This will be called after search results are displayed
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && 
                            node.classList.contains('concept-item')) {
                            this.addProposalButtonToConceptItem(node);
                        }
                    });
                }
            });
        });
        
        // Observe concept lists for new items
        const conceptLists = document.querySelectorAll('.concept-list');
        conceptLists.forEach(list => {
            observer.observe(list, { childList: true, subtree: true });
        });
        
        // Add to existing concept items
        document.querySelectorAll('.concept-item').forEach(item => {
            this.addProposalButtonToConceptItem(item);
        });
    }
    
    addProposalButtonToConceptItem(conceptItem) {
        // Check if button already exists
        if (conceptItem.querySelector('.propose-relationship-btn')) {
            return;
        }
        
        const proposalButton = document.createElement('button');
        proposalButton.className = 'propose-relationship-btn';
        proposalButton.setAttribute('aria-label', 'Propose new relationship for this concept');
        proposalButton.innerHTML = `
            <span class="proposal-btn__icon" aria-hidden="true">🔗</span>
            <span class="proposal-btn__text">Suggest Relationship</span>
        `;
        
        // Add to concept item meta section
        const metaSection = conceptItem.querySelector('.concept-item__meta');
        if (metaSection) {
            metaSection.appendChild(proposalButton);
        }
    }
    
    setupContextCapture() {
        // Capture search context when searches are performed
        if (window.conceptualExplorer) {
            const originalPerformSearch = window.conceptualExplorer.performSearch;
            window.conceptualExplorer.performSearch = (...args) => {
                this.captureSearchContext();
                return originalPerformSearch.apply(window.conceptualExplorer, args);
            };
        }
        
        // Listen for search context updates
        document.addEventListener('searchContextUpdate', (e) => {
            this.currentSearchContext = e.detail;
        });
    }
    
    captureSearchContext() {
        if (window.conceptualExplorer) {
            this.currentSearchContext = {
                query: window.conceptualExplorer.currentQuery,
                results: window.conceptualExplorer.currentResults,
                searchHistory: window.conceptualExplorer.searchHistory.slice(-5),
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
        }
    }
    
    setupValidation() {
        // Set up validation for relationship proposals
        this.validator = new RelationshipProposalValidator(this.validationRules);
    }
    
    handleRelationshipProposal(conceptItem) {
        const conceptData = this.extractConceptData(conceptItem);
        this.showRelationshipProposalModal(conceptData);
    }
    
    handleGeneralRelationshipProposal() {
        this.showRelationshipProposalModal();
    }
    
    extractConceptData(conceptItem) {
        return {
            label: conceptItem.dataset.concept,
            conceptId: conceptItem.dataset.conceptId,
            relationship: conceptItem.dataset.relationship,
            definition: conceptItem.querySelector('.concept-item__definition')?.textContent,
            type: conceptItem.querySelector('.concept-item__type')?.textContent,
            domain: conceptItem.querySelector('.concept-item__domain')?.textContent
        };
    }
    
    showRelationshipProposalModal(conceptData = null) {
        const modal = this.createProposalModal(conceptData);
        document.body.appendChild(modal);
        
        // Focus the modal for accessibility
        modal.focus();
        
        // Set up modal event listeners
        this.setupModalEventListeners(modal);
    }
    
    createProposalModal(conceptData) {
        const modal = document.createElement('div');
        modal.className = 'relationship-proposal-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'proposal-modal-title');
        modal.setAttribute('aria-modal', 'true');
        modal.tabIndex = -1;
        
        modal.innerHTML = `
            <div class="modal-overlay" aria-hidden="true"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="proposal-modal-title" class="modal-title">
                        <span class="modal-title__icon" aria-hidden="true">🔗</span>
                        Propose New Relationship
                    </h2>
                    <button class="modal-close" aria-label="Close proposal modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form class="proposal-form" id="relationship-proposal-form">
                        <div class="form-section">
                            <h3 class="form-section__title">Relationship Details</h3>
                            
                            <div class="form-group">
                                <label for="source-concept" class="form-label">Source Concept</label>
                                <input type="text" id="source-concept" class="form-input" 
                                       placeholder="Enter the source word or concept"
                                       value="${conceptData?.label || ''}"
                                       required>
                                <div class="form-help">The word or concept that the relationship starts from</div>
                            </div>
                            
                            <div class="form-group">
                                <label for="target-concept" class="form-label">Target Concept</label>
                                <input type="text" id="target-concept" class="form-input" 
                                       placeholder="Enter the target word or concept"
                                       required>
                                <div class="form-help">The word or concept that the relationship connects to</div>
                            </div>
                            
                            <div class="form-group">
                                <label for="relationship-type" class="form-label">Relationship Type</label>
                                <select id="relationship-type" class="form-select" required>
                                    <option value="">Select relationship type</option>
                                    <option value="is_a">Direct Translation (is_a)</option>
                                    <option value="has_root">Root Component (has_root)</option>
                                    <option value="is_related_to">Conceptual Association (is_related_to)</option>
                                </select>
                                <div class="form-help">Choose how these concepts are related</div>
                            </div>
                            
                            <div class="form-group">
                                <label for="relationship-strength" class="form-label">Relationship Strength</label>
                                <input type="range" id="relationship-strength" class="form-range" 
                                       min="0.1" max="1.0" step="0.1" value="0.8">
                                <div class="form-range-labels">
                                    <span>Weak (0.1)</span>
                                    <span id="strength-value">0.8</span>
                                    <span>Strong (1.0)</span>
                                </div>
                                <div class="form-help">How strong is this conceptual connection?</div>
                            </div>
                            
                            <div class="form-group">
                                <label for="relationship-description" class="form-label">Description</label>
                                <textarea id="relationship-description" class="form-textarea" 
                                          placeholder="Explain why these concepts should be connected..."
                                          rows="4" required></textarea>
                                <div class="form-help">
                                    Provide a clear explanation of the relationship (10-500 characters)
                                </div>
                                <div class="character-count">
                                    <span id="char-count">0</span> / 500 characters
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3 class="form-section__title">Additional Context</h3>
                            
                            <div class="form-group">
                                <label for="usage-examples" class="form-label">Usage Examples (Optional)</label>
                                <textarea id="usage-examples" class="form-textarea" 
                                          placeholder="Provide examples of how this relationship would be used..."
                                          rows="3"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="linguistic-justification" class="form-label">Linguistic Justification (Optional)</label>
                                <textarea id="linguistic-justification" class="form-textarea" 
                                          placeholder="Explain the linguistic or cultural basis for this relationship..."
                                          rows="3"></textarea>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn--secondary modal-cancel">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn--primary">
                                <span class="btn__icon" aria-hidden="true">📝</span>
                                Create GitHub Issue
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    setupModalEventListeners(modal) {
        // Close modal handlers
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        const overlay = modal.querySelector('.modal-overlay');
        
        [closeBtn, cancelBtn, overlay].forEach(element => {
            element?.addEventListener('click', () => this.closeModal(modal));
        });
        
        // Form submission
        const form = modal.querySelector('#relationship-proposal-form');
        form.addEventListener('submit', (e) => this.handleFormSubmission(e, modal));
        
        // Real-time validation and updates
        this.setupFormValidation(modal);
        
        // Keyboard navigation
        this.setupModalKeyboardNavigation(modal);
    }
    
    setupFormValidation(modal) {
        const form = modal.querySelector('#relationship-proposal-form');
        const strengthSlider = form.querySelector('#relationship-strength');
        const strengthValue = form.querySelector('#strength-value');
        const descriptionTextarea = form.querySelector('#relationship-description');
        const charCount = form.querySelector('#char-count');
        
        // Update strength value display
        strengthSlider.addEventListener('input', (e) => {
            strengthValue.textContent = e.target.value;
        });
        
        // Update character count
        descriptionTextarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            charCount.textContent = count;
            
            // Visual feedback for character limits
            if (count > 500) {
                charCount.style.color = '#dc3545';
            } else if (count < 10) {
                charCount.style.color = '#ffc107';
            } else {
                charCount.style.color = '#28a745';
            }
        });
        
        // Real-time field validation
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
    }
    
    setupModalKeyboardNavigation(modal) {
        // Trap focus within modal
        const focusableElements = modal.querySelectorAll(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                return;
            }
            
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.id;
        let isValid = true;
        let errorMessage = '';
        
        // Clear previous errors
        this.clearFieldError(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Specific field validations
        switch (fieldName) {
            case 'relationship-description':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Description must be at least 10 characters';
                } else if (value.length > 500) {
                    isValid = false;
                    errorMessage = 'Description must be less than 500 characters';
                }
                break;
                
            case 'source-concept':
            case 'target-concept':
                if (value && !this.isValidConceptName(value)) {
                    isValid = false;
                    errorMessage = 'Concept name contains invalid characters';
                }
                break;
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    isValidConceptName(name) {
        // Allow letters, numbers, hyphens, and spaces
        return /^[a-zA-Z0-9\s-]+$/.test(name);
    }
    
    showFieldError(field, message) {
        field.classList.add('form-input--error');
        
        let errorElement = field.parentNode.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
    
    clearFieldError(field) {
        field.classList.remove('form-input--error');
        const errorElement = field.parentNode.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    async handleFormSubmission(e, modal) {
        e.preventDefault();
        
        const formData = this.extractFormData(modal);
        
        // Validate form
        if (!this.validateForm(formData, modal)) {
            return;
        }
        
        // Show loading state
        this.showFormLoading(modal, true);
        
        try {
            // Create GitHub issue
            const issueUrl = await this.createGitHubIssue(formData);
            
            // Show success and close modal
            this.showSuccessMessage(issueUrl);
            this.closeModal(modal);
            
            // Track analytics
            if (window.FidakuneAnalytics) {
                window.FidakuneAnalytics.trackRelationshipProposal(formData);
            }
            
        } catch (error) {
            console.error('Failed to create GitHub issue:', error);
            this.showFormError(modal, 'Failed to create proposal. Please try again.');
        } finally {
            this.showFormLoading(modal, false);
        }
    }
    
    extractFormData(modal) {
        const form = modal.querySelector('#relationship-proposal-form');
        
        return {
            sourceConcept: form.querySelector('#source-concept').value.trim(),
            targetConcept: form.querySelector('#target-concept').value.trim(),
            relationshipType: form.querySelector('#relationship-type').value,
            relationshipStrength: parseFloat(form.querySelector('#relationship-strength').value),
            description: form.querySelector('#relationship-description').value.trim(),
            usageExamples: form.querySelector('#usage-examples').value.trim(),
            linguisticJustification: form.querySelector('#linguistic-justification').value.trim(),
            searchContext: this.currentSearchContext,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }
    
    validateForm(formData, modal) {
        let isValid = true;
        
        // Validate all required fields
        const requiredFields = [
            'sourceConcept', 'targetConcept', 'relationshipType', 'description'
        ];
        
        requiredFields.forEach(fieldName => {
            if (!formData[fieldName]) {
                const fieldElement = modal.querySelector(`#${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
                if (fieldElement) {
                    this.showFieldError(fieldElement, 'This field is required');
                    isValid = false;
                }
            }
        });
        
        // Validate relationship strength
        if (formData.relationshipStrength < 0.1 || formData.relationshipStrength > 1.0) {
            isValid = false;
        }
        
        // Validate description length
        if (formData.description.length < 10 || formData.description.length > 500) {
            const descField = modal.querySelector('#relationship-description');
            this.showFieldError(descField, 'Description must be between 10 and 500 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    async createGitHubIssue(formData) {
        const issueTitle = `Relationship Proposal: ${formData.sourceConcept} → ${formData.targetConcept}`;
        const issueBody = this.generateIssueBody(formData);
        
        // Create GitHub issue URL with pre-filled data
        const githubUrl = new URL(`https://github.com/${this.githubRepo}/issues/new`);
        githubUrl.searchParams.set('title', issueTitle);
        githubUrl.searchParams.set('body', issueBody);
        githubUrl.searchParams.set('labels', 'relationship-proposal,enhancement');
        githubUrl.searchParams.set('template', 'relationship-proposal.md');
        
        // Open GitHub issue creation page
        window.open(githubUrl.toString(), '_blank', 'noopener,noreferrer');
        
        return githubUrl.toString();
    }
    
    generateIssueBody(formData) {
        const sections = [];
        
        // Relationship details
        sections.push('## Proposed Relationship');
        sections.push(`**Source Concept:** ${formData.sourceConcept}`);
        sections.push(`**Target Concept:** ${formData.targetConcept}`);
        sections.push(`**Relationship Type:** ${formData.relationshipType}`);
        sections.push(`**Strength:** ${formData.relationshipStrength}`);
        sections.push('');
        
        // Description
        sections.push('## Description');
        sections.push(formData.description);
        sections.push('');
        
        // Optional sections
        if (formData.usageExamples) {
            sections.push('## Usage Examples');
            sections.push(formData.usageExamples);
            sections.push('');
        }
        
        if (formData.linguisticJustification) {
            sections.push('## Linguistic Justification');
            sections.push(formData.linguisticJustification);
            sections.push('');
        }
        
        // Context information
        sections.push('## Context Information');
        sections.push(`**Submitted:** ${formData.timestamp}`);
        
        if (formData.searchContext) {
            sections.push(`**Search Query:** ${formData.searchContext.query || 'N/A'}`);
            sections.push(`**Search Results:** ${this.summarizeSearchResults(formData.searchContext.results)}`);
        }
        
        sections.push('');
        sections.push('---');
        sections.push('*This proposal was submitted through the Fidakune Conceptual Explorer*');
        
        return sections.join('\n');
    }
    
    summarizeSearchResults(results) {
        if (!results) return 'N/A';
        
        const counts = {
            directlyRelated: results.directlyRelated?.length || 0,
            componentRoots: results.componentRoots?.length || 0,
            relatedIdeas: results.relatedIdeas?.length || 0
        };
        
        const total = counts.directlyRelated + counts.componentRoots + counts.relatedIdeas;
        return `${total} total (${counts.directlyRelated} direct, ${counts.componentRoots} roots, ${counts.relatedIdeas} related)`;
    }
    
    showFormLoading(modal, isLoading) {
        const submitBtn = modal.querySelector('button[type="submit"]');
        const form = modal.querySelector('#relationship-proposal-form');
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="btn__spinner" aria-hidden="true"></span>
                Creating Issue...
            `;
            form.style.opacity = '0.7';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span class="btn__icon" aria-hidden="true">📝</span>
                Create GitHub Issue
            `;
            form.style.opacity = '1';
        }
    }
    
    showFormError(modal, message) {
        let errorElement = modal.querySelector('.form-global-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-global-error';
            errorElement.setAttribute('role', 'alert');
            
            const formActions = modal.querySelector('.form-actions');
            formActions.parentNode.insertBefore(errorElement, formActions);
        }
        
        errorElement.innerHTML = `
            <div class="error-message">
                <span class="error-message__icon" aria-hidden="true">⚠️</span>
                <span class="error-message__text">${message}</span>
            </div>
        `;
    }
    
    showSuccessMessage(issueUrl) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="success-notification__content">
                <span class="success-notification__icon" aria-hidden="true">✅</span>
                <div class="success-notification__message">
                    <strong>Relationship proposal created!</strong>
                    <p>Your proposal has been submitted as a GitHub issue.</p>
                </div>
                <button class="success-notification__close" aria-label="Close notification">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1002;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.success-notification__close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);
    }
    
    closeModal(modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            modal.remove();
            
            // Return focus to the element that opened the modal
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('propose-relationship-btn')) {
                activeElement.focus();
            }
        }, 300);
    }
}

/**
 * Relationship Proposal Validator
 */
class RelationshipProposalValidator {
    constructor(rules) {
        this.rules = rules;
    }
    
    validate(proposal) {
        const errors = [];
        
        // Check required fields
        this.rules.requiredFields.forEach(field => {
            if (!proposal[field] || proposal[field].toString().trim() === '') {
                errors.push(`${field} is required`);
            }
        });
        
        // Validate relationship type
        if (proposal.relationship && !this.rules.relationshipTypes.includes(proposal.relationship)) {
            errors.push(`Invalid relationship type: ${proposal.relationship}`);
        }
        
        // Validate strength
        if (proposal.strength !== undefined) {
            const strength = parseFloat(proposal.strength);
            if (isNaN(strength) || strength < this.rules.strengthRange[0] || strength > this.rules.strengthRange[1]) {
                errors.push(`Strength must be between ${this.rules.strengthRange[0]} and ${this.rules.strengthRange[1]}`);
            }
        }
        
        // Validate description length
        if (proposal.description) {
            const length = proposal.description.length;
            if (length < this.rules.minDescriptionLength) {
                errors.push(`Description must be at least ${this.rules.minDescriptionLength} characters`);
            }
            if (length > this.rules.maxDescriptionLength) {
                errors.push(`Description must be less than ${this.rules.maxDescriptionLength} characters`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.GitHubRelationshipProposals = new GitHubRelationshipProposals();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubRelationshipProposals;
}