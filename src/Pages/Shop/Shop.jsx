import React, { useState, useMemo, useCallback, useContext } from 'react';
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

const Shop = () => {
  const location = useLocation();
  const { addItem } = useContext(CartContext);
  const { publicApi } = useAxiosSecure();

  const onAddToCart = useCallback((product, quantity = 1, selectedVariant = null) => {
    addItem(product, quantity, selectedVariant);
  }, [addItem]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('alphabetical');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Hidden on mobile by default, visible on desktop

  // Get all medicines - Moved to top to be available for filterOptions
  // Use group=true to group variants together
  const { data, isLoading, error } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => publicApi.get('/medicines?group=true'),
    staleTime: 2 * 60 * 1000, // 2 minutes - will use default refetchOnMount
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

  // Variant Selection State
  const [isVariantSidebarOpen, setIsVariantSidebarOpen] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
  const [activeVariantForSidebar, setActiveVariantForSidebar] = useState(null);


  // Helper helper to normalize text for comparison
  const normalizeText = useCallback((text) => text ? text.toLowerCase().replace(/[^a-z0-9]/g, '') : '', []);

  // Calculate dynamic filter counts based on allMedicines
  const filterOptions = useMemo(() => {
    // Initial counts object
    const counts = {};

    // Initialize counts to 0
    const filterGroups = {
      problematica: ['akne', 'rrudha', 'hiperpigmentim', 'balancim-yndyre-pore-evidente', 'pika-te-zeza', 'dehidratim', 'skuqje', 'rozacea'],
      skinTypes: ['lekure-normale', 'lekure-e-yndyrshme', 'lekure-e-thate', 'lekure-mikes', 'lekure-sensitive'],
      bodyHair: ['lares-trupi', 'hidratues-trupi', 'scrub-trupi', 'akne-ne-trup', 'kujdesi-ndaj-diellit', 'deodorant', 'vaj-per-trupin', 'krem-per-duart-dhe-kembet', 'skalp-i-thate', 'skalp-i-yndyrshem', 'skalp-sensitive', 'renia-e-flokut'],
      hygiene: ['lares-intim', 'peceta-intime', 'furce-dhembesh', 'paste-dhembesh', 'fill-dentar-furca-interdentare'],
      motherChild: ['shtatezania', 'pas-lindjes', 'ushqyerja-me-gji', 'kujdesi-per-femijen'],
      supplements: ['vitamina', 'suplemente-per-shendetin', 'minerale', 'suplemente-bimore'],
      healthMonitors: ['peshore', 'aparat-tensioni', 'termometer', 'monitorues-te-diabetit', 'oksimeter', 'paisje-ortopedike'],
      productTypes: ['lares-vajor', 'lares-ujor', 'toner', 'exfoliant', 'serume', 'krem-per-syte', 'vitamin-c-antioxidant', 'hidratues', 'retinol', 'spf', 'eye-patches', 'acne-patches', 'maske-fytyre', 'spot-treatment', 'uje-termal', 'peeling-pads', 'lipbalm', 'set-me-produkte']
    };

    // Helper to check match (reused logic from matchesFilter but for counting)
    const checkMatch = (item, filterId) => {
      const normalizedFilter = normalizeText(filterId);
      const itemSub = normalizeText(item.subcategory);
      const itemOpt = normalizeText(item.option);
      const itemDesc = normalizeText(item.description);
      const itemType = normalizeText(item.bestsellerCategory);
      const itemProdType = normalizeText(item.productType);

      return itemSub.includes(normalizedFilter) ||
        itemOpt.includes(normalizedFilter) ||
        (itemDesc && itemDesc.includes(normalizedFilter)) ||
        itemType.includes(normalizedFilter) ||
        itemProdType.includes(normalizedFilter);
    };

    // Calculate actual counts
    allMedicines.forEach(item => {
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
        { id: 'lekure-normale', label: 'Lëkurë normale' },
        { id: 'lekure-e-yndyrshme', label: 'Lëkurë e yndyrshme' },
        { id: 'lekure-e-thate', label: 'Lëkurë e thate' },
        { id: 'lekure-mikes', label: 'Lëkurë mikes' },
        { id: 'lekure-sensitive', label: 'Lëkurë sensitive' },
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
        { id: 'skalp-i-thate', label: 'Skalp i thate' },
        { id: 'skalp-i-yndyrshem', label: 'Skalp i yndyrshem' },
        { id: 'skalp-sensitive', label: 'Skalp sensitive' },
        { id: 'renia-e-flokut', label: 'Renia e flokut' },
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
        { id: 'kujdesi-per-femijen', label: 'Kujdesi per femijen' },
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
    };
  }, [allMedicines, normalizeText]);

  // Handle filter toggles
  const toggleFilter = useCallback((filterType, id) => {
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
      setSelectedMotherChild(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'supplements') {
      setSelectedSupplements(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    } else if (filterType === 'healthMonitors') {
      setSelectedHealthMonitors(prev =>
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    }
    setCurrentPage(1);
  }, []);

  // Handle search
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Handle page change
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, []);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  }, []);




  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');
  const searchParam = searchParams.get('search');
  const skinProblemParam = searchParams.get('skinProblem');

  // Sync state with URL search
  React.useEffect(() => {
    setSearchTerm(searchParam || '');
  }, [searchParam]);

  // Filter and sort medicines
  const filteredAndSortedMedicines = useMemo(() => {
    let filtered = [...allMedicines];

    // 0. Skin Problem Filter (Strict)
    if (skinProblemParam) {
      filtered = filtered.filter(item =>
        item.skinProblem?.toLowerCase() === skinProblemParam.toLowerCase()
      );
    }

    // 1. URL Category Filter
    if (categoryParam) {
      // Handle slug-to-name matching safely
      const normalizedCatParam = categoryParam.toLowerCase().replace(/-/g, ' ');
      filtered = filtered.filter(item =>
        item.categoryName?.toLowerCase().includes(normalizedCatParam) ||
        // Fallback: check if the slug matches roughly
        item.categoryName?.toLowerCase().replace(/\s+/g, '-').includes(categoryParam)
      );
    }

    // 2. URL Subcategory Filter
    if (subcategoryParam) {
      // Create a map of slugs to exact DB strings if needed, or use broad matching
      const normalizedSubParam = subcategoryParam.toLowerCase().replace(/-/g, ' ');

      filtered = filtered.filter(item => {
        // Check against subcategory, option fields
        const sub = item.subcategory?.toLowerCase() || '';
        const opt = item.option?.toLowerCase() || '';
        const type = item.bestsellerCategory?.toLowerCase() || ''; // sometimes used for grouping

        // Try matching against various product fields
        return sub.includes(normalizedSubParam) ||
          opt.includes(normalizedSubParam) ||
          opt.replace(/\s+/g, '-').includes(subcategoryParam) ||
          type.includes(normalizedSubParam);
      });
    }

    // 3. Search Term (Local State)
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 4. Sidebar Checkbox Filters
    const normalizeText = (text) => text ? text.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

    // Helper to check if item matches any selected filter in a group
    const matchesFilter = (selectedFilters, item) => {
      if (selectedFilters.length === 0) return true;
      const itemSub = normalizeText(item.subcategory);
      const itemOpt = normalizeText(item.option);
      const itemDesc = normalizeText(item.description);
      const itemType = normalizeText(item.bestsellerCategory); // fallback
      const itemProdType = normalizeText(item.productType);

      return selectedFilters.some(filterId => {
        const normalizedFilter = normalizeText(filterId); // e.g., 'akne', 'lekurenormale'

        // Exact-ish match preference, but loose check for description/multiple tags
        return itemSub.includes(normalizedFilter) ||
          itemOpt.includes(normalizedFilter) ||
          (itemDesc && itemDesc.includes(normalizedFilter)) ||
          itemType.includes(normalizedFilter) ||
          itemProdType.includes(normalizedFilter);
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



    // Sort
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.itemName?.localeCompare(b.itemName) || 0);
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => {
        const priceA = Number(a.price) * (1 - Number(a.discount) / 0); // Fix potential division by zero if discount logic changes, but standard is (1 - discount/100)
        return (Number(a.price) * (1 - (Number(a.discount) || 0) / 100)) - (Number(b.price) * (1 - (Number(b.discount) || 0) / 100));
      });
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => {
        return (Number(b.price) * (1 - (Number(b.discount) || 0) / 100)) - (Number(a.price) * (1 - (Number(a.discount) || 0) / 100));
      });
    }

    return filtered;
  }, [allMedicines, searchTerm, sortBy, categoryParam, subcategoryParam, selectedProblems, selectedSkinTypes, selectedProductTypes, selectedBodyHair, selectedHygiene, selectedMotherChild, selectedSupplements, selectedHealthMonitors]);

  // Pagination
  const totalFilteredItems = filteredAndSortedMedicines.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedMedicines.slice(startIndex, endIndex);
  }, [filteredAndSortedMedicines, currentPage, itemsPerPage]);


  if (isLoading) return <DataLoading label="Medicines" />;
  if (error) return <LoadingError label="Medicines" />;

  return (
    <>
      <Helmet key={location.pathname}>
        <title>Shop</title>
      </Helmet>
      <section className="min-h-[80vh] pt-20 lg:pt-[84px] pb-4 sm:pt-24 sm:pb-8 bg-white relative overflow-x-hidden">
        <div className="max-w-full mx-auto px-4 md:px-4 lg:px-6 relative">
          {/* Header */}
          <div className="mb-4 sm:mb-6 text-center space-y-3">
            <p className="lux-heading">Koleksioni</p>
            <h1 className="lux-title text-gray-700 mb-0">Produktet</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar - Filters */}
            {/* Mobile Filter Overlay */}
            {showFilters && (
              <div
                className="fixed inset-0 bg-black/50 z-[10001] lg:hidden transition-opacity duration-300 ease-in-out opacity-100"
                onClick={() => setShowFilters(false)}
              />
            )}

            <aside
              className={`${showFilters
                ? 'fixed inset-y-0 left-0 w-80 translate-x-0 z-[10002]'
                : 'fixed inset-y-0 left-0 w-80 -translate-x-full z-[10002] pointer-events-none'
                } lg:static lg:w-72 lg:translate-x-0 lg:z-auto lg:pointer-events-auto transition-transform duration-300 ease-in-out lg:transition-none overflow-hidden flex-shrink-0`}
            >
              <div className="bg-white h-full flex flex-col lg:sticky lg:top-20 pointer-events-auto" style={{ maxHeight: '100vh', overflow: 'hidden' }}>
                <div className="p-6 overflow-y-auto flex-1" data-lenis-prevent>
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
                        className={`text-[#A67856] transition-transform duration-300 ease-in-out ${expandedCategories.problematica ? 'rotate-180' : 'rotate-0'
                          }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.problematica ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.problematica.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
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
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.skinTypes ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.skinTypes.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
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
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.productTypes ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.productTypes.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
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
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.bodyHair ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.bodyHair.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
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
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.hygiene ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.hygiene.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
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
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.motherChild ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.motherChild.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
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
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories.supplements ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="space-y-2 pt-1">
                        {filterOptions.supplements.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
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
                            className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
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
                  {paginatedMedicines.length === 0 ? (
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
                      goToPage={goToPage}
                      handleItemsPerPageChange={handleItemsPerPageChange}
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
        </div>
      </section>

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
