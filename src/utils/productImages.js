// Available product images from public/images folder
// Excluding: produkt.png, background.png, backg.mp4
const PRODUCT_IMAGES = [
  '/images/25-12-248-5_f6d1d39c-0dbb-41df-b09b-606b8643c4d4.webp',
  '/images/2d6c295f-0d8b-4ed7-9048-15c38970f06c.webp',
  '/images/4_191a7880-0b71-4057-9ab7-35e79aafa669.webp',
  '/images/5_0bf7b0e1-73b6-44dd-94f4-dc404b267c7a.webp',
  '/images/baume.webp',
  '/images/BeautyofJoseon-ReliefSuntexture.webp',
  '/images/centella.webp',
  '/images/ceravefoaming2.webp',
  '/images/hairtowel.webp',
  '/images/IMG_2112_301a03db-e67d-4e84-9cd9-9c97c40824d2.webp',
  '/images/MisshaALLAROUNDSUNSPF50.webp',
  '/images/puff_254f1eef-7b9c-446a-be78-d82c14da0c4b.webp',
  '/images/skin55ml_c9356fb5-f92f-4b33-b31b-0c44cf88c58e.webp',
  '/images/TheOrdinaryGlycolicAcid7_ToningSolutiontexture.webp'
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
  if (image && typeof image === 'string' && image.trim()) {
    return image;
  }
  return getImageByIndex(indexOrId);
};

// Export the array for use in other files
export { PRODUCT_IMAGES };

