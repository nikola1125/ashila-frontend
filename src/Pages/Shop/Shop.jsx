import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import LoadingError from '../../Components/Common/States/LoadingError';
import { Grid3X3, List, Search, X, Filter } from 'lucide-react';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import ShopTable from '../../Components/Tables/ShopTable';
import ShopGrid from '../../Components/Grid/ShopGrid';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const Shop = () => {
  const location = useLocation();
  const { publicApi } = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true); // Visible on desktop, hidden on mobile

  // Filter states
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);

  // Mock filter data (based on screenshot)
  const filterOptions = {
    problematica: [
      { id: 'akne', label: 'Akne', count: 82 },
      { id: 'balancim-yndyre', label: 'Balancim yndyre/pore evidente', count: 54 },
      { id: 'dehidratim', label: 'Dehidratim', count: 65 },
      { id: 'hiperpigmentim', label: 'Hiperpigmentim', count: 64 },
      { id: 'pikat-zeza', label: 'Pikat e zeza', count: 23 },
      { id: 'rosacea', label: 'Rosacea', count: 29 },
      { id: 'rrudha', label: 'Rrudha', count: 39 },
      { id: 'skuqje', label: 'Skuqje', count: 48 },
    ],
    skinTypes: [
      { id: 'e-thate', label: 'Lëkurë e thatë', count: 76 },
      { id: 'mikse-yndyrshme', label: 'Lëkurë mikse / e yndyrshme', count: 132 },
      { id: 'normale', label: 'Lëkurë normale', count: 84 },
      { id: 'sensitive', label: 'Lëkurë sensitive', count: 78 },
      { id: 'te-gjitha', label: 'Të gjitha tipet e lëkurës', count: 138 },
    ],
    productTypes: [
      { id: 'acide', label: 'Acide', count: 37 },
      { id: 'acne-patches', label: 'Acne patches', count: 2 },
      { id: 'eye-patches', label: 'Eye patches', count: 4 },
      { id: 'hidratues', label: 'Hidratues', count: 59 },
      { id: 'hidratues-trupi', label: 'Hidratues trupi', count: 3 },
      { id: 'krem-dielli', label: 'Krem dielli', count: 51 },
      { id: 'krem-sysh', label: 'Krem sysh', count: 15 },
      { id: 'lare-intim', label: 'Larës Intim', count: 2 },
      { id: 'lare-trupi', label: 'Larës trupi', count: 2 },
      { id: 'lare-ujor', label: 'Larës ujor', count: 28 },
      { id: 'lare-vajor', label: 'Larës vajor', count: 13 },
      { id: 'lipbalm', label: 'Lipbalm', count: 4 },
      { id: 'maske', label: 'Maskë', count: 13 },
      { id: 'retinoide', label: 'Retinoide', count: 8 },
      { id: 'serum', label: 'Serum', count: 23 },
      { id: 'set-produkte', label: 'Set me produkte', count: 1 },
      { id: 'shampo-flokesh', label: 'Shampo flokësh', count: 10 },
      { id: 'spf-trupi', label: 'SPF trupi', count: 2 },
      { id: 'spot-treatment', label: 'spot treatment', count: 1 },
      { id: 'suplement', label: 'Suplement', count: 12 },
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
  }, [allMedicines, searchTerm, sortBy, selectedProblems, selectedSkinTypes, selectedProductTypes]);

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
      <section className="min-h-[80vh] py-4 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Shop</h1>
            <p className="text-sm sm:text-base text-gray-600">Discover our products</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Sidebar - Filters */}
            {/* Mobile Filter Overlay */}
            {showFilters && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
            )}
            
            <aside className={`${
              showFilters 
                ? 'fixed lg:relative inset-y-0 left-0 lg:inset-auto w-80 lg:w-64 z-50 lg:z-auto' 
                : 'hidden lg:block lg:w-64'
            } transition-all duration-300 overflow-hidden flex-shrink-0`}>
              <div className="bg-white border border-[#d4d4c4] p-4 h-full lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] overflow-y-auto">
                  {/* Mobile Close Button */}
                  <div className="flex items-center justify-between mb-4 lg:hidden">
                    <h2 className="text-lg font-semibold text-[#946259] uppercase tracking-wide">Filters</h2>
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
                    <h3 className="text-sm font-semibold text-[#946259] mb-3 uppercase tracking-wide">Klasifiko sipas</h3>
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full px-3 py-2 border-2 border-[#d4d4c4] text-sm focus:outline-none focus:ring-2 focus:ring-[#946259] focus:border-[#946259] bg-white text-[#2c2c2c]"
                    >
                      <option value="alphabetical">Alphabetically, A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Problematika */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#946259] mb-3 uppercase tracking-wide">Problematika</h3>
                    <div className="space-y-2">
                      {filterOptions.problematica.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center justify-between cursor-pointer hover:bg-[#faf9f6] p-1"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedProblems.includes(option.id)}
                              onChange={() => toggleFilter('problem', option.id)}
                              className="w-4 h-4 text-[#946259] border-2 border-[#946259] focus:ring-[#946259]"
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
                    <h3 className="text-sm font-semibold text-[#946259] mb-3 uppercase tracking-wide">Tipi i lëkurës</h3>
                    <div className="space-y-2">
                      {filterOptions.skinTypes.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center justify-between cursor-pointer hover:bg-[#faf9f6] p-1"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSkinTypes.includes(option.id)}
                              onChange={() => toggleFilter('skinType', option.id)}
                              className="w-4 h-4 text-[#946259] border-2 border-[#946259] focus:ring-[#946259]"
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Lloji i produktit</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filterOptions.productTypes.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center justify-between cursor-pointer hover:bg-[#faf9f6] p-1"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedProductTypes.includes(option.id)}
                              onChange={() => toggleFilter('productType', option.id)}
                              className="w-4 h-4 text-[#946259] border-2 border-[#946259] focus:ring-[#946259]"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Search and View Toggle */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-10 py-2 border border-[#d4d4c4] focus:ring-2 focus:ring-[#946259] focus:border-[#946259] text-sm bg-white text-[#2c2c2c]"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 border border-[#d4d4c4] hover:bg-[#faf9f6] lg:hidden"
                    title="Toggle filters"
                    aria-label="Toggle filters"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                  <div className="flex bg-[#faf9f6] border border-[#d4d4c4] p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-2 sm:px-3 py-1 text-sm transition-all ${
                        viewMode === 'grid'
                          ? 'bg-[#946259] text-white'
                          : 'text-[#946259] hover:bg-[#b07a6f]'
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2 sm:px-3 py-1 text-sm transition-all ${
                        viewMode === 'list'
                          ? 'bg-[#946259] text-white'
                          : 'text-[#946259] hover:bg-[#b07a6f]'
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              {searchTerm && (
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Found {totalFilteredItems} result{totalFilteredItems !== 1 ? 's' : ''} for "{searchTerm}"
                </p>
              )}

              {/* Products */}
              {paginatedMedicines.length === 0 ? (
                <div className="text-center py-12 bg-[#faf9f6] border-2 border-[#d4d4c4]">
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
                <>
                  {viewMode === 'list' ? (
                    <ShopTable
                      paginatedMedicines={paginatedMedicines}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      goToPage={goToPage}
                      handleItemsPerPageChange={handleItemsPerPageChange}
                    />
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Shop;
