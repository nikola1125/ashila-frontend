/**
 * Utility functions for text formatting
 */

/**
 * Converts line breaks in text to HTML paragraphs
 * @param {string} text - Input text with line breaks
 * @returns {string} HTML with proper paragraph tags
 */
export const formatTextWithLineBreaks = (text) => {
  if (!text) return '';
  
  return text
    // Convert double line breaks to paragraph breaks
    .replace(/\n\n/g, '</p><p>')
    // Convert single line breaks to <br>
    .replace(/\n/g, '<br>')
    // Ensure proper paragraph wrapping
    .replace(/^(.*)$/, '<p>$1</p>');
};

/**
 * Preserves line breaks in textarea input
 * @param {string} text - Input text
 * @returns {string} Text with preserved line breaks
 */
export const preserveLineBreaks = (text) => {
  return text || '';
};
