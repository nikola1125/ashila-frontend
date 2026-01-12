import React, { useState, useEffect } from 'react';

const Sitemap = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // Fetch all products and categories for dynamic sitemap
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch('https://www.farmaciashila.com/api/products');
        const productsData = await productsResponse.json();
        
        // Fetch categories  
        const categoriesResponse = await fetch('https://www.farmaciashila.com/api/categories');
        const categoriesData = await categoriesResponse.json();
        
        setProducts(productsData.result || []);
        setCategories(categoriesData.result || []);
      } catch (error) {
        console.error('Sitemap data fetch error:', error);
        // Fallback to empty arrays
        setProducts([]);
        setCategories([]);
      }
    };
    
    fetchData();
  }, []);

  const currentDate = new Date().toISOString();
  
  const staticPages = [
    {
      url: 'https://www.farmaciashila.com',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: 'https://www.farmaciashila.com/shop',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: 'https://www.farmaciashila.com/contact-us',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: 'https://www.farmaciashila.com/login',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: 'https://www.farmaciashila.com/sign-up',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    }
  ];

  const generateSitemap = () => {
    const staticPagesXml = staticPages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

    // Add product pages
    const productPagesXml = products.map(product => `
  <url>
    <loc>https://www.farmaciashila.com/product/${product._id}</loc>
    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    // Add category pages
    const categoryPagesXml = categories.map(category => `
  <url>
    <loc>https://www.farmaciashila.com/shop?category=${category.categoryName}</loc>
    <lastmod>${new Date(category.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPagesXml}
${productPagesXml}
${categoryPagesXml}
</urlset>`;
  };

  return (
    <div style={{ display: 'none' }}>
      {generateSitemap()}
    </div>
  );
};

export default Sitemap;
