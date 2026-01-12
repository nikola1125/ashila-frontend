import React from 'react';
import { Helmet } from 'react-helmet-async';

const CategorySEO = ({ category }) => {
  if (!category) return null;

  const siteTitle = 'Ashila Pharmacy';
  const fullTitle = `${category.categoryName} | ${siteTitle}`;
  
  // Generate category description
  const description = `Blerje ${category.categoryName.toLowerCase()} online në Shqipëri | Farmaci Ashila | Produkte mjekësore të kuruara për ${category.categoryName.toLowerCase()}`;

  // Generate keywords
  const keywords = [
    category.categoryName,
    `${category.categoryName} online`,
    `${category.categoryName} Shqipëri`,
    `blerje ${category.categoryName.toLowerCase()}`,
    `produkte ${category.categoryName.toLowerCase()}`,
    'farmaci online',
    'barna online Shqipëri',
    'medicamente',
    'farmaci ashila'
  ].join(', ');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://www.farmaciashila.com/shop?category=${category.categoryName}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/logo.png" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://www.farmaciashila.com/shop?category=${category.categoryName}`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/logo.png" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="sq" />
      <meta name="geo.region" content="AL" />
      <meta name="geo.placename" content="Shqipëri" />
      
      {/* Structured Data - Collection Page Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "CollectionPage",
          "name": category.categoryName,
          "description": description,
          "url": `https://www.farmaciashila.com/shop?category=${category.categoryName}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": 0, // This would be populated dynamically
            "itemListElement": [] // This would be populated with actual products
          },
          "provider": {
            "@type": "Organization",
            "name": "Farmaci Ashila",
            "url": "https://www.farmaciashila.com"
          }
        })}
      </script>
    </Helmet>
  );
};

export default CategorySEO;
