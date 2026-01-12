import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage = '/logo.png',
  canonicalUrl 
}) => {
  const siteTitle = 'Ashila Pharmacy';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="sq" />
      <meta name="geo.region" content="AL" />
      <meta name="geo.placename" content="Shqipëri" />
      
      {/* Organization Schema for Google Search Logo */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Ashila Pharmacy",
          "url": "https://www.farmaciashila.com",
          "logo": "https://www.farmaciashila.com/logo.png",
          "image": "https://www.farmaciashila.com/logo.png",
          "description": "Farmaci Ashila - Kujdesi shëndetësor dhe produkte farmaceutike në Shqipëri",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AL"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+355 68 687 9292",
            "contactType": "customer service"
          }
        })}
      </script>
      
      {/* Website Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Ashila Pharmacy",
          "url": "https://www.farmaciashila.com",
          "logo": "https://www.farmaciashila.com/logo.png",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.farmaciashila.com/shop?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
