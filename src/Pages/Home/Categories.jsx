import React, { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';

// Mock categories data for development
const mockCategories = [
  {
    _id: '1',
    categoryName: 'Kujdesi ndaj fytyres',
    categoryImage: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
    description: 'Face care products',
    medicinesCount: 45
  },
  {
    _id: '2',
    categoryName: 'Trupi dhe floke',
    categoryImage: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop',
    description: 'Body and hair care products',
    medicinesCount: 32
  },
  {
    _id: '3',
    categoryName: 'Nena dhe femija',
    categoryImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop',
    description: 'Mother and child products',
    medicinesCount: 28
  },
];

const Categories = () => {
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        // Try to fetch from API
        return await publicApi.get('/categories');
      } catch (err) {
        console.log('API not available, using mock data');
        // Fallback to mock data if API is not available
        return mockCategories;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Handle API response - categories might be wrapped in an object
  const categoriesData = useMemo(() => {
    return Array.isArray(categories) ? categories : (categories?.data || categories?.result || []);
  }, [categories]);

  const handleCategoryClick = useCallback((categoryName) => {
    navigate(`/details?category=${categoryName}`);
  }, [navigate]);

  if (isLoading) {
    return <DataLoading label="Categories" />;
  }

  if (error) {
    console.error('API error:', error);
    return <LoadingError label="categories" />;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Medicine Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of medical categories. Find the
            right medicines and healthcare products for your needs.
          </p>
        </div>

        {/* Categories Grid */}
        {categoriesData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoriesData?.map((category) => (
              <div
                key={category._id || category.id}
                className="group cursor-pointer transform transition-all duration-300 scale-95 hover:scale-100"
              >
                <div className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-2 border-[#d4d4c4] overflow-hidden relative">
                  {/* Category Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {category.categoryImage && (
                      <img
                        src={category.categoryImage}
                        alt={category.categoryName}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20"></div>
                    <h3 className="absolute bottom-4 left-4 right-4 text-lg font-semibold text-white drop-shadow-lg">
                      {category.categoryName}
                    </h3>
                  </div>

                  {/* Category Details */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description ||
                        `Browse our collection of ${category?.categoryName.toLowerCase()} medicines and healthcare products.`}
                    </p>

                    {/* Category Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        Available
                      </span>
                      {category.medicinesCount && (
                        <span className="bg-[#faf9f6] text-[#946259] px-2 py-1 text-xs font-medium border-2 border-[#d4d4c4]">
                          {category.medicinesCount} products
                        </span>
                      )}
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleCategoryClick(category.categoryName)}
                      className="w-full bg-[#946259] hover:bg-[#7a4f47] text-white py-2.5 text-sm font-semibold transition-all duration-150 border-2 border-[#946259] uppercase tracking-wide"
                    >
                      View Details
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Categories Available
            </h3>
            <p className="text-gray-600">
              Categories will appear here once they are added to the system.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white shadow-md border-2 border-[#d4d4c4] p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#946259] mb-4 uppercase tracking-wide">
              Need Help Finding the Right Medicine?
            </h3>
            <p className="text-[#2c2c2c] mb-6">
              Our healthcare experts are here to help you find the perfect
              medicine for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#946259] text-white px-6 py-3 font-semibold hover:bg-[#7a4f47] transition-all duration-200 border-2 border-[#946259] uppercase tracking-wide">
                Contact Support
              </button>
              <button className="bg-white text-[#946259] border-2 border-[#946259] px-6 py-3 font-semibold hover:bg-[#faf9f6] transition-all duration-200 uppercase tracking-wide">
                Search Medicines
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
