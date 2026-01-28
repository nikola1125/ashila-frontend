import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  ogImage = 'https://www.farmaciashila.com/images/logo.png',
  canonicalUrl = 'https://www.farmaciashila.com/'
}) => {
  const siteName = 'Farmaci Ashila';
  // If title is empty, use just siteName. If title is provided, use it (it might already have the site name)
  const fullTitle = title || siteName;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Technical Meta */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="sq" />
      <meta name="geo.region" content="AL" />
      <meta name="geo.placename" content="Tirana" />

      {/* Organization & WebSite Schema */}
      <script type="application/ld+json">
        {JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://www.farmaciashila.com/#organization",
            "name": siteName,
            "url": "https://www.farmaciashila.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.farmaciashila.com/images/logo.png",
              "width": 512,
              "height": 512
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+355686879292",
              "contactType": "customer service"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://www.farmaciashila.com/#website",
            "name": siteName,
            "url": "https://www.farmaciashila.com",
            "publisher": {
              "@id": "https://www.farmaciashila.com/#organization"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.farmaciashila.com/shop?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ])}
      </script>
    </Helmet>
  );
};

export default SEO;
