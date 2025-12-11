import React, { useContext, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/Cart/CartContext';

const LatestProduct = () => {
  const { publicApi } = useAxiosSecure();
  const navigate = useNavigate();
  const { addItem } = useContext(CartContext);

  const { data, isLoading, error } = useQuery({
    queryKey: ['latestProducts'],
    queryFn: async () => {
      try {
        const response = await publicApi.get('/medicines/latest');
        const arr = Array.isArray(response) ? response : (response?.medicines || response?.result || response || []);
        return arr;
      } catch (err) {
        console.warn('Latest products API not available, returning empty array');
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - will use default refetchOnMount
  });

  const latestProducts = useMemo(() => data || [], [data]);

  const handleAddToCart = useCallback((product) => {
    addItem({
      id: product._id,
      name: product.itemName,
      price: product.price,
      discountedPrice: product.discount > 0
        ? (Number(product.price) * (1 - Number(product.discount) / 100)).toFixed(2)
        : null,
      image: product.image,
      company: product.company,
      genericName: product.genericName,
      discount: product.discount || 0,
      seller: product.seller,
    });
  }, [addItem]);

  const handleShopNow = useCallback(() => {
    navigate('/shop');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
        <span className="ml-2 text-lg text-gray-700">Loading latest products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">
          Error loading latest products: {error.message}
        </p>
      </div>
    );
  }

  if (!latestProducts || latestProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No latest products available</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our newest arrivals and stay updated with the latest
            products in our collection
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {latestProducts?.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border-2 border-[#D9BFA9]"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.itemName}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
              </div>
              <div className="p-2">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 text-xs">
                  {product.itemName}
                </h3>
                <p className="text-gray-600 text-xs mb-2 line-clamp-1">
                  {product.description || product.genericName || ''}
                </p>
                <div className="flex justify-between items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {product.price?.toLocaleString()} ALL
                  </span>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-[#A67856] hover:bg-[#8B6345] text-white px-2 py-1 text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1 flex-shrink-0 border-2 border-[#A67856]"
                  >
                    <ShoppingBag size={12} />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={handleShopNow}
            className="bg-[#A67856] text-white px-8 py-3 font-bold hover:bg-[#8B6345] transition-all duration-200 shadow-md hover:shadow-lg border-2 border-[#A67856] uppercase tracking-wider"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default LatestProduct;
