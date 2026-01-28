// Mapping from actual form values to URL slugs (same as in Shop.jsx)
const optionToSlugMap = {
  // Tipi i lekures
  "Te gjitha": "te-gjitha",
  "Lekure normale": "lekure-normale",
  "Lekure e yndyrshme": "lekure-e-yndyrshme",
  "Lekure e thate": "lekure-e-thate",
  "Lekure mikes": "lekure-mikes",
  "Lekure sensitive": "lekure-sensitive",

  // Problematikat e lekures
  "Akne": "akne",
  "Rrudha": "rrudha",
  "Hiperpigmentim": "hiperpigmentim",
  "Balancim yndyre/pore evidente": "balancim-yndyre-pore-evidente",
  "Pika te zeza": "pika-te-zeza",
  "Dehidratim": "dehidratim",
  "Skuqje": "skuqje",
  "Rozacea": "rozacea",

  // Per trupin
  "Lares trupi": "lares-trupi",
  "Hidratues trupi": "hidratues-trupi",
  "Scrub trupi": "scrub-trupi",
  "Akne ne trup": "akne-ne-trup",
  "Kujdesi ndaj diellit": "kujdesi-ndaj-diellit",
  "Deodorant": "deodorant",
  "Vaj per trupin": "vaj-per-trupin",
  "Krem per duart & kembet": "krem-per-duart-dhe-kembet",

  // Per floke
  "Skalp i thate": "skalp-i-thate",
  "Skalp i yndyrshem": "skalp-i-yndyrshem",
  "Skalp sensitive": "skalp-sensitive",
  "Renia e flokut": "renia-e-flokut",
  "Aksesore": "aksesore-floke",

  // Higjene
  "Lares intim": "lares-intim",
  "Peceta": "peceta-intime",
  "Furce dhembesh": "furce-dhembesh",
  "Paste dhembesh": "paste-dhembesh",
  "Fill dentar/furca interdentare": "fill-dentar-furca-interdentare",

  // Nena dhe femije
  "Shtatezania": "shtatezania",
  "Pas lindjes": "pas-lindjes",
  "Ushqyerja me gji": "ushqyerja-me-gji",
  "Ushqim per femije": "ushqim-per-femije",
  "Pelena": "pelena",
  "Aksesore": "aksesore-floke",

  // Suplemente
  "Vitamina": "vitamina",
  "Suplemente per shendetin": "suplemente-per-shendetin",
  "Minerale": "minerale",
  "Suplemente bimore": "suplemente-bimore",

  // Monitoruesit e shendetit
  "Peshore": "peshore",
  "Aparat tensioni": "aparat-tensioni",
  "Termometer": "termometer",
  "Monitorues te diabetit": "monitorues-te-diabetit",
  "Oksimeter": "oksimeter",
  "Paisje ortopedike": "paisje-ortopedike",

  // Product types
  "Lares vajor": "lares-vajor",
  "Lares ujor": "lares-ujor",
  "Toner": "toner",
  "Exfoliant": "exfoliant",
  "Serume": "serume",
  "Krem per syte": "krem-per-syte",
  "Vitamin C/antioxidant": "vitamin-c-antioxidant",
  "Hidratues": "hidratues",
  "Retinol": "retinol",
  "SPF": "spf",
  "Eye patches": "eye-patches",
  "Acne patches": "acne-patches",
  "Maske fytyre": "maske-fytyre",
  "Spot treatment": "spot-treatment",
  "Uje termal": "uje-termal",
  "Peeling Pads": "peeling-pads",
  "Lipbalm": "lipbalm",
  "Set me produkte": "set-me-produkte",

  // Sete
  "Set per fytyren": "set-per-fytyren",
  "Set per trupin": "set-per-trupin",
  "Set per floket": "set-per-floket",
  "Set per nena": "set-per-nena",
  "Set per femije": "set-per-femije"
};

// Category to slug mapping
const categoryToSlugMap = {
  "Kujdesi per fytyren": "kujdesi-per-fytyren",
  "Kujdesi per trupin dhe floke": "kujdesi-per-trupin-dhe-floke",
  "Higjene": "higjene",
  "Nena dhe femije": "nena-dhe-femije",
  "Suplemente dhe vitamina": "suplemente-dhe-vitamina",
  "Suplemente dhe vitamina": "suplemente-dhe-vitamina",
  "Monitoruesit e shendetit": "monitoruesit-e-shendetit",
  "Set": "set"
};

// Function to create slug from text
export const createSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalize special characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
};

// Generate SEO-friendly product URL based on product data
export const generateProductUrl = (product) => {
  if (!product) return '/product';

  // Use the first option for the URL path (primary category)
  let primaryOption = '';
  if (product.options && product.options.length > 0) {
    primaryOption = product.options[0];
  } else if (product.option) {
    primaryOption = product.option;
  }

  // Get the slug for the primary option
  const optionSlug = optionToSlugMap[primaryOption] || createSlug(primaryOption);

  if (!optionSlug) {
    const fallbackId = product._id || product.id;
    return fallbackId ? `/product/${fallbackId}` : '/product';
  }

  // Create product name slug
  const productName = product.itemName || product.genericName || 'product';
  const company = product.company || '';

  let descriptiveName = productName.toLowerCase();
  if (company && company !== productName) {
    descriptiveName += `-${company.toLowerCase()}`;
  }
  if (product.size) {
    descriptiveName += `-${product.size.toLowerCase().replace(/\s+/g, '-')}`;
  }

  const productSlug = createSlug(descriptiveName);

  // Generate URL that matches navbar structure
  return `/shop?subcategory=${optionSlug}#${productSlug}`;
};

// Alternative: Generate direct product URL with category structure
// Alternative: Generate direct product URL with category structure
export const generateDirectProductUrl = (product) => {
  if (!product) return '/product';

  // Use the first option for the URL path
  let primaryOption = '';
  if (product.options && product.options.length > 0) {
    primaryOption = product.options[0];
  } else if (product.option) {
    primaryOption = product.option;
  } else if (product.categoryName) {
    // Fallback: use categoryName
    primaryOption = product.categoryName;
  } else if (product.category && product.category.categoryName) {
    // Fallback: use category object
    primaryOption = product.category.categoryName;
  }

  // Get the slug for the primary option
  const optionSlug = optionToSlugMap[primaryOption] || createSlug(primaryOption);

  // If no valid category slug, return null to prevent malformed URLs (e.g. /product//slug)
  if (!optionSlug) return null;

  // Create product name slug
  const productName = product.itemName || product.genericName || 'product';
  const company = product.company || '';

  let descriptiveName = productName.toLowerCase();
  if (company && company !== productName) {
    descriptiveName += `-${company.toLowerCase()}`;
  }
  if (product.size) {
    descriptiveName += `-${product.size.toLowerCase().replace(/\s+/g, '-')}`;
  }

  const productSlug = createSlug(descriptiveName);

  // Generate URL with category structure
  return `/product/${optionSlug}/${productSlug}`;
};

// Get all option slugs for a product (for filtering)
export const getProductOptionSlugs = (product) => {
  const slugs = [];

  if (product.options && product.options.length > 0) {
    product.options.forEach(option => {
      const slug = optionToSlugMap[option] || createSlug(option);
      if (slug && !slugs.includes(slug)) {
        slugs.push(slug);
      }
    });
  } else if (product.option) {
    const slug = optionToSlugMap[product.option] || createSlug(product.option);
    if (slug) slugs.push(slug);
  }

  // Also include product type
  if (product.productType) {
    const slug = optionToSlugMap[product.productType] || createSlug(product.productType);
    if (slug && !slugs.includes(slug)) {
      slugs.push(slug);
    }
  }

  return slugs;
};
