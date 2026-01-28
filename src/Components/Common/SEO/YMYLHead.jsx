import React from 'react';
import { Helmet } from 'react-helmet-async';
import SEOManager from './SEOManager';

/**
 * YMYL-Compliant Head Component
 * Ensures all medical/pharmaceutical pages meet Google's Your Money Your Life guidelines
 */
const YMYLHead = ({ 
  type = 'website', 
  data = {}, 
  breadcrumbs = [],
  additionalSchemas = [] 
}) => {
  const baseUrl = 'https://www.farmaciashila.com';
  
  // Generate metadata based on page type
  let metadata = {};
  let schemas = [];

  switch (type) {
    case 'product':
      metadata = SEOManager.generateProductMetadata(data.product, data.categoryName);
      schemas.push(SEOManager.generateStructuredData('Product', data.product));
      break;
    case 'category':
      metadata = SEOManager.generateCategoryMetadata(data.category, data.products);
      break;
    case 'home':
      metadata = {
        title: 'Farmaci Ashila | Kujdes Shëndetësor & Produkte Mjekësore në Shqipëri',
        description: 'Farmaci Ashila - Produkte mjekësore të kuruara, këshillim profesional dhe kujdes shëndetësor i sigurtë. Vizitoni ne në Shqipëri për barna dhe medicamente të cilësisë.',
        keywords: 'farmaci shila, farmaci shqiperi, farmaci online, mjekësi, shëndet, produkte farmaceutike, kujdes shëndetësor, barna, medicamente, ymyl',
        canonicalUrl: baseUrl
      };
      break;
    default:
      metadata = {
        title: 'Farmaci Ashila | Kujdes Shëndetësor në Shqipëri',
        description: 'Farmaci Ashila - Produkte mjekësore të kuruara dhe kujdes shëndetësor profesional në Shqipëri.',
        canonicalUrl: baseUrl
      };
  }

  // Always include Pharmacy and MedicalOrganization schemas for YMYL compliance
  schemas.push(SEOManager.generateStructuredData('Pharmacy'));
  schemas.push(SEOManager.generateStructuredData('MedicalOrganization'));

  // Add breadcrumbs if provided
  if (breadcrumbs.length > 0) {
    schemas.push(SEOManager.generateStructuredData('BreadcrumbList', breadcrumbs));
  }

  // Add any additional schemas
  schemas.push(...additionalSchemas);

  // Filter out undefined schemas
  schemas = schemas.filter(Boolean);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={metadata.canonicalUrl} />

      {/* YMYL Compliance Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="language" content="sq" />
      <meta name="geo.region" content="AL" />
      <meta name="geo.placename" content="Shqipëri" />
      <meta name="author" content="Farmaci Ashila" />
      
      {/* Medical/Pharmaceutical specific meta tags */}
      <meta name="medical-health-advice" content="general" />
      <meta name="pharmacy" content="Farmaci Ashila" />
      <meta name="content-language" content="sq-AL" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'product' ? 'product' : 'website'} />
      <meta property="og:url" content={metadata.canonicalUrl} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={metadata.ogImage || `${baseUrl}/images/logo.png`} />
      <meta property="og:site_name" content="Farmaci Ashila" />
      <meta property="og:locale" content="sq_AL" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metadata.canonicalUrl} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={metadata.ogImage || `${baseUrl}/images/logo.png`} />
      
      {/* Additional SEO for YMYL */}
      <meta name="theme-color" content="#A67856" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured Data Schemas */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema, null, 0)}
        </script>
      ))}
    </Helmet>
  );
};

export default YMYLHead;
