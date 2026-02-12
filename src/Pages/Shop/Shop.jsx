import React, { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import LoadingError from '../../Components/Common/States/LoadingError';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import ShopGrid from '../../Components/Grid/ShopGrid';
import VariantSelectionSidebar from '../../Components/Common/Products/VariantSelectionSidebar';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { CartContext } from '../../Context/Cart/CartContext';
import Breadcrumbs from '../../Components/Common/Navigation/Breadcrumbs';
import CategorySEO from '../../Components/Common/SEO/CategorySEO';
import { useSmoothScroll } from '../../Context/SmoothScroll/SmoothScrollProvider';

const Shop = () => {
  const location = useLocation();
  const { addItem } = useContext(CartContext);
  const { publicApi } = useAxiosSecure();
  const { scrollToTop } = useSmoothScroll();



  const onAddToCart = useCallback((product, quantity = 1, selectedVariant = null) => {
    addItem(product, quantity, selectedVariant);
  }, [addItem]);

  const [currentPage, setCurrentPage] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam) : 1;
  });
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [sortBy, setSortBy] = useState('alphabetical');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Hidden on mobile by default, visible on desktop

  // Ultimate "Fail-Safe" scroll to top on page change
  useEffect(() => {
    // 1. Try Lenis provider (primary)
    if (scrollToTop) {
      scrollToTop({ immediate: true });
    }

    // 2. Hard native fallback (real device browser level)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // 3. Forced DOM manipulation (last resort for Safari/Android)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 4. Delayed backup to catch any layout shifts
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timer);
  }, [currentPage, scrollToTop]);

  // Get all medicines - Moved to top to be available for filterOptions
  // Use group=true to group variants together
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => {
      // Add mobile debugging
      if (typeof window !== 'undefined') {
        console.log('Mobile Debug:', {
          userAgent: navigator.userAgent,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
          isAndroid: /Android/.test(navigator.userAgent),
          connection: navigator.connection?.effectiveType,
          timestamp: new Date().toISOString()
        });
      }
      return publicApi.get('/medicines?group=true');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - will use default refetchOnMount
    retry: (failureCount, error) => {
      // Add retry debugging
      if (typeof window !== 'undefined') {
        console.log('Retry attempt:', {
          attempt: failureCount + 1,
          error: error?.message,
          status: error?.response?.status,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        });
      }
      return failureCount < 3; // Retry up to 3 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const allMedicines = data?.result || [];

  // Category expansion states
  const [expandedCategories, setExpandedCategories] = useState({
    problematica: false,
    skinTypes: false,
    productTypes: false,
    bodyHair: false,
    hygiene: false,
    motherChild: false,

    supplements: false,
    healthMonitors: false,
    sets: false,
  });

  // Toggle category expansion
  const toggleCategory = useCallback((categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  }, []);

  // Filter states
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [selectedBodyHair, setSelectedBodyHair] = useState([]);
  const [selectedHygiene, setSelectedHygiene] = useState([]);
  const [selectedMotherChild, setSelectedMotherChild] = useState([]);

  const [selectedSupplements, setSelectedSupplements] = useState([]);
  const [selectedHealthMonitors, setSelectedHealthMonitors] = useState([]);
  const [selectedSets, setSelectedSets] = useState([]);

  // Variant Selection State
  const [isVariantSidebarOpen, setIsVariantSidebarOpen] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
  const [activeVariantForSidebar, setActiveVariantForSidebar] = useState(null);


  // Helper to normalize text for comparison
  const normalizeText = useCallback((text) => {
    if (!text) return '';
    // Systemic normalization for ALL products:
    // 1. Remove accents/Albanian specifics
    // 2. Remove all non-alphanumeric chars
    // 3. Handle specific group synonyms systematically
    let normalized = text.toLowerCase()
      .replace(/[ëèé]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/fytyre/g, 'lekure')
      .replace(/trupin/g, 'trupi')
      .replace(/floke/g, 'flokë') // align potential mismatches
      .replace(/[^a-z0-9]/g, '');
    return normalized;
  }, []);

  // Create mapping from actual form values to filter slugs
  const optionToSlugMap = {
    // Tipi i lekures
    "Te gjitha": "te-gjitha",
    "Lekure normale": "lekure-normale",
    "Lekure e yndyrshme": "lekure-e-yndyrshme",
    "Lekure e thate": "lekure-e-thate",
    "Lekure mikes": "lekure-mikes",
    "Lekure mikse": "lekure-mikes",
    "Lekure sensitive": "lekure-sensitive",

    // Synonyms for slug matching
    "fytyre-normale": "lekure-normale",
    "fytyre-e-yndyrshme": "lekure-e-yndyrshme",
    "fytyre-e-thate": "lekure-e-thate",
    "fytyre-mikes": "lekure-mikes",
    "fytyre-sensitive": "lekure-sensitive",

    // Problematikat e fytyres
    "Akne": "akne",
    "Rrudha": "rrudha",
    "Hiperpigmentim": "hiperpigmentim",
    "Balancim yndyre/pore evidente": "balancim-yndyre-pore-evidente",
    "Pikat e zeza": "pika-te-zeza",
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
    "Krem per duart & këmbet": "krem-per-duart-dhe-kembet",
    "Krem per duart & kembet": "krem-per-duart-dhe-kembet",
    "Krem per duart & këmbet (dhe)": "krem-per-duart-dhe-kembet",

    // Aksesore trupi
    "Aksesore trupi": "aksesore-trupi",

    // Per flokë
    "Skalp i thate": "skalp-i-thate",
    "Skalp i yndyrshem": "skalp-i-yndyrshem",
    "Skalp sensitive": "skalp-sensitive",
    "Renia e flokut": "renia-e-flokut",
    "Aksesore": "aksesore-floke",

    // Higjene
    "Lares intim": "lares-intim",
    "Peceta intime": "peceta-intime",
    "Furce dhembesh": "furce-dhembesh",
    "Paste dhembesh": "paste-dhembesh",
    "Fill dentar/furca interdentare": "fill-dentar-furca-interdentare",

    // Nena dhe femije
    "Shtatezania": "shtatezania",
    "Pas lindjes": "pas-lindjes",
    "Ushqyerja me gji": "ushqyerja-me-gji",
    "Ushqim per femije": "ushqim-per-femije",
    "Pelena": "pelena",
    "Aksesore femije": "aksesore-femije",

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

    // Set
    "Set per fytyren": "set-per-fytyren",
    "Set per trupin": "set-per-trupin",
    "Set per floket": "set-per-floket",
    "Set per nena": "set-per-nena",
    "Set per femije": "set-per-femije"
  };

  // Pre-compute normalized values for all medicines to avoid expensive regex during filtering
  const normalizedMedicines = useMemo(() => {
    return allMedicines.map(item => {
      const itemOpts = item.options ? item.options.map(opt => normalizeText(opt)) : [];
      // Use Set for faster lookups
      const itemOptSlugs = new Set(item.options ? item.options.map(opt => normalizeText(optionToSlugMap[opt] || opt)) : []);
      const itemPath = normalizeText(item.categoryName);

      return {
        ...item,
        // Pre-normalized fields
        norm: {
          subcategory: normalizeText(item.subcategory),
          option: normalizeText(item.option),
          options: itemOpts,
          optSlugs: itemOptSlugs,
          productType: normalizeText(item.productType),
          bestsellerCategory: normalizeText(item.bestsellerCategory),
          categoryName: itemPath,
          skinProblem: normalizeText(item.skinProblem),
          itemName: normalizeText(item.itemName),
          company: normalizeText(item.company),
          genericName: normalizeText(item.genericName),

          // Pre-calculated context checks
          isAksesoreNene: (itemPath.includes('aksesore') && itemPath.includes('kujdesipernenena')) ||
            itemOpts.some(opt => opt === 'aksesore' && itemPath.includes('kujdesipernenena')) ||
            itemOptSlugs.has('aksesorenene'),
          isAksesoreFemije: (itemPath.includes('aksesore') && itemPath.includes('kujdesiperfemije')) ||
            itemOpts.some(opt => opt === 'aksesore' && itemPath.includes('kujdesiperfemije')) ||
            itemOptSlugs.has('aksesorefemije')
        }
      };
    });
  }, [allMedicines, normalizeText, optionToSlugMap]);

  // Calculate dynamic filter counts based on normalizedMedicines
  const filterOptions = useMemo(() => {
    // Initial counts object
    const counts = {};

    // Initialize counts to 0
    const filterGroups = {
      problematica: ['akne', 'rrudha', 'hiperpigmentim', 'balancim-yndyre-pore-evidente', 'pika-te-zeza', 'dehidratim', 'skuqje', 'rozacea'],
      skinTypes: ['lekure-normale', 'lekure-e-yndyrshme', 'lekure-e-thate', 'lekure-mikes', 'lekure-sensitive'],
      bodyHair: ['lares-trupi', 'hidratues-trupi', 'scrub-trupi', 'akne-ne-trup', 'kujdesi-ndaj-diellit', 'deodorant', 'vaj-per-trupin', 'krem-per-duart-dhe-kembet', 'aksesore-trupi', 'skalp-i-thate', 'skalp-i-yndyrshem', 'skalp-sensitive', 'renia-e-flokut', 'aksesore-floke'],
      hygiene: ['lares-intim', 'peceta-intime', 'furce-dhembesh', 'paste-dhembesh', 'fill-dentar-furca-interdentare'],
      motherChild: ['shtatezania', 'pas-lindjes', 'ushqyerja-me-gji', 'aksesore-nene', 'ushqim-per-femije', 'pelena', 'aksesore-femije'],
      supplements: ['vitamina', 'suplemente-per-shendetin', 'minerale', 'suplemente-bimore'],
      healthMonitors: ['peshore', 'aparat-tensioni', 'termometer', 'monitorues-te-diabetit', 'oksimeter', 'paisje-ortopedike'],
      productTypes: ['lares-vajor', 'lares-ujor', 'toner', 'exfoliant', 'serume', 'krem-per-syte', 'vitamin-c-antioxidant', 'hidratues', 'retinol', 'spf', 'eye-patches', 'acne-patches', 'maske-fytyre', 'spot-treatment', 'uje-termal', 'peeling-pads', 'lipbalm', 'set-me-produkte'],
      sets: ['set-per-fytyren', 'set-per-trupin', 'set-per-floket', 'set-per-nena', 'set-per-femije']
    };

    // Helper to check match (using pre-normalized data)
    const checkMatch = (item, filterId) => {
      const normalizedFilter = normalizeText(filterId);

      // Special handling for aksesore filters to handle context
      if (normalizedFilter === 'aksesorenene') {
        return item.norm.isAksesoreNene;
      }

      if (normalizedFilter === 'aksesorefemije') {
        return item.norm.isAksesoreFemije;
      }

      return item.norm.subcategory.includes(normalizedFilter) ||
        item.norm.option.includes(normalizedFilter) ||
        item.norm.options.some(opt => opt.includes(normalizedFilter)) ||
        item.norm.optSlugs.has(normalizedFilter) || // Exact slug match usually sufficient or partial check below
        Array.from(item.norm.optSlugs).some(slug => slug.includes(normalizedFilter)) ||
        item.norm.productType.includes(normalizedFilter) ||
        item.norm.categoryName.includes(normalizedFilter) ||
        item.norm.skinProblem.includes(normalizedFilter) ||
        item.norm.bestsellerCategory.includes(normalizedFilter);
    };

    // Calculate actual counts using optimized data
    normalizedMedicines.forEach(item => {
      Object.values(filterGroups).flat().forEach(filterId => {
        if (checkMatch(item, filterId)) {
          counts[filterId] = (counts[filterId] || 0) + 1;
        }
      });
    });

    return {
      problematica: [
        { id: 'akne', label: 'Akne' },
        { id: 'rrudha', label: 'Rrudha' },
        { id: 'hiperpigmentim', label: 'Hiperpigmentim' },
        { id: 'balancim-yndyre-pore-evidente', label: 'Balancim yndyre/pore evidente' },
        { id: 'pika-te-zeza', label: 'Pikat e zeza' },
        { id: 'dehidratim', label: 'Dehidratim' },
        { id: 'skuqje', label: 'Skuqje' },
        { id: 'rozacea', label: 'Rozacea' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
      skinTypes: [
        { id: 'lekure-normale', label: 'Lekure normale' },
        { id: 'lekure-e-yndyrshme', label: 'Lekure e yndyrshme' },
        { id: 'lekure-e-thate', label: 'Lekure e thate' },
        { id: 'lekure-mikes', label: 'Lekure mikes' },
        { id: 'lekure-sensitive', label: 'Lekure sensitive' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
      bodyHair: [
        { id: 'lares-trupi', label: 'Larës trupi' },
        { id: 'hidratues-trupi', label: 'Hidratues trupi' },
        { id: 'scrub-trupi', label: 'Scrub trupi' },
        { id: 'akne-ne-trup', label: 'Akne ne trup' },
        { id: 'kujdesi-ndaj-diellit', label: 'Kujdesi ndaj diellit' },
        { id: 'deodorant', label: 'Deodorant' },
        { id: 'vaj-per-trupin', label: 'Vaj per trupin' },
        { id: 'krem-per-duart-dhe-kembet', label: 'Krem per duart & kembet' },
        { id: 'aksesore-trupi', label: 'Aksesore trupi' },
        { id: 'skalp-i-thate', label: 'Skalp i thate' },
        { id: 'skalp-i-yndyrshem', label: 'Skalp i yndyrshem' },
        { id: 'skalp-sensitive', label: 'Skalp sensitive' },
        { id: 'renia-e-flokut', label: 'Renia e flokut' },
        { id: 'aksesore-floke', label: 'Aksesore' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
      hygiene: [
        { id: 'lares-intim', label: 'Larës intim' },
        { id: 'peceta-intime', label: 'Peceta' },
        { id: 'furce-dhembesh', label: 'Furce dhembesh' },
        { id: 'paste-dhembesh', label: 'Paste dhembesh' },
        { id: 'fill-dentar-furca-interdentare', label: 'Fill dentar/furca interdentare' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
      motherChild: [
        { id: 'shtatezania', label: 'Shtatezania' },
        { id: 'pas-lindjes', label: 'Pas lindjes' },
        { id: 'ushqyerja-me-gji', label: 'Ushqyerja me gji' },
        { id: 'aksesore-nene', label: 'Aksesore (nënë)' },
        { id: 'ushqim-per-femije', label: 'Ushqim per femije' },
        { id: 'pelena', label: 'Pelena' },
        { id: 'aksesore-femije', label: 'Aksesore (fëmijë)' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
      supplements: [
        { id: 'vitamina', label: 'Vitamina' },
        { id: 'suplemente-per-shendetin', label: 'Suplemente per shendetin' },
        { id: 'minerale', label: 'Minerale' },
        { id: 'suplemente-bimore', label: 'Suplemente bimore' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
      healthMonitors: [
        { id: 'peshore', label: 'Peshore' },
        { id: 'aparat-tensioni', label: 'Aparat tensioni' },
        { id: 'termometer', label: 'Termometer' },
        { id: 'monitorues-te-diabetit', label: 'Monitorues te diabetit' },
        { id: 'oksimeter', label: 'Oksimeter' },
        { id: 'paisje-ortopedike', label: 'Paisje ortopedike' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
      productTypes: [
        { id: 'lares-vajor', label: 'Lares vajor' },
        { id: 'lares-ujor', label: 'Lares ujor' },
        { id: 'toner', label: 'Toner' },
        { id: 'exfoliant', label: 'Exfoliant' },
        { id: 'serume', label: 'Serume' },
        { id: 'krem-per-syte', label: 'Krem per syte' },
        { id: 'vitamin-c-antioxidant', label: 'Vitamin C/antioxidant' },
        { id: 'hidratues', label: 'Hidratues' },
        { id: 'retinol', label: 'Retinol' },
        { id: 'spf', label: 'SPF' },
        { id: 'eye-patches', label: 'Eye patches' },
        { id: 'acne-patches', label: 'Acne patches' },
        { id: 'maske-fytyre', label: 'Maske fytyre' },
        { id: 'spot-treatment', label: 'Spot treatment' },
        { id: 'uje-termal', label: 'Uje termal' },
        { id: 'peeling-pads', label: 'Peeling Pads' },
        { id: 'lipbalm', label: 'Lipbalm' },
        { id: 'set-me-produkte', label: 'Set me produkte' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
      sets: [
        { id: 'set-per-fytyren', label: 'Set per fytyren' },
        { id: 'set-per-trupin', label: 'Set per trupin' },
        { id: 'set-per-floket', label: 'set per floket' },
        { id: 'set-per-nena', label: 'Set per nena' },
        { id: 'set-per-femije', label: 'Set per femije' },
      ].map(opt => ({ ...opt, count: counts[opt.id] || 0 })),
    };
  }, [normalizedMedicines, normalizeText]); // Depend on normalizedMedicines instead of allMedicines

  // Handle filter toggles
  const toggleFilter = useCallback((filterType, id) => {
    // ... no changes to toggleFilter logic ...
    if (filterType === 'problem') {
      setSelectedProblems(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'skinType') {
      setSelectedSkinTypes(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'productType') {
      setSelectedProductTypes(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'bodyHair') {
      setSelectedBodyHair(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'hygiene') {
      setSelectedHygiene(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'motherChild') {
      setSelectedMotherChild(prev => {
        // Handle mutual exclusivity for aksesore options
        if (id === 'aksesore-nene' && !prev.includes(id)) {
          // Selecting aksesore-nene, deselect aksesorefemije if it's selected
          return [...prev.filter(f => f !== 'aksesorefemije'), id];
        } else if (id === 'aksesorefemije' && !prev.includes(id)) {
          // Selecting aksesorefemije, deselect aksesorenene if it's selected
          return [...prev.filter(f => f !== 'aksesore-nene'), id];
        } else {
          // Normal toggle behavior
          return prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
        }
      });
    } else if (filterType === 'supplements') {
      setSelectedSupplements(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'healthMonitors') {
      setSelectedHealthMonitors(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'sets') {
      setSelectedSets(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    }
    setCurrentPage(1);
  }, []);

  // ... (No changes to handlers) ...

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
    // Scroll to top when items per page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
    // Scroll to top when sort changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);





  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');
  const searchParam = searchParams.get('search');
  const skinProblemParam = searchParams.get('skinProblem');
  const pageParam = searchParams.get('page'); // Add this

  // Sync state with URL search
  React.useEffect(() => {
    setSearchTerm(searchParam || '');

    // Sync page from URL
    if (pageParam) {
      const page = parseInt(pageParam);
      if (!isNaN(page) && page > 0 && page !== currentPage) {
        setCurrentPage(page);
      }
    } else if (currentPage !== 1 && !pageParam) {
      // If URL has no page param but state is not 1, reset to 1 (e.g. cleared filters)
      // BUT: be careful not to reset if we just navigated to the page. 
      // This logic is tricky. Simplest is: if URL has no page, page is 1.
      setCurrentPage(1);
    }
  }, [searchParam, pageParam]); // Listen to pageParam

  // Prevent body scroll when mobile filters are open
  React.useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showFilters]);

  // Filter and sort medicines
  const filteredAndSortedMedicines = useMemo(() => {
    let filtered = [...normalizedMedicines];

    // 0. Skin Problem Filter (Strict but with fallback for hyphenated URLs)
    if (skinProblemParam) {
      const normalizedParam = skinProblemParam.toLowerCase().replace(/-/g, '');
      filtered = filtered.filter(item => {
        const prob = item.skinProblem?.toLowerCase().replace(/-/g, '') || '';
        return prob === normalizedParam; // Use original item.skinProblem as fallback, or rely on normalization if we want to be strict
      });
    }

    // 1. URL Category Filter
    if (categoryParam) {
      // Handle slug-to-name matching safely
      const normalizedCatParam = categoryParam.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter(item =>
        item.norm.categoryName.includes(normalizedCatParam) ||
        // Fallback: check if the slug matches roughly
        item.norm.categoryName.replace(/\s+/g, '-').includes(categoryParam)
      );
    }

    // 2. URL Subcategory Filter (Also matches options)
    if (subcategoryParam) {
      const normalizedSubParam = normalizeText(subcategoryParam);

      filtered = filtered.filter(item => {
        // Special handling for aksesore URL parameters to handle context
        if (normalizedSubParam === 'aksesorenene') {
          return item.norm.isAksesoreNene;
        }

        if (normalizedSubParam === 'aksesorefemije') {
          return item.norm.isAksesoreFemije;
        }

        // SYSTEMIC MATCHING:
        // We look for the parameter anywhere in the product's classification tree
        const matchesAnywhere =
          item.norm.subcategory.includes(normalizedSubParam) ||
          item.norm.option.includes(normalizedSubParam) ||
          item.norm.options.some(o => o.includes(normalizedSubParam)) ||
          item.norm.optSlugs.has(normalizedSubParam) ||
          Array.from(item.norm.optSlugs).some(slug => slug.includes(normalizedSubParam)) ||
          item.norm.productType.includes(normalizedSubParam) ||
          item.norm.categoryName.includes(normalizedSubParam) ||
          item.norm.bestsellerCategory.includes(normalizedSubParam) ||
          item.norm.itemName.includes(normalizedSubParam);

        return matchesAnywhere;
      });
    }

    // 3. Search Term (Local State)
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.norm.itemName.includes(searchTerm.toLowerCase()) ||
          medicine.norm.company.includes(searchTerm.toLowerCase()) ||
          medicine.norm.genericName.includes(searchTerm.toLowerCase()) ||
          medicine.norm.categoryName.includes(searchTerm.toLowerCase())
      );
    }

    // 4. Sidebar Checkbox Filters
    // Helper to check if item matches any selected filter in a group
    const matchesFilter = (selectedFilters, item) => {
      if (selectedFilters.length === 0) return true;

      return selectedFilters.some(filterId => {
        const normalizedFilter = normalizeText(filterId);

        // Special handling for aksesore filters to handle context
        if (normalizedFilter === 'aksesorenene') {
          return item.norm.isAksesoreNene;
        }

        if (normalizedFilter === 'aksesorefemije') {
          return item.norm.isAksesoreFemije;
        }

        // We use .includes for maximum discovery cross-compatibility
        // but normalize both sides to ensure slugs like 'lekure-normale' match 'Lekure normale'
        return item.norm.subcategory.includes(normalizedFilter) ||
          item.norm.option.includes(normalizedFilter) ||
          item.norm.options.some(opt => opt.includes(normalizedFilter)) ||
          item.norm.optSlugs.has(normalizedFilter) ||
          Array.from(item.norm.optSlugs).some(slug => slug.includes(normalizedFilter)) ||
          item.norm.productType.includes(normalizedFilter) ||
          item.norm.categoryName.includes(normalizedFilter) ||
          item.norm.bestsellerCategory.includes(normalizedFilter);
      });
    };

    if (selectedProblems.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedProblems, item));
    }
    if (selectedSkinTypes.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedSkinTypes, item));
    }
    if (selectedProductTypes.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedProductTypes, item));
    }
    if (selectedBodyHair.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedBodyHair, item));
    }
    if (selectedHygiene.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedHygiene, item));
    }
    if (selectedMotherChild.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedMotherChild, item));
    }

    if (selectedSupplements.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedSupplements, item));
    }
    if (selectedHealthMonitors.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedHealthMonitors, item));
    }
    if (selectedSets.length > 0) {
      filtered = filtered.filter(item => matchesFilter(selectedSets, item));
    }



    // Sort
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.itemName?.localeCompare(b.itemName) || 0);
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => {
        return (Number(a.price) * (1 - (Number(a.discount) || 0) / 100)) - (Number(b.price) * (1 - (Number(b.discount) || 0) / 100));
      });
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => {
        return (Number(b.price) * (1 - (Number(b.discount) || 0) / 100)) - (Number(a.price) * (1 - (Number(a.discount) || 0) / 100));
      });
    }

    return filtered;
  }, [normalizedMedicines, searchTerm, sortBy, categoryParam, subcategoryParam, selectedProblems, selectedSkinTypes, selectedProductTypes, selectedBodyHair, selectedHygiene, selectedMotherChild, selectedSupplements, selectedHealthMonitors, selectedSets, normalizeText, optionToSlugMap]);

  // Update pagination values with filtered data
  const totalFilteredItems = filteredAndSortedMedicines.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedMedicines.slice(startIndex, endIndex);
  }, [filteredAndSortedMedicines, currentPage, itemsPerPage]);

  // Handle page change
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);


  // Determine SEO title/description based on active filters
  const seoDetails = (() => {
    let title = "Produktet | Farmacia Shila";
    let description = "Eksploroni gamën tonë të gjerë të produkteve farmaceutike dhe kozmetike.";

    if (subcategoryParam) {
      const displaySub = subcategoryParam.replace(/-/g, ' ');
      title = `${displaySub.charAt(0).toUpperCase() + displaySub.slice(1)} | Farmacia Shila`;
    }

    return { title, description };
  })();

  const subcategoryName = subcategoryParam ? subcategoryParam.replace(/-/g, ' ').charAt(0).toUpperCase() + subcategoryParam.replace(/-/g, ' ').slice(1) : null;

  // Generate pagination URL helper
  const generatePaginationUrl = (page) => {
    const baseUrl = 'https://www.farmaciashila.com';

    if (subcategoryParam) {
      const canonicalUrl = `${baseUrl}/category/${subcategoryParam}`;
      return page > 1 ? `${canonicalUrl}?page=${page}` : canonicalUrl;
    } else if (searchTerm) {
      const searchUrl = `${baseUrl}/shop?search=${encodeURIComponent(searchTerm)}`;
      return page > 1 ? `${searchUrl}&page=${page}` : searchUrl;
    } else if (categoryParam) {
      const categoryUrl = `${baseUrl}/shop?category=${encodeURIComponent(categoryParam)}`;
      return page > 1 ? `${categoryUrl}&page=${page}` : categoryUrl;
    } else {
      return page > 1 ? `${baseUrl}/shop?page=${page}` : `${baseUrl}/shop`;
    }
  };
  const generateCanonicalUrl = () => {
    const baseUrl = 'https://www.farmaciashila.com';

    if (subcategoryParam) {
      // For subcategory pages, use clean URL format regardless of other parameters
      // Include pagination if beyond page 1
      const canonicalUrl = `${baseUrl}/category/${subcategoryParam}`;
      return currentPage > 1 ? `${canonicalUrl}?page=${currentPage}` : canonicalUrl;
    } else if (searchTerm) {
      // For search pages, use search URL (unique content)
      const searchUrl = `${baseUrl}/shop?search=${encodeURIComponent(searchTerm)}`;
      return currentPage > 1 ? `${searchUrl}&page=${currentPage}` : searchUrl;
    } else if (categoryParam) {
      // For category pages, canonicalize to subcategory if present, otherwise category
      const categoryUrl = `${baseUrl}/shop?category=${encodeURIComponent(categoryParam)}`;
      return currentPage > 1 ? `${categoryUrl}&page=${currentPage}` : categoryUrl;
    } else {
      // For main shop page with no specific parameters
      return currentPage > 1 ? `${baseUrl}/shop?page=${currentPage}` : `${baseUrl}/shop`;
    }
  };

  // Determine if page should be noindexed (filter combinations create thin content)
  const shouldNoindex = () => {
    // Always noindex filter combinations (multiple active filters)
    const activeFilters = [
      selectedProblems.length,
      selectedSkinTypes.length,
      selectedProductTypes.length,
      selectedBodyHair.length,
      selectedHygiene.length,
      selectedMotherChild.length,
      selectedSupplements.length,
      selectedHealthMonitors.length,
      selectedSets.length
    ].reduce((sum, count) => sum + count, 0);

    // Noindex if:
    // 1. Multiple active filters (creates thin content)
    // 2. Category + subcategory combinations (these should canonicalize to subcategory)
    // 3. Any filters on search pages (search results are unique enough)
    const hasCategoryAndSubcategory = categoryParam && subcategoryParam;
    const hasFiltersOnSearch = searchTerm && activeFilters > 0;

    return activeFilters > 1 || hasCategoryAndSubcategory || hasFiltersOnSearch;
  };

  // if (isLoading) return <DataLoading label="Medicines" />;
  if (error) {
    return (
      <div className="min-h-[80vh] pt-20 lg:pt-[84px] pb-4 sm:pt-24 sm:pb-8 bg-white relative overflow-x-hidden">
        <div className="max-w-full mx-auto px-4 md:px-4 lg:px-6 relative">
          <div className="text-center py-12">
            <LoadingError label="Medicines" />
            <div className="mt-6 space-y-4">
              <p className="text-gray-600 text-sm">
                Having trouble loading products? This might be a device-specific issue.
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-[#A67856] text-white rounded-lg hover:bg-[#8B6345] transition-colors"
              >
                Try Again
              </button>
              <div className="text-xs text-gray-500 mt-4">
                Debug info: Check browser console for details
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {subcategoryParam ? (
        <CategorySEO
          categoryName={subcategoryName}
          description={seoDetails.description}
          products={filteredAndSortedMedicines}
          canonicalUrl={generateCanonicalUrl()}
          noindex={shouldNoindex()}
          currentPage={currentPage}
          totalPages={Math.ceil(totalFilteredItems / itemsPerPage)}
        />
      ) : (
        <Helmet key={location.pathname}>
          <title>{seoDetails.title}</title>
          <meta name="description" content={seoDetails.description} />
          <link rel="canonical" href={generateCanonicalUrl()} />
          {shouldNoindex() && <meta name="robots" content="noindex, follow" />}

          {/* Pagination links to prevent alternate page issues */}
          {currentPage > 1 && (
            <link rel="prev" href={generatePaginationUrl(currentPage - 1)} />
          )}
          {currentPage < Math.ceil(totalFilteredItems / itemsPerPage) && (
            <link rel="next" href={generatePaginationUrl(currentPage + 1)} />
          )}

          {/* Additional meta tags to prevent alternate page issues */}
          <meta name="googlebot" content={shouldNoindex() ? "noindex, follow" : "index, follow"} />
          <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
          <meta httpEquiv="content-language" content="sq" />
        </Helmet>
      )}
      <section className="min-h-[80vh] pt-20 lg:pt-[84px] pb-4 sm:pt-24 sm:pb-8 bg-white relative overflow-x-hidden">
        <div className="max-w-full mx-auto px-4 md:px-4 lg:px-6 relative">
          <Breadcrumbs
            paths={[
              { name: 'Shop', url: '/shop' },
              ...(subcategoryParam ? [{ name: subcategoryParam.replace(/-/g, ' ').charAt(0).toUpperCase() + subcategoryParam.replace(/-/g, ' ').slice(1), url: `/shop?subcategory=${subcategoryParam}` }] : []),
              ...(searchTerm ? [{ name: `Kërkimi: ${searchTerm}`, url: `/shop?search=${searchTerm}` }] : [])
            ]}
          />
          {/* Header */}
          <div className="mb-4 sm:mb-6 text-center space-y-3">
            <p className="lux-heading">Koleksioni</p>
            <h1 className="lux-title text-gray-700 mb-0">Produktet</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar - Filters */}
            {/* Mobile Filter Overlay */}
            {showFilters && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-[10001] lg:hidden transition-opacity duration-300 ease-in-out opacity-100"
                  onClick={() => setShowFilters(false)}
                />
                <div className="fixed inset-0 z-[10000] lg:hidden" style={{ overflow: 'hidden' }} />
              </>
            )}

            <aside
              className={`${showFilters
                ? 'fixed inset-y-0 left-0 w-80 translate-x-0 z-[10002]'
                : 'fixed inset-y-0 left-0 w-80 -translate-x-full z-[10002] pointer-events-none'
                } lg:static lg:w-72 lg:translate-x-0 lg:z-auto lg:pointer-events-auto transition-transform duration-300 ease-in-out lg:transition-none overflow-hidden lg:overflow-visible flex-shrink-0`}
            >
              <div className="bg-white h-full flex flex-col lg:sticky lg:top-20 pointer-events-auto h-[100vh] lg:h-auto max-h-[100vh] lg:max-h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-y-auto">
                <div className="p-6 flex-1" data-lenis-prevent>
                  {/* Desktop Title */}
                  <div className="hidden lg:block mb-4">
                    <h2 className="text-lg font-semibold text-[#A67856] uppercase tracking-wide">Filters</h2>
                  </div>



                  {/* Mobile Close Button */}
                  <div className="flex items-center justify-between mb-4 lg:hidden">
                    <h2 className="text-lg font-semibold text-[#A67856] uppercase tracking-wide">Filters</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      aria-label="Close filters"
                    >
                      <X size={20} className="text-gray-600" />
                    </button>
                  </div>
                  {/* Sort By */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Klasifiko sipas</h3>
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full px-3 py-2 border-2 border-[#D9BFA9] text-sm focus:outline-none focus:ring-2 focus:ring-[#A67856] focus:border-[#A67856] bg-white text-[#4A3628]"
                    >
                      <option value="alphabetical">Alphabetically, A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Problematika */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('problematica')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Problematika</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-100 ease-in-out ${expandedCategories.problematica ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-100 ease-in-out ${expandedCategories.problematica ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.problematica.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedProblems.includes(option.id)}
                                onChange={() => toggleFilter('problem', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tipi i lëkurës */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('skinTypes')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Tipi i lëkurës</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.skinTypes ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.skinTypes ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.skinTypes.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedSkinTypes.includes(option.id)}
                                onChange={() => toggleFilter('skinType', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Lloji i produktit */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('productTypes')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Lloji i produktit</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.productTypes ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.productTypes ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.productTypes.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedProductTypes.includes(option.id)}
                                onChange={() => toggleFilter('productType', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Trupin & Flokë */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('bodyHair')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Trupin & Flokë</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.bodyHair ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.bodyHair ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.bodyHair.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedBodyHair.includes(option.id)}
                                onChange={() => toggleFilter('bodyHair', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Higjene */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('hygiene')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Higjene</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.hygiene ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.hygiene ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.hygiene.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedHygiene.includes(option.id)}
                                onChange={() => toggleFilter('hygiene', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nena & Fëmijë */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('motherChild')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Nena & Fëmijë</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.motherChild ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.motherChild ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.motherChild.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type={option.id === 'aksesore-nene' || option.id === 'aksesorefemije' ? 'radio' : 'checkbox'}
                                name="aksesore-group"
                                checked={selectedMotherChild.includes(option.id)}
                                onChange={() => toggleFilter('motherChild', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>



                  {/* Suplemente & Vitamina */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('supplements')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Suplemente & Vitamina</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.supplements ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.supplements ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.supplements.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedSupplements.includes(option.id)}
                                onChange={() => toggleFilter('supplements', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Monitoruesit e Shëndetit */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('healthMonitors')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Monitoruesit e Shëndetit</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.healthMonitors ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.healthMonitors ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.healthMonitors.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedHealthMonitors.includes(option.id)}
                                onChange={() => toggleFilter('healthMonitors', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Set */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleCategory('sets')}
                      className="w-full flex items-center justify-between text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide hover:text-[#8B6345] transition-colors"
                    >
                      <span>Set</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.sets ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.sets ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.sets.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1 transition-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedSets.includes(option.id)}
                                onChange={() => toggleFilter('sets', option.id)}
                                className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                              />
                              <span className="text-sm text-[#A67856]">{option.label}</span>
                            </div>
                            <span className="text-xs text-gray-500">{option.count}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Filter Button - Mobile Only */}
              <div className="mb-6 sm:mb-8 flex justify-center lg:justify-start">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto px-4 py-3 border border-[#D9BFA9] bg-[#A67856] text-white hover:bg-[#8B6345] lg:hidden flex items-center justify-center gap-2 text-sm font-medium rounded-sm"
                  title="Toggle filters"
                  aria-label="Toggle filters"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filtro dhe rendit</span>
                </button>
              </div>

              {/* Products */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-full max-w-full lg:max-w-none">
                  {(isLoading) ? (
                    <ShopGrid
                      paginatedMedicines={[]}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      goToPage={goToPage}
                      handleItemsPerPageChange={handleItemsPerPageChange}
                      isLoading={true}
                    />
                  ) : paginatedMedicines.length === 0 ? (
                    <div className="text-center py-12 bg-[#EBD8C8] border-2 border-[#D9BFA9]">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No products found' : 'No products available'}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm
                          ? `Try adjusting your search or filters.`
                          : 'Check back later for new products.'}
                      </p>
                    </div>
                  ) : (
                    <ShopGrid
                      paginatedMedicines={paginatedMedicines}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      goToPage={(page) => {
                        const params = new URLSearchParams(location.search);
                        if (page > 1) {
                          params.set('page', page);
                        } else {
                          params.delete('page');
                        }
                        // Use push to add to history
                        window.history.pushState({}, '', `/shop?${params.toString()}`);
                        // Update state and force re-render/fetch
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      handleItemsPerPageChange={handleItemsPerPageChange}
                      isLoading={isLoading}
                      onOpenVariantSidebar={(product) => {
                        setSelectedProductForVariant(product);
                        // Pre-select first variant if available
                        if (product.variants && product.variants.length > 0) {
                          setActiveVariantForSidebar(product.variants[0]);
                        } else {
                          setActiveVariantForSidebar(null);
                        }
                        setIsVariantSidebarOpen(true);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div >
      </section >

      <VariantSelectionSidebar
        isOpen={isVariantSidebarOpen}
        onClose={() => {
          setIsVariantSidebarOpen(false);
          setSelectedProductForVariant(null);
          setActiveVariantForSidebar(null);
        }}
        product={selectedProductForVariant}
        selectedVariant={activeVariantForSidebar}
        onSelectVariant={setActiveVariantForSidebar}
        onAddToCart={() => {
          if (selectedProductForVariant && activeVariantForSidebar) {
            const variantPrice = Number(activeVariantForSidebar.price);
            const variantDiscount = Number(activeVariantForSidebar.discount || 0);
            const discountedPrice = variantDiscount > 0
              ? (variantPrice * (1 - variantDiscount / 100)).toFixed(2)
              : null;

            addItem({
              id: activeVariantForSidebar._id, // Use variant ID as the product ID
              name: selectedProductForVariant.itemName,
              price: variantPrice,
              discountedPrice: discountedPrice,
              image: activeVariantForSidebar.image || selectedProductForVariant.image,
              company: selectedProductForVariant.company,
              genericName: selectedProductForVariant.genericName,
              discount: variantDiscount,
              seller: selectedProductForVariant.seller,
              size: activeVariantForSidebar.size,
              variantId: activeVariantForSidebar._id
            });
          }
          setIsVariantSidebarOpen(false);
        }}
      />
    </>
  );
};

export default Shop;
