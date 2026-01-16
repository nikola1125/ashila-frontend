import { useQuery } from '@tanstack/react-query';
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DetailsModal from '../../Components/Common/Medicines/DetailsModal';

import LoadingError from '../../Components/Common/States/LoadingError';
import EmptyArray from '../../Components/Common/States/EmptyArray';

import DataLoading from '../../Components/Common/Loaders/DataLoading';
import ShopTable from '../../Components/Tables/ShopTable';
import { Helmet } from 'react-helmet-async';
import { Search, X } from 'lucide-react';
import CategorySEO from '../../Components/Common/SEO/CategorySEO';

const CategoryDetails = () => {
  const { publicApi } = useAxiosSecure();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle page change
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // get all medicines in category for search functionality
  const { data, isLoading, error } = useQuery({
    queryKey: ['categoryMedicines', category],
    queryFn: () => publicApi.get(`/medicines/${category}`),
  });

  const allCategoryMedicines = useMemo(
    () => data?.result || [],
    [data?.result]
  );

  // Filter medicines based on search term
  const filteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return allCategoryMedicines;

    return allCategoryMedicines.filter(
      (medicine) =>
        medicine.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategoryMedicines, searchTerm]);

  // Calculate pagination for filtered results
  const totalFilteredItems = filteredMedicines.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  // Get paginated medicines from filtered results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMedicines = filteredMedicines.slice(startIndex, endIndex);

  // modal logic 👇
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const openModal = (medicine) => {
    setSelectedMedicine(medicine);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedMedicine(null);
  };
  // modal logic 👆

  return (
    <>
      <section className="min-h-[80vh] py-12 bg-gradient-to-br from-blue-50 via-white to-emerald-50 rounded-xl my-10">
        <CategorySEO
          categoryName={category}
          products={allCategoryMedicines}
          canonicalUrl={`https://www.farmaciashila.com/category-details?category=${category}`}
        />
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
              <span className="bg-gradient-to-r from-primary to-secondary p-3 rounded-full shadow-lg">
                {/* You can use a relevant icon here if desired */}
                <svg
                  className="text-white w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm text-center">
                {category}
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl text-center">
              Browse, compare, and purchase medicines in the{' '}
              <span className="font-semibold text-primary">{category}</span>{' '}
              category. Find trusted options tailored to your needs.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search medicines, companies, or generic names..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
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
            {searchTerm && (
              <p className="text-center text-sm text-gray-600 mt-2">
                Found <span className="lux-price-number">{totalFilteredItems}</span> result
                {totalFilteredItems !== 1 ? 's' : ''} for "{searchTerm}" in{' '}
                {category}
              </p>
            )}
          </div>

          {/* Loading state */}
          {isLoading && <DataLoading label={`medicines in ${category}`} />}

          {/* Error state */}
          {error && (
            <LoadingError
              label={`medicines in ${category}`}
              showAction={true}
            />
          )}

          {/* Empty state */}
          {!isLoading && !error && paginatedMedicines.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? 'No medicines found'
                    : `No medicines available in ${category}`}
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? `Try adjusting your search term "${searchTerm}" or browse all medicines in ${category}.`
                    : 'Check back later for new medicines in this category.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main content */}
          {!isLoading && !error && paginatedMedicines.length > 0 && (
            <ShopTable
              paginatedMedicines={paginatedMedicines}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={goToPage}
              handleItemsPerPageChange={handleItemsPerPageChange}
              openModal={openModal}
            />
          )}
        </div>
        <DetailsModal
          isOpen={isOpen}
          close={closeModal}
          medicine={selectedMedicine}
        />
      </section>
    </>
  );
};

export default CategoryDetails;
