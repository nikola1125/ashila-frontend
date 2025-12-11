import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import LoadingError from '../../Components/Common/States/LoadingError';
import { Search, X, Filter } from 'lucide-react';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import ShopGrid from '../../Components/Grid/ShopGrid';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Shop = () => {
  const location = useLocation();
  const { publicApi } = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('alphabetical');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); // Hidden on mobile by default, visible on desktop

  // Filter states
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [selectedBodyHair, setSelectedBodyHair] = useState([]);
  const [selectedHygiene, setSelectedHygiene] = useState([]);
  const [selectedMotherChild, setSelectedMotherChild] = useState([]);
  const [selectedSexualHealth, setSelectedSexualHealth] = useState([]);
  const [selectedSupplements, setSelectedSupplements] = useState([]);
  const [selectedHealthMonitors, setSelectedHealthMonitors] = useState([]);

  // Filter options based on navbar subcategories
  const filterOptions = {
    problematica: [
      { id: 'akne', label: 'Akne', count: 0 },
      { id: 'rrudha', label: 'Rrudha', count: 0 },
      { id: 'hiperpigmentim', label: 'Hiperpigmentim', count: 0 },
      { id: 'balancim-yndyre-pore-evidente', label: 'Balancim yndyre/pore evidente', count: 0 },
      { id: 'pika-te-zeza', label: 'Pikat e zeza', count: 0 },
      { id: 'dehidratim', label: 'Dehidratim', count: 0 },
      { id: 'skuqje', label: 'Skuqje', count: 0 },
      { id: 'rozacea', label: 'Rozacea', count: 0 },
    ],
    skinTypes: [
      { id: 'lekure-normale', label: 'Lëkurë normale', count: 0 },
      { id: 'lekure-e-yndyrshme', label: 'Lëkurë e yndyrshme', count: 0 },
      { id: 'lekure-e-thate', label: 'Lëkurë e thate', count: 0 },
      { id: 'lekure-mikes', label: 'Lëkurë mikes', count: 0 },
      { id: 'lekure-sensitive', label: 'Lëkurë sensitive', count: 0 },
    ],
    bodyHair: [
      { id: 'lares-trupi', label: 'Larës trupi', count: 0 },
      { id: 'hidratues-trupi', label: 'Hidratues trupi', count: 0 },
      { id: 'scrub-trupi', label: 'Scrub trupi', count: 0 },
      { id: 'akne-ne-trup', label: 'Akne ne trup', count: 0 },
      { id: 'kujdesi-ndaj-diellit', label: 'Kujdesi ndaj diellit', count: 0 },
      { id: 'deodorant', label: 'Deodorant', count: 0 },
      { id: 'vaj-per-trupin', label: 'Vaj per trupin', count: 0 },
      { id: 'krem-per-duart-dhe-kembet', label: 'Krem per duart & kembet', count: 0 },
      { id: 'skalp-i-thate', label: 'Skalp i thate', count: 0 },
      { id: 'skalp-i-yndyrshem', label: 'Skalp i yndyrshem', count: 0 },
      { id: 'skalp-sensitive', label: 'Skalp sensitive', count: 0 },
      { id: 'renia-e-flokut', label: 'Renia e flokut', count: 0 },
    ],
    hygiene: [
      { id: 'lares-intim', label: 'Larës intim', count: 0 },
      { id: 'peceta-intime', label: 'Peceta', count: 0 },
      { id: 'furce-dhembesh', label: 'Furce dhembesh', count: 0 },
      { id: 'paste-dhembesh', label: 'Paste dhembesh', count: 0 },
      { id: 'fill-dentar-furca-interdentare', label: 'Fill dentar/furca interdentare', count: 0 },
    ],
    motherChild: [
      { id: 'shtatezania', label: 'Shtatezania', count: 0 },
      { id: 'pas-lindjes', label: 'Pas lindjes', count: 0 },
      { id: 'ushqyerja-me-gji', label: 'Ushqyerja me gji', count: 0 },
      { id: 'kujdesi-per-femijen', label: 'Kujdesi per femijen', count: 0 },
    ],
    sexualHealth: [
      { id: 'perzervativ', label: 'Perzervativ', count: 0 },
      { id: 'lubrifikante', label: 'Lubrifikante', count: 0 },
      { id: 'test-shtatezanie-fertiliteti', label: 'Test shtatezanie/fertiliteti', count: 0 },
    ],
    supplements: [
      { id: 'vitamina', label: 'Vitamina', count: 0 },
      { id: 'suplemente-per-shendetin', label: 'Suplemente per shendetin', count: 0 },
      { id: 'minerale', label: 'Minerale', count: 0 },
      { id: 'suplemente-bimore', label: 'Suplemente bimore', count: 0 },
    ],
    healthMonitors: [
      { id: 'peshore', label: 'Peshore', count: 0 },
      { id: 'aparat-tensioni', label: 'Aparat tensioni', count: 0 },
      { id: 'termometer', label: 'Termometer', count: 0 },
      { id: 'monitorues-te-diabetit', label: 'Monitorues te diabetit', count: 0 },
      { id: 'oksimeter', label: 'Oksimeter', count: 0 },
      { id: 'paisje-ortopedike', label: 'Paisje ortopedike', count: 0 },
    ],
    productTypes: [
      { id: 'acide', label: 'Acide', count: 0 },
      { id: 'acne-patches', label: 'Acne patches', count: 0 },
      { id: 'eye-patches', label: 'Eye patches', count: 0 },
      { id: 'hidratues', label: 'Hidratues', count: 0 },
      { id: 'krem-dielli', label: 'Krem dielli', count: 0 },
      { id: 'krem-sysh', label: 'Krem sysh', count: 0 },
      { id: 'lare-ujor', label: 'Larës ujor', count: 0 },
      { id: 'lare-vajor', label: 'Larës vajor', count: 0 },
      { id: 'lipbalm', label: 'Lipbalm', count: 0 },
      { id: 'maske', label: 'Maskë', count: 0 },
      { id: 'retinoide', label: 'Retinoide', count: 0 },
      { id: 'serum', label: 'Serum', count: 0 },
      { id: 'set-produkte', label: 'Set me produkte', count: 0 },
      { id: 'shampo-flokesh', label: 'Shampo flokësh', count: 0 },
      { id: 'spot-treatment', label: 'Spot treatment', count: 0 },
    ],
  };

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
    } else if (filterType === 'sexualHealth') {
      setSelectedSexualHealth(prev =>
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

  // Get all medicines
  const { data, isLoading, error } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => publicApi.get('/medicines'),
    staleTime: 5 * 60 * 1000,
  });

  const allMedicines = data?.result || [];

  // Filter and sort medicines
  const filteredAndSortedMedicines = useMemo(() => {
    let filtered = [...allMedicines];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters (mock - in real app, these would filter based on product metadata)
    // For now, we'll just return all products that match search

    // Sort
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.itemName?.localeCompare(b.itemName) || 0);
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => {
        const priceA = Number(a.price) * (1 - Number(a.discount) / 100);
        const priceB = Number(b.price) * (1 - Number(b.discount) / 100);
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => {
        const priceA = Number(a.price) * (1 - Number(a.discount) / 100);
        const priceB = Number(b.price) * (1 - Number(b.discount) / 100);
        return priceB - priceA;
      });
    }

    return filtered;
  }, [allMedicines, searchTerm, sortBy, selectedProblems, selectedSkinTypes, selectedProductTypes, selectedBodyHair, selectedHygiene, selectedMotherChild, selectedSexualHealth, selectedSupplements, selectedHealthMonitors]);

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
      <section className="min-h-[80vh] pt-24 pb-4 sm:pt-24 sm:pb-8 bg-white">
        <div className="max-w-full mx-auto px-4 md:px-4 lg:px-6">
          {/* Header */}
          <div className="mb-8 sm:mb-12 text-center space-y-3">
            <p className="lux-heading">Koleksioni</p>
            <h1 className="lux-title text-gray-700 mb-0">Produktet</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar - Filters */}
            {/* Mobile Filter Overlay */}
            {showFilters && (
              <div 
                className={`fixed inset-0 bg-black/50 z-[10001] lg:hidden transition-opacity duration-300 ${
                  showFilters ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => setShowFilters(false)}
              />
            )}
            
            <aside className={`${
              showFilters 
                ? 'fixed lg:relative inset-y-0 left-0 lg:inset-auto w-80 lg:w-72 z-[10002] lg:z-auto translate-x-0' 
                : 'hidden lg:block lg:w-72 -translate-x-full lg:translate-x-0'
            } transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0`}>
              <div className="bg-white h-full flex flex-col lg:sticky lg:top-20">
                <div className="p-6 overflow-y-auto flex-1">
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
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Problematika</h3>
                    <div className="space-y-2">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tipi i lëkurës */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Tipi i lëkurës</h3>
                    <div className="space-y-2">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lloji i produktit */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Lloji i produktit</h3>
                    <div className="space-y-2">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Trupin & Flokë */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Trupin & Flokë</h3>
                    <div className="space-y-2">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Higjene */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Higjene</h3>
                    <div className="space-y-2">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Nena & Fëmijë */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Nena & Fëmijë</h3>
                    <div className="space-y-2">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Shendeti Seksual */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Shendeti Seksual</h3>
                    <div className="space-y-2">
                      {filterOptions.sexualHealth.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center justify-between cursor-pointer hover:bg-[#EBD8C8] p-1"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSexualHealth.includes(option.id)}
                              onChange={() => toggleFilter('sexualHealth', option.id)}
                              className="w-4 h-4 text-[#A67856] border-2 border-[#A67856] focus:ring-[#A67856]"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Suplemente & Vitamina */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Suplemente & Vitamina</h3>
                    <div className="space-y-2">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Monitoruesit e Shëndetit */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A67856] mb-3 uppercase tracking-wide">Monitoruesit e Shëndetit</h3>
                    <div className="space-y-2">
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
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
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
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Shop;
