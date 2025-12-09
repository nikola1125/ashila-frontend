import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { CartContext } from '../../Context/Cart/CartContext';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Facebook, Twitter, Mail } from 'lucide-react';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('90GR'); // Default size

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await publicApi.get(`/medicines/${id}`);
      return response;
    },
    enabled: !!id,
  });

  const handleQuantityChange = useCallback((delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    // Add item quantity times
    for (let i = 0; i < quantity; i++) {
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
        size: selectedSize,
      });
    }
  }, [product, quantity, selectedSize, addItem]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    handleAddToCart();
    navigate('/cart');
  }, [product, handleAddToCart, navigate]);

  if (isLoading) return <DataLoading label="Product" />;
  if (error) return <LoadingError label="Product" />;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  const discountedPrice = product.discount > 0
    ? Number(product.price) * (1 - Number(product.discount) / 100)
    : Number(product.price);

  const isInStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{product.itemName} - Product Details</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-32 md:pt-40 pb-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Left Column - Product Image */}
          <div className="relative bg-white rounded-sm overflow-hidden">
            {/* Product Image */}
            <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-4 sm:p-6 md:p-8">
              <img
                src={product.image || '/placeholder.png'}
                alt={product.itemName}
                className="max-w-full max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-contain w-full h-auto"
                onError={(e) => {
                  e.target.src = '/placeholder.png';
                }}
              />
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col">
            {/* Shop Name */}
            <p className="text-sm text-gray-500 mb-2 font-light">Ashila</p>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#4A3628] mb-2 break-words">{product.itemName}</h1>
            <div className="w-16 h-0.5 bg-[#A67856] mb-4"></div>

            {/* Price */}
            <div className="mb-4 sm:mb-6">
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-[#4A3628]">
                {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
              </span>
            </div>

            <div className="border-t border-[#D9BFA9] pt-6 mb-6"></div>

            {/* SIZE Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#4A3628] uppercase tracking-wide mb-2">
                SIZE
              </label>
              <div className="w-auto inline-block">
                <div className="px-3 py-2 border border-[#4A3628] bg-white text-[#4A3628] font-medium text-sm">
                  {selectedSize}
                </div>
              </div>
            </div>

            {/* QUANTITY Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#4A3628] uppercase tracking-wide mb-2">
                QUANTITY
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-[#4A3628] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                >
                  <Minus size={16} className="text-[#4A3628]" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                  className="w-16 h-10 text-center border border-[#4A3628] focus:outline-none bg-white text-[#4A3628] font-medium"
                  min="1"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={!isInStock}
                  className="w-10 h-10 flex items-center justify-center border border-[#4A3628] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                >
                  <Plus size={16} className="text-[#4A3628]" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {isInStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-white hover:bg-[#EBD8C8] text-[#4A3628] px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-200 border border-[#4A3628] uppercase tracking-wide text-sm sm:text-base min-h-[44px]"
                  >
                    Add to cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-[#A67856] hover:bg-[#8B6345] text-white px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-200 uppercase tracking-wide text-sm sm:text-base min-h-[44px]"
                  >
                    Buy it now
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 px-4 sm:px-6 py-3 sm:py-4 font-medium cursor-not-allowed min-h-[44px]"
                >
                  Sold out
                </button>
              )}
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.076-.312.286-.465.713-1.227.95-1.878.098-.35.595-2.394.595-2.394s.152.304.465.496c.435.287.936.46 1.526.46 2.01 0 3.38-1.843 3.38-4.31 0-1.87-1.577-3.174-3.832-3.174-2.602 0-4.198 1.928-4.198 3.922 0 1.152.44 2.17 1.561 2.553.174.071.334.041.384-.107.036-.137.124-.48.163-.656.053-.204.033-.275-.115-.455-.323-.38-.53-.873-.53-1.57 0-2.03 1.54-3.894 4.01-3.894 2.105 0 3.636 1.503 3.636 3.505 0 2.33-1.464 4.296-3.64 4.296-.712 0-1.387-.37-1.617-.863 0 0-.352 1.34-.436 1.67-.158.609-.586 1.37-.872 1.833A11.98 11.98 0 0 0 12 19z"/>
                  </svg>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(product.itemName)}&body=${encodeURIComponent(window.location.href)}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="border-t border-[#D9BFA9] pt-8">
          <h2 className="text-xl font-semibold text-[#4A3628] mb-4">Description</h2>
          <div className="prose max-w-none text-[#4A3628] leading-relaxed">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>
                {product.genericName && (
                  <>
                    <strong>Generic Name:</strong> {product.genericName}
                    <br />
                  </>
                )}
                {product.company && (
                  <>
                    <strong>Company:</strong> {product.company}
                    <br />
                  </>
                )}
                {product.category?.categoryName && (
                  <>
                    <strong>Category:</strong> {product.category.categoryName}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;

