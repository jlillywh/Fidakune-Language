# Fidakune Conceptual Explorer - Deployment Guide

## Overview

This guide covers the deployment, configuration, and maintenance of the Fidakune Conceptual Explorer on GitHub Pages and other hosting platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Pages Deployment](#github-pages-deployment)
3. [Security Configuration](#security-configuration)
4. [Environment Configuration](#environment-configuration)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Files

Ensure all the following files are present in your repository:

**Core Application Files:**
- `graph-conceptual-search.html` - Main application page
- `graph-conceptual-search.js` - Main application logic
- `graph-conceptual-search.css` - Application styles
- `lexical_graph.json` - Vocabulary data

**Supporting Files:**
- `graph-models.js` - Data models
- `graph-validator.js` - Data validation
- `graph-search-engine.js` - Search functionality
- `fidakune-integration.js` - Cross-app integration
- `github-relationship-proposals.js` - GitHub integration
- `github-relationship-proposals.css` - Proposal styles
- `deployment-config.js` - Deployment configuration

**Configuration Files:**
- `.github/ISSUE_TEMPLATE/relationship-proposal.md` - GitHub issue template
- `DEPLOYMENT_GUIDE.md` - This file

### Dependencies

The application is designed to run without external dependencies:
- No build process required
- No package managers needed
- Pure HTML/CSS/JavaScript implementation
- Compatible with GitHub Pages static hosting

## GitHub Pages Deployment

### Step 1: Repository Setup

1. **Fork or Clone Repository**
   ```bash
   git clone https://github.com/jlillywh/Fidakune-Language.git
   cd Fidakune-Language
   ```

2. **Verify File Structure**
   ```
   /
   ├── graph-conceptual-search.html
   ├── graph-conceptual-search.js
   ├── graph-conceptual-search.css
   ├── lexical_graph.json
   ├── deployment-config.js
   ├── fidakune-integration.js
   ├── github-relationship-proposals.js
   ├── github-relationship-proposals.css
   ├── .github/
   │   └── ISSUE_TEMPLATE/
   │       └── relationship-proposal.md
   └── DEPLOYMENT_GUIDE.md
   ```

### Step 2: GitHub Pages Configuration

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select source: "Deploy from a branch"
   - Choose branch: `main` (or `master`)
   - Choose folder: `/ (root)`
   - Click "Save"

2. **Configure Custom Domain (Optional)**
   - Add `CNAME` file with your domain
   - Configure DNS settings
   - Enable "Enforce HTTPS"

3. **Verify Deployment**
   - Wait 5-10 minutes for initial deployment
   - Visit `https://[username].github.io/[repository-name]/graph-conceptual-search.html`
   - Check browser console for any errors

### Step 3: Post-Deployment Verification

Run the deployment health check by opening browser console and executing:
```javascript
window.FidakuneDeploymentConfig.healthCheck()
```

Expected output:
```javascript
{
  healthy: true,
  checks: {
    environment: "production",
    config: true,
    security: true,
    errorHandling: true,
    performance: true,
    sanitization: true,
    rateLimiting: true,
    dataValidation: true,
    timestamp: "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Configuration

### Content Security Policy

The application automatically configures CSP headers:

```javascript
// Configured in deployment-config.js
csp: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https://api.github.com", "https://raw.githubusercontent.com"],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"]
}
```

### Input Sanitization

All user inputs are automatically sanitized:
- HTML entity encoding
- Script tag removal
- Maximum length limits
- Character validation

### Rate Limiting

Client-side rate limiting is enforced:
- 60 requests per minute
- 30 searches per minute
- 10 relationship proposals per hour

### Data Validation

Graph data is validated for:
- Maximum 10,000 nodes
- Maximum 50,000 edges
- Required field validation
- Structure integrity

## Environment Configuration

### Production Environment

Automatically detected when hosted on:
- `*.github.io`
- `*.pages.github.com`

Production settings:
- Debug mode: disabled
- Console logging: minimal
- Error reporting: enabled
- Performance threshold: 2000ms
- Cache timeout: 24 hours

### Development Environment

Detected on:
- `localhost`
- `127.0.0.1`
- Local file system

Development settings:
- Debug mode: enabled
- Console logging: verbose
- Error reporting: disabled
- Performance threshold: 5000ms
- Cache timeout: 5 minutes

### Staging Environment

Detected on domains containing:
- `staging`
- `test`

Staging settings:
- Debug mode: enabled
- Console logging: verbose
- Error reporting: enabled
- Performance threshold: 3000ms
- Cache timeout: 1 hour

## Performance Optimization

### Caching Strategy

1. **Browser Caching**
   - Static assets cached for 24 hours in production
   - Graph data cached in localStorage
   - Search results cached temporarily

2. **Resource Loading**
   - Critical resources preloaded
   - Non-critical resources loaded asynchronously
   - Lazy loading for large datasets

3. **Performance Monitoring**
   ```javascript
   // Monitor performance
   window.FidakunePerformanceMonitor.mark('search-start');
   // ... perform search ...
   window.FidakunePerformanceMonitor.mark('search-end');
   window.FidakunePerformanceMonitor.measure('search-duration', 'search-start', 'search-end');
   ```

### Optimization Checklist

- [ ] Minify CSS and JavaScript files
- [ ] Optimize images and icons
- [ ] Enable gzip compression
- [ ] Configure proper cache headers
- [ ] Monitor Core Web Vitals
- [ ] Test on various devices and networks

## Monitoring and Maintenance

### Health Monitoring

Regular health checks should be performed:

```javascript
// Manual health check
const health = window.FidakuneDeploymentConfig.healthCheck();
console.log('Health Status:', health.healthy ? 'OK' : 'ISSUES');
```

### Error Monitoring

Errors are automatically logged and can be retrieved:

```javascript
// Get stored errors (development/staging)
const errors = JSON.parse(localStorage.getItem('fidakune-errors') || '[]');
console.log('Recent Errors:', errors);
```

### Performance Monitoring

Monitor key metrics:

```javascript
// Get performance metrics
const metrics = window.FidakunePerformanceMonitor.getMetrics();
console.log('Performance Metrics:', metrics);
```

### Data Updates

To update the vocabulary data:

1. **Update lexical_graph.json**
   - Validate JSON structure
   - Test with data validator
   - Commit and push changes

2. **Verify Update**
   ```javascript
   // Clear cache to force reload
   localStorage.removeItem('fidakune-graph-cache');
   location.reload();
   ```

### Regular Maintenance Tasks

**Weekly:**
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Verify all functionality works
- [ ] Review GitHub issues and proposals

**Monthly:**
- [ ] Update vocabulary data if needed
- [ ] Review and update documentation
- [ ] Check for security updates
- [ ] Analyze usage patterns

**Quarterly:**
- [ ] Performance audit
- [ ] Security review
- [ ] Accessibility testing
- [ ] Cross-browser compatibility check

## Troubleshooting

### Common Issues

**1. Application Won't Load**
- Check browser console for errors
- Verify all files are present
- Check network connectivity
- Clear browser cache

**2. Search Not Working**
- Verify lexical_graph.json is valid
- Check data validation errors
- Clear localStorage cache
- Check rate limiting

**3. GitHub Integration Issues**
- Verify repository URL in config
- Check GitHub API connectivity
- Validate issue template format

**4. Performance Issues**
- Check performance metrics
- Monitor network requests
- Verify caching is working
- Check for memory leaks

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
// Force debug mode
window.FIDAKUNE_DEBUG = true;
location.reload();
```

### Error Recovery

If the application enters an error state:

1. **Clear Application Cache**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Reset to Default State**
   ```javascript
   // Clear all Fidakune-specific storage
   Object.keys(localStorage).forEach(key => {
     if (key.startsWith('fidakune-')) {
       localStorage.removeItem(key);
     }
   });
   location.reload();
   ```

## Rollback Procedures

### Emergency Rollback

If a deployment causes critical issues:

1. **Immediate Rollback**
   ```bash
   git revert [commit-hash]
   git push origin main
   ```

2. **Verify Rollback**
   - Wait 5-10 minutes for GitHub Pages update
   - Test critical functionality
   - Monitor error logs

### Planned Rollback

For planned rollbacks:

1. **Create Rollback Branch**
   ```bash
   git checkout -b rollback-to-[version]
   git reset --hard [stable-commit-hash]
   git push origin rollback-to-[version]
   ```

2. **Update GitHub Pages**
   - Change Pages source to rollback branch
   - Verify deployment
   - Update documentation

### Recovery Verification

After any rollback:
- [ ] Run health check
- [ ] Test all major features
- [ ] Verify data integrity
- [ ] Check error logs
- [ ] Monitor performance

## Security Considerations

### Regular Security Tasks

**Monthly:**
- [ ] Review CSP violations
- [ ] Check for XSS vulnerabilities
- [ ] Validate input sanitization
- [ ] Review rate limiting effectiveness

**Quarterly:**
- [ ] Security audit
- [ ] Dependency review (if any added)
- [ ] Penetration testing
- [ ] Access control review

### Security Incident Response

If a security issue is discovered:

1. **Immediate Response**
   - Assess severity
   - Document the issue
   - Implement temporary fix if possible

2. **Investigation**
   - Analyze logs
   - Determine impact
   - Identify root cause

3. **Resolution**
   - Develop permanent fix
   - Test thoroughly
   - Deploy fix
   - Monitor for recurrence

4. **Post-Incident**
   - Update security measures
   - Document lessons learned
   - Review and improve procedures

## Support and Contact

For deployment issues or questions:

- **Repository Issues**: [GitHub Issues](https://github.com/jlillywh/Fidakune-Language/issues)
- **Documentation**: This deployment guide
- **Community**: Fidakune Language Project community

## Changelog

### Version 1.0.0
- Initial deployment configuration
- Security measures implementation
- Performance monitoring setup
- Error handling and recovery procedures
- GitHub Pages compatibility

---

*Last updated: [Current Date]*
*Version: 1.0.0*