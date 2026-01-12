import React from 'react';
import { Helmet } from 'react-helmet-async';

const ProductSEO = ({ product }) => {
  if (!product) return null;

  const siteTitle = 'Ashila Pharmacy';
  const fullTitle = `${product.itemName} | ${siteTitle}`;
  
  // Generate product description
  const description = product.description 
    ? `${product.itemName} - ${product.description.substring(0, 150)}... | Blerje online në Shqipëri | Farmaci Ashila`
    : `${product.itemName} | Blerje online barna dhe mjekësore | Farmaci Ashila`;

  // Generate keywords
  const keywords = [
    product.itemName,
    product.genericName || '',
    product.company || '',
    product.categoryName || '',
    'farmaci online',
    'barna online Shqipëri',
    'medicamente',
    'produkte mjekësore',
    'blerje barna',
    'farmaci ashila'
  ].filter(Boolean).join(', ');

  // Product image for Open Graph
  const productImage = product.image || product.imageUrl || '/logo.png';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://www.farmaciashila.com/product/${product._id}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={productImage} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={`https://www.farmaciashila.com/product/${product._id}`} />
      <meta property="product:price:amount" content={product.price} />
      <meta property="product:price:currency" content="ALL" />
      <meta property="product:availability" content={product.stock > 0 ? 'in stock' : 'out of stock'} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="product" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={productImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="sq" />
      <meta name="geo.region" content="AL" />
      <meta name="geo.placename" content="Shqipëri" />
      
      {/* Structured Data - Product Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.itemName,
          "description": description,
          "image": productImage,
          "brand": {
            "@type": "Brand",
            "name": product.company || "Farmaci Ashila"
          },
          "category": product.categoryName || "Mjekësi",
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "ALL",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "Farmaci Ashila",
              "url": "https://www.farmaciashila.com"
            }
          },
          "url": `https://www.farmaciashila.com/product/${product._id}`
        })}
      </script>
    </Helmet>
  );
};

export default ProductSEO;
