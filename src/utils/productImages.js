// Available product images from public/images folder
// Using existing images and fallbacks
const PRODUCT_IMAGES = [
  '/images/placeholder-product.svg', // Use product placeholder instead of logo
  '/images/logo.png', // Fallback to logo if needed
  // Add more images as they become available
];

/**
 * Get a deterministic image based on index or ID
 * @param {number|string} indexOrId - Index or ID to determine image
 * @returns {string} Image path
 */
export const getImageByIndex = (indexOrId) => {
  // Convert ID to number if it's a string
  let num = typeof indexOrId === 'string'
    ? indexOrId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : indexOrId;
  return PRODUCT_IMAGES[Math.abs(num) % PRODUCT_IMAGES.length];
};

/**
 * Get fallback image (first image in array)
 * @returns {string} Image path
 */
export const getFallbackProductImage = () => {
  return PRODUCT_IMAGES[0];
};

/**
 * Get product image or fallback (deterministic based on product)
 * @param {string|null|undefined} image - Product image path
 * @param {number|string} indexOrId - Index or product ID for deterministic fallback
 * @returns {string} Image path
 */
export const getProductImage = (image, indexOrId = 0) => {
  // Handle null, undefined, or empty values
  if (image === null || image === undefined) {
    return getImageByIndex(indexOrId);
  }
  
  // If image is an object, try to extract URL from common properties
  if (typeof image === 'object') {
    // Try common image URL properties
    const possibleUrl = image.url || image.src || image.imageUrl || image.image || Object.values(image)[0];
    
    if (possibleUrl && typeof possibleUrl === 'string') {
      return possibleUrl;
    }
    
    return getImageByIndex(indexOrId);
  }
  
  // Convert to string and trim whitespace
  const imageStr = String(image).trim();
  
  // If empty after trimming, use fallback
  if (imageStr === '' || imageStr === 'undefined') {
    return getImageByIndex(indexOrId);
  }
  
  // If it's an external URL (R2, http, https), return as-is
  if (imageStr.startsWith('http') || imageStr.startsWith('https://pub-')) {
    return imageStr;
  }
  
  // If it's a local path that exists, return as-is
  if (imageStr.startsWith('/images/')) {
    return imageStr;
  }
  
  // Otherwise, use fallback
  return getImageByIndex(indexOrId);
};

// Export the array for use in other files
export { PRODUCT_IMAGES };

