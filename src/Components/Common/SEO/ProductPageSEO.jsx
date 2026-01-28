import React from 'react';
import YMYLHead from './YMYLHead';
import OptimizedImage from './OptimizedImage';
import SEOManager from './SEOManager';

/**
 * Complete SEO package for product pages
 * Combines YMYL-compliant metadata with optimized images and structured data
 */
const ProductPageSEO = ({ product, categoryName, breadcrumbs = [] }) => {
  if (!product) return null;

  // Generate breadcrumbs if not provided
  const defaultBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : [
    { name: 'Ballina', url: '/' },
    { name: 'Produkte', url: '/shop' },
    { name: categoryName || 'Mjekësi', url: `/kategoria/${categoryName?.toLowerCase().replace(/\s+/g, '-') || 'mjekesi'}` },
    { name: product.itemName, url: `/produkte/${categoryName?.toLowerCase().replace(/\s+/g, '-') || 'mjekesi'}/${SEOManager.generateSlug(product.itemName, product.company, product.size)}` }
  ];

  // Generate additional structured data
  const additionalSchemas = [
    // AggregateRating if product has reviews
    product.rating > 0 ? {
      "@context": "https://schema.org/",
      "@type": "AggregateRating",
      "itemReviewed": {
        "@type": "Product",
        "name": product.itemName
      },
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount || 0,
      "bestRating": 5,
      "worstRating": 1,
      "author": {
        "@type": "Organization",
        "name": "Farmaci Ashila"
      }
    } : null,
    
    // MedicalEntity schema for YMYL compliance
    {
      "@context": "https://schema.org/",
      "@type": "MedicalEntity",
      "name": product.itemName,
      "description": product.description || `${product.itemName} - Produkt mjekësor`,
      "manufacturer": {
        "@type": "Organization",
        "name": product.company || "N/A"
      },
      "drugClass": product.categoryName || "Mjekësi",
      "isProprietary": true,
      "nonProprietaryName": product.genericName || product.itemName
    }
  ].filter(Boolean);

  return (
    <>
      {/* YMYL-Compliant Head */}
      <YMYLHead
        type="product"
        data={{ product, categoryName }}
        breadcrumbs={defaultBreadcrumbs}
        additionalSchemas={additionalSchemas}
      />
      
      {/* SEO-Optimized Product Images */}
      {product.image && (
        <OptimizedImage
          src={product.image}
          alt={`${product.itemName} - ${product.company || 'Produkt mjekësor'} nga Farmaci Ashila`}
          width={500}
          height={500}
          priority={true}
          className="w-full h-auto"
          loading="eager"
        />
      )}
      
      {/* Additional structured data for medical compliance */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Drug",
            "name": product.itemName,
            "alternateName": product.genericName,
            "description": product.description,
            "manufacturer": {
              "@type": "Organization",
              "name": product.company
            },
            "dosageForm": product.size || "Standard",
            "activeIngredient": product.genericName || product.itemName,
            "strength": product.size,
            "legalStatus": "Pharmacy only",
            "classification": product.categoryName,
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "ALL",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Pharmacy",
                "name": "Farmaci Ashila",
                "url": "https://www.farmaciashila.com"
              }
            }
          })
        }}
      />
    </>
  );
};

export default ProductPageSEO;
