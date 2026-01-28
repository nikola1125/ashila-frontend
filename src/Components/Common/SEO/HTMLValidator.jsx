import React from 'react';

/**
 * HTML Validator for YMYL compliance
 * Ensures semantic HTML and proper heading hierarchy
 */
class HTMLValidator {
  /**
   * Validate heading hierarchy (h1 -> h2 -> h3...)
   */
  static validateHeadingHierarchy(content) {
    const headings = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      headings.push({
        level,
        text: heading.textContent.trim(),
        element: heading.tagName,
        position: index
      });
    });

    const errors = [];
    let previousLevel = 0;

    headings.forEach(heading => {
      if (heading.level > previousLevel + 1) {
        errors.push({
          type: 'hierarchy_skip',
          message: `Heading level skipped: h${previousLevel} -> h${heading.level}`,
          heading: heading.text
        });
      }
      previousLevel = heading.level;
    });

    // Check for multiple H1 tags
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count > 1) {
      errors.push({
        type: 'multiple_h1',
        message: `Multiple H1 tags found (${h1Count}). Only one H1 per page is allowed.`
      });
    }

    if (h1Count === 0) {
      errors.push({
        type: 'missing_h1',
        message: 'No H1 tag found. Each page must have exactly one H1 tag.'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      headings
    };
  }

  /**
   * Validate semantic HTML structure
   */
  static validateSemanticHTML(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const issues = [];
    
    // Check for proper use of semantic tags
    const semanticChecks = [
      {
        selector: 'main',
        required: true,
        message: 'Missing <main> tag. Content should be wrapped in <main> for better accessibility.'
      },
      {
        selector: 'nav',
        required: true,
        message: 'Missing <nav> tag. Navigation should be properly marked up.'
      },
      {
        selector: 'header',
        required: false,
        message: 'Consider using <header> tag for page header.'
      },
      {
        selector: 'footer',
        required: false,
        message: 'Consider using <footer> tag for page footer.'
      },
      {
        selector: 'section',
        required: false,
        message: 'Consider using <section> tags to group related content.'
      },
      {
        selector: 'article',
        required: false,
        message: 'Consider using <article> tags for standalone content.'
      }
    ];

    semanticChecks.forEach(check => {
      const elements = tempDiv.querySelectorAll(check.selector);
      if (check.required && elements.length === 0) {
        issues.push({
          type: 'missing_semantic',
          tag: check.selector,
          message: check.message
        });
      }
    });

    // Check for proper use of lists
    const invalidLists = tempDiv.querySelectorAll('div > div > div');
    if (invalidLists.length > 5) {
      issues.push({
        type: 'deep_nesting',
        message: 'Excessive div nesting detected. Consider using semantic tags.'
      });
    }

    // Check for proper link usage
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      if (!link.href || link.href === '#') {
        issues.push({
          type: 'invalid_link',
          message: 'Found link without proper href attribute.',
          element: link.textContent
        });
      }
    });

    // Check for proper image usage
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        issues.push({
          type: 'missing_alt',
          message: 'Image missing alt attribute.',
          src: img.src
        });
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate YMYL compliance for medical content
   */
  static validateYMYLCompliance(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const ymylIssues = [];
    
    // Check for medical disclaimer
    const medicalDisclaimer = tempDiv.querySelector('[data-medical-disclaimer]');
    if (!medicalDisclaimer) {
      ymylIssues.push({
        type: 'missing_disclaimer',
        message: 'Medical disclaimer not found. YMYL content requires proper disclaimers.'
      });
    }

    // Check for author information
    const authorInfo = tempDiv.querySelector('[data-author], [rel="author"]');
    if (!authorInfo) {
      ymylIssues.push({
        type: 'missing_author',
        message: 'Author information not found. Medical content should indicate authorship.'
      });
    }

    // Check for date information
    const dateInfo = tempDiv.querySelector('[data-date], time[datetime]');
    if (!dateInfo) {
      ymylIssues.push({
        type: 'missing_date',
        message: 'Publication/updated date not found. Medical content should be dated.'
      });
    }

    // Check for references/sources
    const references = tempDiv.querySelector('[data-references], .references');
    if (!references) {
      ymylIssues.push({
        type: 'missing_references',
        message: 'References not found. Medical claims should be supported by sources.'
      });
    }

    // Check for contact information
    const contactInfo = tempDiv.querySelector('[data-contact], .contact-info');
    if (!contactInfo) {
      ymylIssues.push({
        type: 'missing_contact',
        message: 'Contact information not found. Medical sites should provide contact details.'
      });
    }

    return {
      valid: ymylIssues.length === 0,
      issues: ymylIssues
    };
  }

  /**
   * Generate comprehensive validation report
   */
  static generateValidationReport(content) {
    const headingValidation = this.validateHeadingHierarchy(content);
    const semanticValidation = this.validateSemanticHTML(content);
    const ymylValidation = this.validateYMYLCompliance(content);

    return {
      overall: {
        valid: headingValidation.valid && semanticValidation.valid && ymylValidation.valid,
        score: this.calculateSEOScore(headingValidation, semanticValidation, ymylValidation)
      },
      headings: headingValidation,
      semantic: semanticValidation,
      ymyl: ymylValidation,
      recommendations: this.generateRecommendations(headingValidation, semanticValidation, ymylValidation)
    };
  }

  /**
   * Calculate SEO score based on validation results
   */
  static calculateSEOScore(heading, semantic, ymyl) {
    let score = 100;
    
    // Deduct points for heading issues
    score -= heading.errors.length * 10;
    
    // Deduct points for semantic issues
    score -= semantic.issues.length * 5;
    
    // Deduct points for YMYL issues (more critical)
    score -= ymyl.issues.length * 15;
    
    return Math.max(0, score);
  }

  /**
   * Generate actionable recommendations
   */
  static generateRecommendations(heading, semantic, ymyl) {
    const recommendations = [];
    
    heading.errors.forEach(error => {
      recommendations.push({
        priority: 'high',
        category: 'headings',
        issue: error.message,
        solution: this.getHeadingSolution(error.type)
      });
    });

    semantic.issues.forEach(issue => {
      recommendations.push({
        priority: 'medium',
        category: 'semantic',
        issue: issue.message,
        solution: this.getSemanticSolution(issue.type)
      });
    });

    ymyl.issues.forEach(issue => {
      recommendations.push({
        priority: 'critical',
        category: 'ymyl',
        issue: issue.message,
        solution: this.getYMYLSolution(issue.type)
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  static getHeadingSolution(type) {
    const solutions = {
      'hierarchy_skip': 'Ensure heading levels follow proper sequence (h1 -> h2 -> h3)',
      'multiple_h1': 'Use only one H1 tag per page. Use H2-H6 for subheadings.',
      'missing_h1': 'Add exactly one H1 tag that describes the main content of the page.'
    };
    return solutions[type] || 'Review heading structure for best practices.';
  }

  static getSemanticSolution(type) {
    const solutions = {
      'missing_semantic': 'Use appropriate HTML5 semantic tags for better accessibility and SEO.',
      'deep_nesting': 'Reduce div nesting by using semantic tags like section, article, etc.',
      'invalid_link': 'Ensure all links have proper href attributes pointing to valid URLs.',
      'missing_alt': 'Add descriptive alt text to all images for accessibility and SEO.'
    };
    return solutions[type] || 'Review HTML structure for semantic best practices.';
  }

  static getYMYLSolution(type) {
    const solutions = {
      'missing_disclaimer': 'Add medical disclaimer: "Kjo informacion nuk zëvendëson këshillën mjekësore profesionale."',
      'missing_author': 'Include author information with credentials for medical content.',
      'missing_date': 'Add publication and last updated dates for all medical content.',
      'missing_references': 'Include references to medical sources and studies.',
      'missing_contact': 'Display clear contact information for the pharmacy/medical professionals.'
    };
    return solutions[type] || 'Review YMYL compliance requirements for medical content.';
  }
}

export default HTMLValidator;
