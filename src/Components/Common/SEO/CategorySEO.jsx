import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateDirectProductUrl } from '../../../utils/productUrls';

const CategorySEO = ({
  categoryName,
  description,
  products = [],
  canonicalUrl,
  noindex = false,
  currentPage = 1,
  totalPages = 1
}) => {
  const siteName = 'Farmaci Ashila';
  const fullTitle = `${categoryName} | ${siteName} | Farmaci Online`;
  const fullDescription = description || `Eksploroni gamën tonë të produkteve në kategorinë ${categoryName}. Këshillim profesional dhe cilësi e garantuar në Farmaci Ashila.`;

  // ItemList Schema (JSON-LD)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": categoryName,
    "description": fullDescription,
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 24).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://www.farmaciashila.com${generateDirectProductUrl(product)}`,
      "name": product.itemName
    }))
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, follow" />}
      
      {/* Pagination links to prevent alternate page issues */}
      {currentPage > 1 && canonicalUrl && (
        <link rel="prev" href={canonicalUrl.includes('?') 
          ? canonicalUrl.replace(/page=\d+/, `page=${currentPage - 1}`)
          : `${canonicalUrl}?page=${currentPage - 1}`
        } />
      )}
      {currentPage < totalPages && canonicalUrl && (
        <link rel="next" href={canonicalUrl.includes('?') 
          ? canonicalUrl.replace(/page=\d+/, `page=${currentPage + 1}`)
          : `${canonicalUrl}?page=${currentPage + 1}`
        } />
      )}
      
      {/* Additional meta tags to prevent alternate page issues */}
      <meta name="googlebot" content={noindex ? "noindex, follow" : "index, follow"} />
      <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
      <meta httpEquiv="content-language" content="sq" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(itemListSchema)}
      </script>
    </Helmet>
  );
};

export default CategorySEO;
