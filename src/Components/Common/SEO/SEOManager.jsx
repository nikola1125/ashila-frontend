import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Centralized SEO Manager for YMYL compliance
 * Generates dynamic metadata following Google's pharmaceutical guidelines
 */
class SEOManager {
  static generateProductMetadata(product, categoryName) {
    if (!product) return null;

    const siteName = 'Farmaci Ashila';
    const baseUrl = 'https://www.farmaciashila.com';
    
    // YMYL-compliant title pattern: [Product Name] - [Category] | Farmaci Ashila
    const title = `${product.itemName} - ${categoryName || 'Mjekësi'} | ${siteName}`;
    
    // Medical-focused description with trust signals
    const description = product.description
      ? `${product.itemName} - ${product.description.substring(0, 150)}. Produkt i kuruar mjekësor nga ${product.company || 'Farmaci Ashila'}. Kujdes shëndetësor profesional në Shqipëri.`
      : `${product.itemName} | Produkt mjekësor i kuruar nga ${product.company || 'Farmaci Ashila'}. Kujdes shëndetësor cilësor dhe i sigurtë në Shqipëri.`;

    // Medical and pharmaceutical keywords
    const keywords = [
      product.itemName,
      product.genericName || '',
      product.company || '',
      categoryName || '',
      'farmaci online Shqipëri',
      'barna online',
      'medicamente',
      'produkte farmaceutike',
      'kujdes shëndetësor',
      'mjekësi',
      'blerje barna',
      'farmaci shila',
      'produkte mjekësore të kuruara',
      'siguria e pacientëve'
    ].filter(Boolean).join(', ');

    // Generate SEO-friendly slug if not exists
    const slug = this.generateSlug(product.itemName, product.company, product.size);
    const canonicalUrl = `${baseUrl}/produkte/${categoryName?.toLowerCase().replace(/\s+/g, '-') || 'mjekesi'}/${slug}`;

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage: product.image || product.imageUrl || `${baseUrl}/images/logo.png`,
      product
    };
  }

  static generateCategoryMetadata(category, products = []) {
    const siteName = 'Farmaci Ashila';
    const baseUrl = 'https://www.farmaciashila.com';
    
    const title = `${category.categoryName} | ${siteName}`;
    const description = category.description 
      ? `${category.categoryName} - ${category.description}. Zbuloni produktet mjekësore të kuruara në Shqipëri. Kujdes shëndetësor profesional dhe i sigurtë.`
      : `${category.categoryName} | Produkte mjekësore të kuruara nga Farmaci Ashila. Kujdes shëndetësor cilësor në Shqipëri.`;

    const keywords = [
      category.categoryName,
      'farmaci online',
      'barna Shqipëri',
      'produkte mjekësore',
      'kujdes shëndetësor',
      'farmaci shila',
      ...products.slice(0, 5).map(p => p.itemName)
    ].filter(Boolean).join(', ');

    const slug = this.generateSlug(category.categoryName);
    const canonicalUrl = `${baseUrl}/kategoria/${slug}`;

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      category,
      productCount: products.length
    };
  }

  static generateStructuredData(type, data) {
    switch (type) {
      case 'Product':
        return this.generateProductSchema(data);
      case 'Pharmacy':
        return this.generatePharmacySchema();
      case 'BreadcrumbList':
        return this.generateBreadcrumbSchema(data);
      case 'MedicalOrganization':
        return this.generateMedicalOrganizationSchema();
      default:
        return null;
    }
  }

  static generateProductSchema(product) {
    const baseUrl = 'https://www.farmaciashila.com';
    
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.itemName,
      "description": product.description || `${product.itemName} - Produkt mjekësor i kuruar`,
      "image": product.image || product.imageUrl || `${baseUrl}/images/logo.png`,
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
          "@type": "Pharmacy",
          "name": "Farmaci Ashila",
          "url": baseUrl
        }
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Formë farmaceutike",
          "value": product.size || "Standard"
        },
        {
          "@type": "PropertyValue", 
          "name": "Prodhues",
          "value": product.company || "N/A"
        }
      ],
      "url": `${baseUrl}/produkte/${product.categoryName?.toLowerCase().replace(/\s+/g, '-') || 'mjekesi'}/${this.generateSlug(product.itemName, product.company, product.size)}`,
      "aggregateRating": product.rating > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount || 0,
        "bestRating": 5,
        "worstRating": 1
      } : undefined
    };
  }

  static generatePharmacySchema() {
    return {
      "@context": "https://schema.org",
      "@type": "Pharmacy",
      "name": "Farmaci Ashila",
      "url": "https://www.farmaciashila.com",
      "logo": "https://www.farmaciashila.com/images/logo.png",
      "image": "https://www.farmaciashila.com/images/logo.png",
      "description": "Farmaci Ashila - Produkte mjekësore të kuruara dhe këshillim profesional në Shqipëri. Kujdes shëndetësor cilësor dhe i sigurtë.",
      "telephone": "+35569XXXXXXX",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Rr. Reshit Petrela",
        "addressLocality": "Tiranë",
        "addressRegion": "Tiranë",
        "postalCode": "1001",
        "addressCountry": "AL"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 41.332,
        "longitude": 19.816
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:00",
          "closes": "21:00"
        },
        {
          "@type": "OpeningHoursSpecification", 
          "dayOfWeek": "Sunday",
          "opens": "09:00",
          "closes": "14:00"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/farmaciashila",
        "https://www.instagram.com/farmaciashila"
      ],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.farmaciashila.com/kerko?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  }

  static generateBreadcrumbSchema(breadcrumbs) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }

  static generateMedicalOrganizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      "name": "Farmaci Ashila",
      "url": "https://www.farmaciashila.com",
      "logo": "https://www.farmaciashila.com/images/logo.png",
      "description": "Organizë mjekësore e licencuar në Shqipëri. Produkte farmaceutike të kuruara dhe kujdes shëndetësor profesional.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Rr. Reshit Petrela",
        "addressLocality": "Tiranë",
        "addressCountry": "AL"
      },
      "telephone": "+35569XXXXXXX",
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Licencë Farmacie",
        "recognizedBy": "Agjencia Kombëtare e Barnave dhe Pajisjeve Mjekësore"
      }
    };
  }

  static generateSlug(productName, company, size) {
    if (!productName) return '';
    
    let slug = productName
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');

    if (company && company !== productName) {
      slug += `-${company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    }
    
    if (size) {
      slug += `-${size.toLowerCase().replace(/\s+/g, '-')}`;
    }

    return slug;
  }

  static generateOpenGraphImage(product) {
    // For future implementation: Dynamic OG image generation
    const baseUrl = 'https://www.farmaciashila.com';
    return product.image || product.imageUrl || `${baseUrl}/images/og-default.png`;
  }
}

export default SEOManager;
