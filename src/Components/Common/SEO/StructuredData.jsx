import React from 'react';
import { Helmet } from 'react-helmet-async';

const StructuredData = ({ type, data }) => {
  const generateSchema = () => {
    switch (type) {
      case 'LocalBusiness':
        return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Farmaci Ashila",
          "alternateName": "Ashila Pharmacy",
          "description": "Farmaci Ashila - Produkte mjekësore të kuruara dhe këshillim profesional",
          "url": "https://www.farmaciashila.com",
          "telephone": "+355 68 687 9292",
          "email": "farmaciashila11@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AL",
            "addressLocality": "Shqipëri"
          },
          "openingHours": "Mo-Su 00:00-23:59",
          "priceRange": "$$",
          "slogan": "Partneri juaj i besueshëm në shëndet"
        };
      
      case 'Product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "brand": {
            "@type": "Brand",
            "name": "Ashila Pharmacy"
          },
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "ALL",
            "availability": data.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        };
      
      case 'WebSite':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Ashila Pharmacy",
          "url": "https://www.farmaciashila.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.farmaciashila.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };
      
      default:
        return {};
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(generateSchema())}
      </script>
    </Helmet>
  );
};

export default StructuredData;
