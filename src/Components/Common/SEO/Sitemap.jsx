import React from 'react';

const Sitemap = () => {
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
    const pages = staticPages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages}
</urlset>`;
  };

  return (
    <div style={{ display: 'none' }}>
      {generateSitemap()}
    </div>
  );
};

export default Sitemap;
