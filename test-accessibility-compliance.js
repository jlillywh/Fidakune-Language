/**
 * Accessibility Compliance Tests
 * Tests WCAG 2.1 AA compliance, keyboard navigation, and screen reader support
 */

class AccessibilityComplianceTests {
    constructor() {
        this.testResults = [];
        this.wcagGuidelines = this.initializeWCAGGuidelines();
    }
    
    initializeWCAGGuidelines() {
        return {
            // WCAG 2.1 AA Requirements
            perceivable: {
                colorContrast: { minRatio: 4.5, largeTextRatio: 3.0 },
                textAlternatives: { required: true },
                audioVideoAlternatives: { required: true },
                adaptable: { required: true }
            },
            operable: {
                keyboardAccessible: { required: true },
                noSeizures: { required: true },
                navigable: { required: true },
                inputModalities: { required: true }
            },
            understandable: {
                readable: { required: true },
                predictable: { required: true },
                inputAssistance: { required: true }
            },
            robust: {
                compatible: { required: true },
                validMarkup: { required: true }
            }
        };
    }
    
    // Test Keyboard Navigation Compliance
    async testKeyboardNavigation() {
        const test = {
            name: 'Keyboard Navigation Compliance',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            // Find all focusable elements
            const focusableSelectors = [
                'button:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                'a[href]',
                '[tabindex]:not([tabindex="-1"])',
                '[role="button"]:not([disabled])',
                '[role="link"]:not([disabled])',
                '[role="menuitem"]:not([disabled])',
                '[role="tab"]:not([disabled])'
            ];
            
            const focusableElements = document.querySelectorAll(focusableSelectors.join(', '));
            test.details.totalFocusableElements = focusableElements.length;
            
            if (focusableElements.length === 0) {
                test.details.noFocusableElements = true;
                test.passed = false;
                this.testResults.push(test);
                return test;
            }
            
            // Test tab order
            const tabOrderIssues = [];
            let previousTabIndex = -1;
            
            focusableElements.forEach((element, index) => {
                const tabIndex = element.tabIndex || 0;
                
                // Check for invalid tab indices
                if (tabIndex < -1) {
                    tabOrderIssues.push(`Element ${index} has invalid tabindex: ${tabIndex}`);
                }
                
                // Check for tab order jumps (not always an error, but worth noting)
                if (tabIndex > 0 && previousTabIndex >= 0 && tabIndex < previousTabIndex) {
                    tabOrderIssues.push(`Potential tab order issue at element ${index}`);
                }
                
                previousTabIndex = tabIndex;
            });
            
            test.details.tabOrderIssues = tabOrderIssues;
            test.details.tabOrderValid = tabOrderIssues.length === 0;
            
            // Test keyboard event handlers
            const elementsWithKeyHandlers = [];
            focusableElements.forEach((element, index) => {
                // Check for keyboard event listeners (simplified check)
                const hasKeyHandler = element.onkeydown || element.onkeyup || element.onkeypress;
                if (hasKeyHandler) {
                    elementsWithKeyHandlers.push(index);
                }
            });
            
            test.details.elementsWithKeyHandlers = elementsWithKeyHandlers.length;
            
            // Test focus visibility
            const elementsWithoutFocusStyle = [];
            focusableElements.forEach((element, index) => {
                const computedStyle = window.getComputedStyle(element, ':focus');
                const hasVisibleFocus = computedStyle.outline !== 'none' || 
                                      computedStyle.boxShadow !== 'none' ||
                                      computedStyle.border !== element.style.border;
                
                if (!hasVisibleFocus) {
                    elementsWithoutFocusStyle.push(index);
                }
            });
            
            test.details.elementsWithoutFocusStyle = elementsWithoutFocusStyle.length;
            test.details.focusVisibilityGood = elementsWithoutFocusStyle.length < focusableElements.length * 0.1;
            
            // Test skip links
            const skipLinks = document.querySelectorAll('a[href^="#"], .skip-link');
            test.details.skipLinksPresent = skipLinks.length > 0;
            
            test.passed = test.details.tabOrderValid &&
                          test.details.focusVisibilityGood &&
                          test.details.skipLinksPresent;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }   
 
    // Test ARIA Labels and Semantic Markup
    async testARIACompliance() {
        const test = {
            name: 'ARIA Labels and Semantic Markup',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            // Test interactive elements have proper labels
            const interactiveElements = document.querySelectorAll(
                'button, input, select, textarea, [role="button"], [role="link"], [role="menuitem"]'
            );
            
            const unlabeledElements = [];
            interactiveElements.forEach((element, index) => {
                const hasLabel = element.hasAttribute('aria-label') ||
                               element.hasAttribute('aria-labelledby') ||
                               element.hasAttribute('title') ||
                               (element.tagName === 'INPUT' && document.querySelector(`label[for="${element.id}"]`)) ||
                               element.textContent.trim().length > 0;
                
                if (!hasLabel) {
                    unlabeledElements.push({
                        index,
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className
                    });
                }
            });
            
            test.details.totalInteractiveElements = interactiveElements.length;
            test.details.unlabeledElements = unlabeledElements;
            test.details.labelingCompliance = unlabeledElements.length === 0;
            
            // Test heading hierarchy
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
            
            let headingHierarchyValid = true;
            let previousLevel = 0;
            
            headingLevels.forEach(level => {
                if (level > previousLevel + 1) {
                    headingHierarchyValid = false;
                }
                previousLevel = level;
            });
            
            test.details.headingCount = headings.length;
            test.details.headingHierarchyValid = headingHierarchyValid;
            
            // Test landmark roles
            const landmarks = document.querySelectorAll(
                '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"], [role="search"]'
            );
            const semanticLandmarks = document.querySelectorAll('main, nav, header, footer, aside');
            
            test.details.landmarkCount = landmarks.length + semanticLandmarks.length;
            test.details.hasMainLandmark = document.querySelector('[role="main"], main') !== null;
            
            // Test live regions
            const liveRegions = document.querySelectorAll('[aria-live]');
            test.details.liveRegionCount = liveRegions.length;
            test.details.hasLiveRegions = liveRegions.length > 0;
            
            // Test form labels
            const formInputs = document.querySelectorAll('input, select, textarea');
            const unlabeledInputs = [];
            
            formInputs.forEach((input, index) => {
                const hasLabel = input.hasAttribute('aria-label') ||
                               input.hasAttribute('aria-labelledby') ||
                               document.querySelector(`label[for="${input.id}"]`) ||
                               input.closest('label');
                
                if (!hasLabel) {
                    unlabeledInputs.push(index);
                }
            });
            
            test.details.formInputCount = formInputs.length;
            test.details.unlabeledInputCount = unlabeledInputs.length;
            test.details.formLabelingCompliance = unlabeledInputs.length === 0;
            
            test.passed = test.details.labelingCompliance &&
                          test.details.headingHierarchyValid &&
                          test.details.hasMainLandmark &&
                          test.details.hasLiveRegions &&
                          test.details.formLabelingCompliance;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Color Contrast Compliance
    async testColorContrast() {
        const test = {
            name: 'Color Contrast Compliance',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
            const contrastIssues = [];
            let totalChecked = 0;
            
            textElements.forEach((element, index) => {
                const text = element.textContent.trim();
                if (text.length === 0) return;
                
                totalChecked++;
                const computedStyle = window.getComputedStyle(element);
                const color = computedStyle.color;
                const backgroundColor = computedStyle.backgroundColor;
                
                // Simple contrast check (would need more sophisticated algorithm for production)
                const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
                const fontSize = parseFloat(computedStyle.fontSize);
                const fontWeight = computedStyle.fontWeight;
                
                const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
                const requiredRatio = isLargeText ? 3.0 : 4.5;
                
                if (contrastRatio > 0 && contrastRatio < requiredRatio) {
                    contrastIssues.push({
                        index,
                        element: element.tagName,
                        contrastRatio: contrastRatio.toFixed(2),
                        requiredRatio,
                        color,
                        backgroundColor,
                        isLargeText
                    });
                }
            });
            
            test.details.totalElementsChecked = totalChecked;
            test.details.contrastIssues = contrastIssues;
            test.details.contrastCompliance = contrastIssues.length === 0;
            test.details.contrastIssuePercentage = totalChecked > 0 ? 
                (contrastIssues.length / totalChecked * 100).toFixed(2) + '%' : '0%';
            
            // Check for color-only information
            const colorOnlyElements = document.querySelectorAll('[style*="color:"], .error, .success, .warning');
            const colorOnlyIssues = [];
            
            colorOnlyElements.forEach((element, index) => {
                // Check if element relies solely on color for meaning
                const hasTextIndicator = element.textContent.includes('Error') || 
                                       element.textContent.includes('Success') ||
                                       element.textContent.includes('Warning');
                const hasIconIndicator = element.querySelector('[aria-hidden="true"]') ||
                                       element.textContent.match(/[✓✗⚠️❌✅]/);
                
                if (!hasTextIndicator && !hasIconIndicator) {
                    colorOnlyIssues.push(index);
                }
            });
            
            test.details.colorOnlyIssues = colorOnlyIssues.length;
            test.details.colorOnlyCompliance = colorOnlyIssues.length === 0;
            
            test.passed = test.details.contrastCompliance && test.details.colorOnlyCompliance;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Screen Reader Compatibility
    async testScreenReaderCompatibility() {
        const test = {
            name: 'Screen Reader Compatibility',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            // Test for screen reader only content
            const srOnlyElements = document.querySelectorAll('.visually-hidden, .sr-only, [class*="screen-reader"]');
            test.details.screenReaderOnlyElements = srOnlyElements.length;
            
            // Test for proper use of aria-hidden
            const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]');
            const ariaHiddenIssues = [];
            
            ariaHiddenElements.forEach((element, index) => {
                // Check if aria-hidden is used on focusable elements (which is problematic)
                const isFocusable = element.matches('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
                if (isFocusable) {
                    ariaHiddenIssues.push(index);
                }
            });
            
            test.details.ariaHiddenElements = ariaHiddenElements.length;
            test.details.ariaHiddenIssues = ariaHiddenIssues.length;
            test.details.ariaHiddenProperUse = ariaHiddenIssues.length === 0;
            
            // Test for dynamic content announcements
            const liveRegions = document.querySelectorAll('[aria-live]');
            const liveRegionTypes = {};
            
            liveRegions.forEach(region => {
                const liveType = region.getAttribute('aria-live');
                liveRegionTypes[liveType] = (liveRegionTypes[liveType] || 0) + 1;
            });
            
            test.details.liveRegionTypes = liveRegionTypes;
            test.details.hasPoliteLiveRegion = liveRegionTypes.polite > 0;
            test.details.hasAssertiveLiveRegion = liveRegionTypes.assertive > 0;
            
            // Test for proper table markup (if tables exist)
            const tables = document.querySelectorAll('table');
            const tableIssues = [];
            
            tables.forEach((table, index) => {
                const hasCaption = table.querySelector('caption') !== null;
                const hasHeaders = table.querySelector('th') !== null;
                const hasScope = table.querySelector('th[scope]') !== null;
                
                if (!hasCaption || !hasHeaders) {
                    tableIssues.push({
                        index,
                        hasCaption,
                        hasHeaders,
                        hasScope
                    });
                }
            });
            
            test.details.tableCount = tables.length;
            test.details.tableIssues = tableIssues;
            test.details.tableCompliance = tableIssues.length === 0;
            
            // Test for form error handling
            const formElements = document.querySelectorAll('form');
            const formErrorHandling = [];
            
            formElements.forEach((form, index) => {
                const hasErrorContainer = form.querySelector('[role="alert"], .error-message, [aria-live]') !== null;
                const hasRequiredIndicators = form.querySelectorAll('[required]').length === 
                                            form.querySelectorAll('[required][aria-required="true"], [required][aria-label*="required"]').length;
                
                formErrorHandling.push({
                    index,
                    hasErrorContainer,
                    hasRequiredIndicators
                });
            });
            
            test.details.formCount = formElements.length;
            test.details.formErrorHandling = formErrorHandling;
            test.details.formErrorCompliance = formErrorHandling.every(f => f.hasErrorContainer && f.hasRequiredIndicators);
            
            test.passed = test.details.ariaHiddenProperUse &&
                          test.details.hasPoliteLiveRegion &&
                          test.details.tableCompliance &&
                          test.details.formErrorCompliance;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Test Focus Management
    async testFocusManagement() {
        const test = {
            name: 'Focus Management',
            passed: false,
            error: null,
            details: {}
        };
        
        try {
            // Test focus trapping in modals
            const modals = document.querySelectorAll('[role="dialog"], .modal, [aria-modal="true"]');
            const focusTrapIssues = [];
            
            modals.forEach((modal, index) => {
                const focusableInModal = modal.querySelectorAll(
                    'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
                );
                
                const hasFocusableElements = focusableInModal.length > 0;
                const hasCloseButton = modal.querySelector('[aria-label*="close"], .close, .modal-close') !== null;
                
                if (!hasFocusableElements || !hasCloseButton) {
                    focusTrapIssues.push({
                        index,
                        hasFocusableElements,
                        hasCloseButton
                    });
                }
            });
            
            test.details.modalCount = modals.length;
            test.details.focusTrapIssues = focusTrapIssues;
            test.details.focusTrapCompliance = focusTrapIssues.length === 0;
            
            // Test focus indicators
            const focusableElements = document.querySelectorAll(
                'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            let elementsWithFocusIndicator = 0;
            focusableElements.forEach(element => {
                // Simulate focus to check for focus indicator
                element.focus();
                const computedStyle = window.getComputedStyle(element, ':focus');
                
                const hasFocusIndicator = computedStyle.outline !== 'none' ||
                                        computedStyle.boxShadow !== 'none' ||
                                        computedStyle.borderColor !== window.getComputedStyle(element).borderColor;
                
                if (hasFocusIndicator) {
                    elementsWithFocusIndicator++;
                }
                
                element.blur();
            });
            
            test.details.totalFocusableElements = focusableElements.length;
            test.details.elementsWithFocusIndicator = elementsWithFocusIndicator;
            test.details.focusIndicatorCompliance = elementsWithFocusIndicator >= focusableElements.length * 0.9;
            
            // Test initial focus management
            const autoFocusElements = document.querySelectorAll('[autofocus]');
            test.details.autoFocusElements = autoFocusElements.length;
            test.details.autoFocusAppropriate = autoFocusElements.length <= 1; // Should be at most one
            
            test.passed = test.details.focusTrapCompliance &&
                          test.details.focusIndicatorCompliance &&
                          test.details.autoFocusAppropriate;
            
        } catch (error) {
            test.error = error.message;
            test.passed = false;
        }
        
        this.testResults.push(test);
        return test;
    }
    
    // Helper method to calculate contrast ratio (simplified)
    calculateContrastRatio(color1, color2) {
        try {
            // This is a simplified contrast calculation
            // In production, you'd want a more robust color parsing and contrast calculation
            const rgb1 = this.parseColor(color1);
            const rgb2 = this.parseColor(color2);
            
            if (!rgb1 || !rgb2) return -1; // Unable to calculate
            
            const l1 = this.getLuminance(rgb1);
            const l2 = this.getLuminance(rgb2);
            
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            
            return (lighter + 0.05) / (darker + 0.05);
        } catch (error) {
            return -1; // Error in calculation
        }
    }
    
    parseColor(color) {
        // Simplified color parsing - would need more robust implementation
        const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgb) {
            return {
                r: parseInt(rgb[1]),
                g: parseInt(rgb[2]),
                b: parseInt(rgb[3])
            };
        }
        return null;
    }
    
    getLuminance(rgb) {
        // Calculate relative luminance
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        
        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    // Run all accessibility tests
    async runAllTests() {
        console.log('Starting Accessibility Compliance Tests...');
        
        const tests = [
            () => this.testKeyboardNavigation(),
            () => this.testARIACompliance(),
            () => this.testColorContrast(),
            () => this.testScreenReaderCompatibility(),
            () => this.testFocusManagement()
        ];
        
        for (const testFunction of tests) {
            try {
                await testFunction();
            } catch (error) {
                console.error('Accessibility test execution error:', error);
            }
        }
        
        return this.getTestSummary();
    }
    
    // Get test summary
    getTestSummary() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(t => t.passed).length;
        const failed = total - passed;
        
        return {
            total,
            passed,
            failed,
            passRate: total > 0 ? (passed / total * 100).toFixed(2) + '%' : '0%',
            results: this.testResults,
            wcagCompliance: this.assessWCAGCompliance()
        };
    }
    
    assessWCAGCompliance() {
        const compliance = {
            perceivable: false,
            operable: false,
            understandable: false,
            robust: false,
            overall: false
        };
        
        // Assess based on test results
        const keyboardTest = this.testResults.find(t => t.name.includes('Keyboard'));
        const ariaTest = this.testResults.find(t => t.name.includes('ARIA'));
        const contrastTest = this.testResults.find(t => t.name.includes('Contrast'));
        const screenReaderTest = this.testResults.find(t => t.name.includes('Screen Reader'));
        const focusTest = this.testResults.find(t => t.name.includes('Focus'));
        
        compliance.perceivable = contrastTest?.passed || false;
        compliance.operable = keyboardTest?.passed && focusTest?.passed || false;
        compliance.understandable = ariaTest?.passed || false;
        compliance.robust = screenReaderTest?.passed || false;
        
        compliance.overall = compliance.perceivable && 
                           compliance.operable && 
                           compliance.understandable && 
                           compliance.robust;
        
        return compliance;
    }
    
    // Generate detailed report
    generateReport() {
        const summary = this.getTestSummary();
        
        console.log('\n=== Accessibility Compliance Test Report ===');
        console.log(`Total Tests: ${summary.total}`);
        console.log(`Passed: ${summary.passed}`);
        console.log(`Failed: ${summary.failed}`);
        console.log(`Pass Rate: ${summary.passRate}`);
        
        console.log('\n=== WCAG 2.1 AA Compliance ===');
        console.log(`Perceivable: ${summary.wcagCompliance.perceivable ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Operable: ${summary.wcagCompliance.operable ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Understandable: ${summary.wcagCompliance.understandable ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Robust: ${summary.wcagCompliance.robust ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Overall WCAG Compliance: ${summary.wcagCompliance.overall ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        
        console.log('\n=== Test Details ===');
        
        this.testResults.forEach((test, index) => {
            console.log(`\n${index + 1}. ${test.name}`);
            console.log(`   Status: ${test.passed ? '✅ PASSED' : '❌ FAILED'}`);
            
            if (test.error) {
                console.log(`   Error: ${test.error}`);
            }
            
            if (test.details && Object.keys(test.details).length > 0) {
                console.log('   Details:');
                Object.entries(test.details).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        console.log(`     ${key}: ${value.length} items`);
                        if (value.length > 0 && value.length <= 5) {
                            value.forEach((item, i) => {
                                console.log(`       ${i + 1}. ${typeof item === 'object' ? JSON.stringify(item) : item}`);
                            });
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        console.log(`     ${key}:`);
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            console.log(`       ${subKey}: ${subValue}`);
                        });
                    } else {
                        console.log(`     ${key}: ${value}`);
                    }
                });
            }
        });
        
        return summary;
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityComplianceTests;
}

// Make available globally for browser testing
if (typeof window !== 'undefined') {
    window.AccessibilityComplianceTests = AccessibilityComplianceTests;
}