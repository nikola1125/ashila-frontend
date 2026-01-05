import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL
const baseUrl = 'https://www.farmaciashila.com';

// Function to create SEO-friendly slug
function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalize special characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
}

// Static pages (add more important pages)
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/shop', priority: '0.9', changefreq: 'daily' },
  { url: '/contact-us', priority: '0.8', changefreq: 'monthly' },
  { url: '/about-us', priority: '0.7', changefreq: 'yearly' },
  { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms-conditions', priority: '0.3', changefreq: 'yearly' },
];

// Mapping for primary options (matching frontend/src/utils/productUrls.js)
const optionToSlugMap = {
  "Te gjitha": "te-gjitha", "Lekure normale": "lekure-normale", "Lekure e yndyrshme": "lekure-e-yndyrshme",
  "Lekure e thate": "lekure-e-thate", "Lekure mikes": "lekure-mikes", "Lekure sensitive": "lekure-sensitive",
  "Akne": "akne", "Rrudha": "rrudha", "Hiperpigmentim": "hiperpigmentim",
  "Balancim yndyre/pore evidente": "balancim-yndyre-pore-evidente", "Pika te zeza": "pika-te-zeza",
  "Dehidratim": "dehidratim", "Skuqje": "skuqje", "Rozacea": "rozacea",
  "Lares trupi": "lares-trupi", "Hidratues trupi": "hidratues-trupi", "Scrub trupi": "scrub-trupi",
  "Akne ne trup": "akne-ne-trup", "Kujdesi ndaj diellit": "kujdesi-ndaj-diellit", "Deodorant": "deodorant",
  "Vaj per trupin": "vaj-per-trupin", "Krem per duart & kembet": "krem-per-duart-dhe-kembet",
  "Skalp i thate": "skalp-i-thate", "Skalp i yndyrshem": "skalp-i-yndyrshem", "Skalp sensitive": "skalp-sensitive",
  "Renia e flokut": "renia-e-flokut", "Aksesore": "aksesore-floke",
  "Lares intim": "lares-intim", "Peceta": "peceta-intime", "Furce dhembesh": "furce-dhembesh",
  "Paste dhembesh": "paste-dhembesh", "Fill dentar/furca interdentare": "fill-dentar-furca-interdentare",
  "Shtatezania": "shtatezania", "Pas lindjes": "pas-lindjes", "Ushqyerja me gji": "ushqyerja-me-gji",
  "Ushqim per femije": "ushqim-per-femije", "Pelena": "pelena",
  "Vitamina": "vitamina", "Suplemente per shendetin": "suplemente-per-shendetin", "Minerale": "minerale",
  "Suplemente bimore": "suplemente-bimore", "Peshore": "peshore", "Aparat tensioni": "aparat-tensioni",
  "Termometer": "termometer", "Monitorues te diabetit": "monitorues-te-diabetit", "Oksimeter": "oksimeter",
  "Paisje ortopedike": "paisje-ortopedike"
};

// Function to fetch products from API
async function fetchProducts() {
  try {
    const response = await fetch('https://ashila-backend.onrender.com/medicines');
    if (!response.ok) return [];
    const data = await response.json();
    const products = data.result || data;
    
    return (Array.isArray(products) ? products : []).map(product => {
      const productName = product.itemName || product.genericName || 'product';
      const companyName = product.company || '';
      
      // Determine primary category slug for path /product/:category/:slug
      let primaryOption = '';
      if (product.options && product.options.length > 0) {
        primaryOption = product.options[0];
      } else if (product.option) {
        primaryOption = product.option;
      }
      const categorySlug = optionToSlugMap[primaryOption] || createSlug(primaryOption) || 'general';

      let descriptiveName = productName.toLowerCase();
      if (companyName && companyName !== productName) {
        descriptiveName += `-${companyName.toLowerCase()}`;
      }
      if (product.size) {
        descriptiveName += `-${product.size.toLowerCase().replace(/\s+/g, '-')}`;
      }
      const productSlug = createSlug(descriptiveName);
      
      return {
        url: `/product/${categorySlug}/${productSlug}`,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: product.updatedAt ? 
          new Date(product.updatedAt).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Function to fetch categories from API
async function fetchCategories() {
  try {
    const response = await fetch('https://ashila-backend.onrender.com/categories');
    if (!response.ok) return [];
    const data = await response.json();
    const categories = data.result || data;
    
    return (Array.isArray(categories) ? categories : []).map(category => {
      // Use actual category name for SEO-friendly URL
      const categoryName = category.categoryName || 'category';
      const categorySlug = createSlug(categoryName);
      
      return {
        url: `/category/${categorySlug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: category.updatedAt ? 
          new Date(category.updatedAt).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0]
      };
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Generate multiple sitemaps if needed (for large sites)
async function generateSitemapIndex(totalUrls) {
  const maxUrlsPerSitemap = 50000; // Google's limit
  const sitemapCount = Math.ceil(totalUrls / maxUrlsPerSitemap);
  
  if (sitemapCount <= 1) return null;
  
  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (let i = 0; i < sitemapCount; i++) {
    sitemapIndex += '  <sitemap>\n';
    sitemapIndex += `    <loc>${baseUrl}/sitemap-${i + 1}.xml</loc>\n`;
    sitemapIndex += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    sitemapIndex += '  </sitemap>\n';
  }
  
  sitemapIndex += '</sitemapindex>';
  return sitemapIndex;
}

async function generateDynamicSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  const today = new Date().toISOString().split('T')[0];
  
  // Add static pages
  staticPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  try {
    // Fetch dynamic content
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);
    
    // Add products with SEO-friendly URLs
    products.forEach(product => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${product.url}</loc>\n`;
      sitemap += `    <lastmod>${product.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${product.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${product.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });
    
    // Add categories with SEO-friendly URLs
    categories.forEach(category => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${category.url}</loc>\n`;
      sitemap += `    <lastmod>${category.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${category.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${category.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });
    
    const totalUrls = staticPages.length + products.length + categories.length;
    console.log(`✅ Generated sitemap with ${totalUrls} URLs`);
    console.log(`📊 Breakdown: ${staticPages.length} static, ${products.length} products, ${categories.length} categories`);
    
    sitemap += '</urlset>';
    
    return {
      content: sitemap,
      totalUrls,
      productsCount: products.length,
      categoriesCount: categories.length
    };
    
  } catch (error) {
    console.error('Error generating dynamic content:', error);
    sitemap += '</urlset>';
    return {
      content: sitemap,
      totalUrls: staticPages.length,
      productsCount: 0,
      categoriesCount: 0
    };
  }
}

// Generate robots.txt with sitemap reference
function generateRobotsTxt() {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  
  // Write robots.txt to public and dist folders
  const robotsPathPublic = path.join(__dirname, 'public', 'robots.txt');
  const robotsPathDist = path.join(__dirname, 'dist', 'robots.txt');
  
  fs.writeFileSync(robotsPathPublic, robots);
  fs.writeFileSync(robotsPathDist, robots);
  console.log('✅ Generated robots.txt');
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting sitemap generation...');
    
    // Generate sitemap
    const sitemapData = await generateDynamicSitemap();
    
    // Write main sitemap
    const sitemapPathPublic = path.join(__dirname, 'public', 'sitemap.xml');
    const sitemapPathDist = path.join(__dirname, 'dist', 'sitemap.xml');
    
    fs.writeFileSync(sitemapPathPublic, sitemapData.content);
    fs.writeFileSync(sitemapPathDist, sitemapData.content);
    
    // Generate sitemap index if needed
    if (sitemapData.totalUrls > 50000) {
      const sitemapIndex = await generateSitemapIndex(sitemapData.totalUrls);
      if (sitemapIndex) {
        const indexPathPublic = path.join(__dirname, 'public', 'sitemap_index.xml');
        const indexPathDist = path.join(__dirname, 'dist', 'sitemap_index.xml');
        
        fs.writeFileSync(indexPathPublic, sitemapIndex);
        fs.writeFileSync(indexPathDist, sitemapIndex);
        console.log('✅ Generated sitemap_index.xml for large site');
      }
    }
    
    // Generate robots.txt
    generateRobotsTxt();
    
    console.log('🎉 Sitemap generation completed!');
    console.log(`📍 Main sitemap: ${baseUrl}/sitemap.xml`);
    console.log(`📍 Robots.txt: ${baseUrl}/robots.txt`);
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`Total URLs: ${sitemapData.totalUrls}`);
    console.log(`Products: ${sitemapData.productsCount}`);
    console.log(`Categories: ${sitemapData.categoriesCount}`);
    
  } catch (error) {
    console.error('❌ Error in sitemap generation:', error);
    process.exit(1);
  }
}

// Run with cron schedule suggestions
main().then(() => {
  console.log('\n⏰ Recommended cron job for automatic updates:');
  console.log('0 2 * * * cd /path/to/your/project && node generate-sitemap.js');
  console.log('(Runs daily at 2 AM to update sitemap)');
});
